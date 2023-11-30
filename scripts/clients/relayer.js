const { ethers } = require("hardhat")
const axios = require('axios')
require('dotenv').config()
const DataManagementContract = process.env.DMC_ADDR;

async function relayer() {
    //Get a wss provider
    const provider = new ethers.WebSocketProvider(
      `wss://wss.calibration.node.glif.io/apigw/lotus/rpc/v1`
    );
    const factory = await ethers.getContractFactory("DataManagement", provider);
    const dmContract = factory.attach(DataManagementContract);

    dmContract.on("BlobLoadReq", async (correlationId, cid, reward, timeout)=>{
        let evenInfo = {
          correlationId: Number(correlationId),
          cid: cid,
          reward: ethers.formatUnits(reward),
          timeout: ethers.formatUnits(timeout)
        };
        console.log(JSON.stringify(evenInfo, null, 4));

        const ipfsURL = "https://ipfs.io/ipfs/f" + cid.substring(4);;
        console.log(ipfsURL);
        res = await axios.get(ipfsURL);
        console.log(res.data);

        //convert Json object to bytes
        const jsonString = JSON.stringify(res.data);
        const hexString = uint8ArrayToHex(Buffer.from(jsonString));
        console.log('HexString:', hexString);
    })
}

function uint8ArrayToHex(uint8Array) {
  return Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

relayer();