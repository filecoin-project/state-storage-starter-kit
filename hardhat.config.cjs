require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require('dotenv').config();
const WalletPK = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [
          {version: "0.8.20",},
          {version: "0.8.19",},
        ],
      },
    defaultNetwork: "calibration",
    networks: {
        filecoin: {
            chainId: 314,
            url: "https://api.node.glif.io/rpc/v1",
            accounts: [WalletPK]
        },
        calibration: {
            chainId: 314159,
            url: "https://api.calibration.node.glif.io/rpc/v1",
            accounts: [WalletPK]
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
    mocha: {
        timeout: 600000
      }
}