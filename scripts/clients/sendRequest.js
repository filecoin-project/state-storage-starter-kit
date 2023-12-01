import hre from "hardhat";
import CID from "cids";
import "dotenv/config";

const WalletPK = process.env.PRIVATE_KEY;
const DataManagementContract = process.env.DMC_ADDR;
let ethers = hre.ethers;

async function main() {
    //Get signer information
    const wallet = new ethers.Wallet(WalletPK, ethers.provider)
    console.log("Wallet Addresss is ", wallet.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(wallet.address)));

    const factory = await ethers.getContractFactory("DataManagement", wallet);
    const dmContract = factory.attach(DataManagementContract);

    const cid = 'bafkreickvqlzvxbd7xwxsi6ntudleblwg7id7yw2tux3zvnh5nmuop3lja';
    const tx = await dmContract.requestBlobLoad(
                cidToBytes(cid), 
                ethers.parseUnits("1"), 
                ethers.parseUnits("1")
            );
    console.log(tx.hash);
    const receipt = await tx.wait();
    console.log("requestBlobLoad transaction is confirmed on Chain.");
    for (const log of receipt.logs) {
      console.log(`Event args ${log.args}`);
    }
}

function cidToBytes(cid){
    const cidHexRaw = new CID(cid).toString('base16').substring(1)
    const cidHex = "0x00" + cidHexRaw
    return cidHex;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
});