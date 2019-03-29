# Nimiq OpenCL GPU Mining Client for AMD and Nvidia Cards
[![Github All Releases](https://img.shields.io/github/downloads/Sushipool/nimiq-opencl-miner/total.svg)]()

High-performance Nimiq GPU mining client that provides a fully open source codebase, optimized hash rate, nano protocol, multi GPU support, and a **0%** Dev fee.
## Quickstart (Ubuntu/Debian)

1. Install [Node.js](https://github.com/nodesource/distributions/blob/master/README.md#debinstall).
2. Install `git` and `build-essential`: `sudo apt-get install -y git build-essential`.
3. Install `opencl-headers`: `sudo apt-get install opencl-headers`.
4. Install OpenCL-capable drivers for your GPU ([Nvidia](https://www.nvidia.com/Download/index.aspx) or [AMD](https://www.amd.com/en/support))
5. Clone this repository: `git clone https://github.com/Sushipool/nimiq-opencl-miner`.
6. Build the project: `cd nimiq-opencl-miner && npm install`.
7. Copy sushipool.sample.conf to sushipool.conf: `cp miner.sample.conf miner.conf`.
8. Edit sushipool.conf, specify your wallet address.
9. Run the miner `UV_THREADPOOL_SIZE=8 nodejs index.js`. Ensure UV_THREADPOOL_SIZE is higher than a number of GPU in your system.

## HiveOS Mining FlightSheet
Use the following FlightSheet settings to start mining Nimiq with HiveOS.
![HiveOS](https://github.com/Sushipool/nimiq-opencl-miner/blob/master/hiveos-flightsheet.png?raw=true)


## Developer Fee
This client offers a **0%** Dev Fee!

## Nimiq GPU Support
Nvidia TITAN Xp, Titan X, GeForce GTX 1080 Ti, GTX 1080, GTX 1070 Ti, GTX 1070, GTX 1060, GTX 1050 Ti, GTX 1050, GT 1030, MX150 , Quadro P6000, Quadro P5000, Quadro P4000, Quadro P2000, Quadro P1000, Quadro P600, Quadro P400, Quadro P5000(Mobile), Quadro P4000(Mobile), Quadro P3000(Mobile)     Tesla P40, Tesla P6, Tesla P4 ,  NVIDIA TITAN RTX, GeForce RTX 2080 Ti, RTX 2080, RTX 2070, RTX 2060     Quadro RTX 8000, Quadro RTX 6000, Quadro RTX 5000, Quadro RTX 4000

## Drivers Requirements
Nvidia: Please update to the latest Nvidia Cuda 10 drivers.

AMD: Version 18.10 is recommended to avoid any issues.

## Mining Parameters

```
Parameter       Description                                            Data Type

address         Nimiq wallet address                                    [string]
                Example: "address": "NQ...",

host            Pool server address
                Example: "host": "eu.sushipool.com"                     [string]
                
port            Pool server port
                Example: "port": "443"
                Default: 443                                            [number]

consensus       Consensus method used
                Possible values are "dumb" or "nano"
                Note that "dumb" mode (i.e. no consensus) only works with SushiPool.
                Example: "consensus": "nano"                            [string]
                
name            Device name to show in the dashboard                    [string]
                Example: "name": "My Miner"
                
hashrate        Expected hashrate in kH/s                               [number]
                Example: "hashrate": 100
                
devices         GPU devices to use
                Example: "devices": [0,1,2]
                Default: All available GPUs                              [array]
                
memory          Allocated memory in Mb for each device
                Example: "memory": [3072,3840,3840,3840]                 [array]
                
threads         Number of threads per GPU
                Example: "threads": [1,1,2,2]
                Default: 1                                               [array]
```

### Links
Website: https://sushipool.com

Discord: https://discord.gg/JCCExJu

Telegram: https://t.me/SushiPool

Releases: https://github.com/Sushipool/nimiq-opencl-miner/releases
