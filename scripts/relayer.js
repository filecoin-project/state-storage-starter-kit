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

//Get a wss provider
const provider = new ethers.WebSocketProvider(
  `wss://wss.calibration.node.glif.io/apigw/lotus/rpc/v1`);

//create the contract instance
const wallet = new ethers.Wallet(WalletPK, provider);

async function relayer() {
    const factory = await ethers.getContractFactory("DataManagement", wallet);
    const dmContract = factory.attach(DataManagementContract);
    dmContract.once("BlobLoadReq", async (correlationId, cidHexRaw, reward, timeout)=>{
        let evenInfo = {
          correlationId: Number(correlationId),
          cid: cidHextoCid(cidHexRaw),
          reward: ethers.formatUnits(reward),
          timeout: ethers.formatUnits(timeout)
        };
        console.log("Event log:", JSON.stringify(evenInfo, null, 4));
        const reqStatus = await dmContract.requestStatus(evenInfo.correlationId);

        // Get CID codec to determine what data it represents
        let cidInstance = new CID(cidHextoCid(cidHex));
        const cidCodec = cidInstance.toJSON().codec;

        //Process the retrieve request when it is still pending
        if(reqStatus == 1){
          const data = uint8ArrayConcat(await all(client.cat(evenInfo.cid)));

          if(cidCodec == 'raw'){
            //convert data to bytes for calling develerBlob
            const payloadHex = "0x" + uint8ArrayToHex(data);
            console.log('payloadHex:', payloadHex);

            //call smart contract to send payload data
            const tx = await dmContract.deliverBlob(correlationId, payloadHex);
            await tx.wait();
            console.log(tx.hash, " is confirmed on Chain.");
          }
          else if(cidCodec == 'dag-pb'){
            console.log("this is a fs. still working in progress.");
            // the CID match will failed by only sha256(payloadHex)
            // TODO: need to figure out how to verify CID again content.
          }
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