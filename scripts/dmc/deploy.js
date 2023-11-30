require('dotenv').config();
const WalletPK = process.env.PRIVATE_KEY;

async function main() {

   //Connect to the wallet to sign and send transaction
  const wallet = new ethers.Wallet(WalletPK, ethers.provider);
  console.log("Deploying contracts with the account:", wallet.address);
  console.log("Wallet balance is ", ethers.formatEther(await ethers.provider.getBalance(wallet.address)));

  const contractInstance = await ethers.getContractFactory("DataManagement",wallet);
  const deployedContract = await contractInstance.deploy();
  console.log("Deploy contract tx is sent.");
  
  await deployedContract.waitForDeployment();
  console.log('Data Management Contract deployed to ', await deployedContract.getAddress());  
}
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });