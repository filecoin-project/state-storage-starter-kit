const { ethers } = require("hardhat")
const axios = require('axios')
require('dotenv').config()
const WalletPK = process.env.PRIVATE_KEY;
const DataManagementContract = process.env.DMC_ADDR;

async function sendData() {
    //create the contract instance
    const wallet = new ethers.Wallet(WalletPK, ethers.provider);
    const factory = await ethers.getContractFactory("DataManagement", wallet);
    const dmContract = factory.attach(DataManagementContract);

    //retrieve data from IPFS
    const cidHex = '0x00015512204aac179adc23fded7923cd9d06b2057637d03fe2da9d2fbcd5a7eb59473f6b48';
    const ipfsURL = "https://ipfs.io/ipfs/f" + cidHex.substring(4);;
    res = await axios.get(ipfsURL);
    console.log(res.data);

    //convert Json object to bytes
    const jsonString = JSON.stringify(res.data);
    const payloadHex = "0x" + uint8ArrayToHex(Buffer.from(jsonString));
    console.log('HexString:', payloadHex);

    //call smart contract to send payload data
    const tx = await dmContract.deliverBlob(1, payloadHex);
    console.log(tx.hash);
    const receipt = await tx.wait()
    // for (const event of receipt.events) {
    //   console.log(`Event ${event.event} with args ${event.args}`);
    // }
}

function uint8ArrayToHex(uint8Array) {
  return Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

sendData();