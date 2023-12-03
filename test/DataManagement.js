import { expect } from "chai";
import hre from "hardhat";
import CID from "cids";

describe("DataManagement", function () {
    let dmContract, signer;

    //deploy the smart contract first
    before(async function () {
        const dmcFactory = await ethers.getContractFactory("DataManagement");
        dmContract = await dmcFactory.deploy();
        await dmContract.waitForDeployment();
        console.log("contact address is ", dmContract.getAddress());

        // get default signer, in Signer abstraction form
        signer = ethers.provider.getSigner(0);
    })

    describe("requestBlobLoad", function () {
        it("Should accept a valid load request ", async function () {
            const cid = 'bafkreickvqlzvxbd7xwxsi6ntudleblwg7id7yw2tux3zvnh5nmuop3lja';
            
            await expect(dmContract.requestBlobLoad(
                            cidToBytes(cid), ethers.parseUnits("1"), ethers.parseUnits("1")))
                .to.emit(dmContract)
                .withArgs(cidToBytes(cid), ethers.parseUnits("1"), ethers.parseUnits("1"))
        });
    });

});

function cidToBytes(cid){
    const cidHexRaw = new CID(cid).toString('base16').substring(1)
    const cidHex = "0x00" + cidHexRaw
    return cidHex;
}