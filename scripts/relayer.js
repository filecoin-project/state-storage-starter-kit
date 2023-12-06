import hre from "hardhat";
import CID from "cids";
import { create } from "kubo-rpc-client";
import all from "it-all";
import { concat as uint8ArrayConcat } from "uint8arrays/concat";
import "dotenv/config";

let ethers = hre.ethers;
const WalletPK = process.env.PRIVATE_KEY;
const DataManagementContract = process.env.DMC_ADDR;

// connect to the default API address http://localhost:5001
const client = create();

//create the contract instance
const wallet = new ethers.Wallet(WalletPK, ethers.provider);

async function relayer() {
    const factory = await ethers.getContractFactory("DataManagement", wallet);
    const dmContract = factory.attach(DataManagementContract);
    dmContract.on("BlobLoadReq", async (correlationId, cidHexRaw)=>{
        let evenInfo = {
          correlationId: Number(correlationId),
          cid: cidHextoCid(cidHexRaw)
        };
        console.log("Event log:", JSON.stringify(evenInfo, null, 4));
        const reqStatus = await dmContract.requestStatus(evenInfo.correlationId);

        // Get CID codec to determine what data it represents
        let cidInstance = new CID(evenInfo.cid);
        const cidCodec = cidInstance.toJSON().codec;
        let payloadHex = "0x";

        //Process the retrieve request when it is still pending
        if(reqStatus == 1){
          if(cidCodec == 'raw'){
            const data = uint8ArrayConcat(await all(client.cat(evenInfo.cid)));
            //convert data to bytes for calling develerBlob
            payloadHex += uint8ArrayToHex(data);
          }
          else if(cidCodec == 'dag-pb'){
            const resultP = await client.block.get(cidInstance);
            payloadHex += uint8ArrayToHex(resultP);
          }
          console.log('payloadHex:', payloadHex);

          //call smart contract to send payload data
          const tx = await dmContract.deliverBlob(correlationId, payloadHex);
          await tx.wait();
          console.log(tx.hash, " is confirmed on Chain.");
        }  
    })
}

function cidHextoCid(cidHex){
  const cidHex2 = 'f' + cidHex.substring(4);
  return new CID(cidHex2).toString('base32');
}

function uint8ArrayToHex(uint8Array) {
  return Array.from(uint8Array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

relayer();