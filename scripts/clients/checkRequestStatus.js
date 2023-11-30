const { ethers } = require("hardhat")
const axios = require('axios')
require('dotenv').config()
const WalletPK = process.env.PRIVATE_KEY;
const DataManagementContract = process.env.DMC_ADDR;
const correlationId = 8;

async function sendData() {
    //create the contract instance
    const wallet = new ethers.Wallet(WalletPK, ethers.provider);
    const factory = await ethers.getContractFactory("DataManagement", wallet);
    const dmContract = factory.attach(DataManagementContract);

    const status = await dmContract.requestStatus(correlationId);
    console.log("Request status: ", Number(status));

    const cid = await dmContract.requestedCid(correlationId);
    console.log("Requested CID: ",cid);

    if(status == 2){
      const payload = await dmContract.dataStore(correlationId);
      console.log(payload);
    }
}

sendData();