const os = require('os');
const pjson = require('./package.json');
const Nimiq = require('@nimiq/core');
const Utils = require('./src/Utils');
const NanoPoolMiner = require('./src/NanoPoolMiner');
const SushiPoolMiner = require('./src/SushiPoolMiner');
const crypto = require('crypto');
const Log = Nimiq.Log;

const TAG = 'Nimiq OpenCL Miner';
const $ = {};

Log.instance.level = 'info';

const config = Utils.readConfigFile('./miner.conf');
if (!config) {
    process.exit(1);
}

(async () => {
    const address = config.address;
    const deviceName = config.name || os.hostname();
    const hashrate = (config.hashrate > 0) ? config.hashrate : 100; // 100 kH/s by default
    const desiredSps = 5;
    const startDifficulty = (1e3 * hashrate * desiredSps) / (1 << 16);
    const minerVersion = 'OpenCL Miner ' + pjson.version;
    const deviceData = { deviceName, startDifficulty, minerVersion };

    Log.i(TAG, `Nimiq ${minerVersion} starting`);
    Log.i(TAG, `- pool server      = ${config.host}:${config.port}`);
    Log.i(TAG, `- address          = ${address}`);
    Log.i(TAG, `- device name      = ${deviceName}`);

    // if not specified in the config file, defaults to dumb to make LTD happy :)
    const consensusType = config.consensus || 'dumb'; 
    const setup = { // can add other miner types here
        'dumb': setupSushiPoolMiner,
        'nano': setupNanoPoolMiner
    }
    const createMiner = setup[consensusType];
    createMiner(address, config, deviceData);    

})().catch(e => {
    console.error(e);
    process.exit(1);
});

async function setupNanoPoolMiner(addr, config, deviceData) {
    Log.i(TAG, `Setting up NanoPoolMiner`);

    Nimiq.GenesisConfig.main();
    const networkConfig = new Nimiq.DumbNetworkConfig();
    $.consensus = await Nimiq.Consensus.nano(networkConfig);
    $.blockchain = $.consensus.blockchain;
    $.network = $.consensus.network;

    const deviceId = Nimiq.BasePoolMiner.generateDeviceId(networkConfig);
    Log.i(TAG, `- device id        = ${deviceId}`);

    const address = Nimiq.Address.fromUserFriendlyAddress(addr);
    $.miner = new NanoPoolMiner($.blockchain, $.network.time, address, deviceId, deviceData,
        config.devices, config.memory, config.threads);

    $.miner.on('share', (block, blockValid) => {
        Log.i(TAG, `Found share. Nonce: ${block.header.nonce}`);
    });
    $.miner.on('hashrates-changed', hashrates => {
        const totalHashRate = hashrates.reduce((a, b) => a + b, 0);
        Log.i(TAG, `Hashrate: ${Utils.humanHashrate(totalHashRate)} | ${hashrates.map((hr, idx) => `GPU${idx}: ${Utils.humanHashrate(hr)}`).filter(hr => hr).join(' | ')}`);
    });

    $.consensus.on('established', () => {
        Log.i(TAG, `Connecting to ${config.host}`);
        $.miner.connect(config.host, config.port);
    });
    $.consensus.on('lost', () => {
        $.miner.disconnect();
    });

    $.blockchain.on('head-changed', (head) => {
        if ($.consensus.established || head.height % 100 === 0) {
            Log.i(TAG, `Now at block: ${head.height}`);
        }
    });

    $.network.on('peer-joined', (peer) => {
        Log.i(TAG, `Connected to ${peer.peerAddress.toString()}`);
    });
    $.network.on('peer-left', (peer) => {
        Log.i(TAG, `Disconnected from ${peer.peerAddress.toString()}`);
    });

    Log.i(TAG, 'Connecting to Nimiq network');
    $.network.connect();
}

async function setupSushiPoolMiner(address, config, deviceData) {
    Log.i(TAG, `Setting up SushiPoolMiner`);

    const poolMining = {
        host: config.host,
        port: config.port
    }
    $.miner = new SushiPoolMiner(poolMining, address, deviceData.deviceName, deviceData, 
        config.devices, config.memory, config.threads);

    $.miner.on('connected', () => {
        Log.i(TAG,'Connected to pool');
    });

    $.miner.on('balance', (balance, confirmedBalance) => {
        Log.i(TAG,`Balance: ${balance}, confirmed balance: ${confirmedBalance}`);
    });

    $.miner.on('settings', (address, extraData, targetCompact) => {
        const difficulty = Nimiq.BlockUtils.compactToDifficulty(targetCompact);
        Nimiq.Log.i(SushiPoolMiner, `Set share difficulty: ${difficulty.toFixed(2)} (${targetCompact.toString(16)})`);
        $.miner.currentTargetCompact = targetCompact;
        $.miner.mineBlock(false);
    });

    $.miner.on('new-block', (blockHeader) => {
        const height = blockHeader.readUInt32BE(134);
        const hex = blockHeader.toString('hex');
        Log.i(TAG,`New block #${height}: ${hex}`);

        // Workaround duplicated blocks
        if ($.miner.currentBlockHeader != undefined
            && $.miner.currentBlockHeader.equals(blockHeader)) {
            Log.w(TAG,'The same block arrived once again!');
            return;
        }

        $.miner.currentBlockHeader = blockHeader;
        $.miner.mineBlock(true);
    });
    $.miner.on('disconnected', () => {
        $.miner._miner.stop();
    });
    $.miner.on('error', (reason) => {
        Log.w(TAG,`Pool error: ${reason}`);
    });
}