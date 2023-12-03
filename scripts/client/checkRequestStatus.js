import hre from 'hardhat';
import CID from "cids";
import "dotenv/config";
let ethers = hre.ethers;
const WalletPK = process.env.PRIVATE_KEY;
const DataManagementContract = process.env.DMC_ADDR;
const correlationId = <replace-this-with-your-correlationId>;
//const correlationId = 3;

async function sendData() {
    //create the contract instance
    const wallet = new ethers.Wallet(WalletPK, ethers.provider);
    const factory = await ethers.getContractFactory("DataManagement", wallet);
    const dmContract = factory.attach(DataManagementContract);

    const status = await dmContract.requestStatus(correlationId);
    console.log("Request status: ", Number(status));

    const cidHex = await dmContract.requestedCid(correlationId);
    console.log("Requested CID: ",cidHextoCid(cidHex));

    if(status == 2){
      const payload = await dmContract.dataStore(correlationId);
      console.log("payloadHex:", payload);
    }
}

function cidHextoCid(cidHex){
  const cidHex2 = 'f' + cidHex.substring(4);
  return new CID(cidHex2).toString('base32');
}

sendData();