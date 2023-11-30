const { ethers } = require("hardhat")
const axios = require('axios')
require('dotenv').config()
const WalletPK = process.env.PRIVATE_KEY;
const DataManagementContract = process.env.DMC_ADDR;

//Get a wss provider
const provider = new ethers.WebSocketProvider(
  `wss://wss.calibration.node.glif.io/apigw/lotus/rpc/v1`);

//create the contract instance
const wallet = new ethers.Wallet(WalletPK, provider);

async function relayer() {
    const factory = await ethers.getContractFactory("DataManagement", wallet);
    const dmContract = factory.attach(DataManagementContract);
    dmContract.once("BlobLoadReq", async (correlationId, cid, reward, timeout)=>{
        let evenInfo = {
          correlationId: Number(correlationId),
          cid: cid,
          reward: ethers.formatUnits(reward),
          timeout: ethers.formatUnits(timeout)
        };
        console.log("Event log:", JSON.stringify(evenInfo, null, 4));
        const reqStatus = await dmContract.requestStatus(evenInfo.correlationId);

        //Process the retrieve request if it is still pending
        if(reqStatus ==1){
          const ipfsURL = "https://ipfs.io/ipfs/f" + cid.substring(4);;
          //TODO: use kubo to get data.
          res = await axios.get(ipfsURL);
          console.log("Data from IPFS:", res.data);

          //convert Json object to bytes for calling develerBlob
          const jsonString = JSON.stringify(res.data);
          const payloadHex = "0x" + uint8ArrayToHex(Buffer.from(jsonString));
          console.log('payloadHex:', payloadHex);

          //call smart contract to send payload data
          const tx = await dmContract.deliverBlob(correlationId, payloadHex);
          console.log();
          console.log(tx.hash, " is confirmed on Chain.");
        }
        
    })
}

function uint8ArrayToHex(uint8Array) {
  return Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

relayer();