# State/Storage Integration PoC

Before diving into coding, it is essential to take a few minutes to understand the concept and design behind this Proof of Concept (PoC) by reviewing the provided [specification](https://www.notion.so/pl-strflt/State-Storage-Integration-PoC-For-EthIndia-ced01e085c0d49369c086b21e8017f1b).

**Key Components**:

- **Client/application**

  - send the request to Data Management Contract (DMC) to retrieve content from IPFS for consumption.
  - continue any process in smart contract once the content is served to Data Management Contract by relayer.

- **Data Management Contract (DMC)**

  The main functions of DMC includes:

  - taking retrieval requests from client/application
  - temporarily storing data severed by Relayer from IPFS
  - serving data back to client/application to continue their process

- **Relayer**: 

  listen the event logs emitted from Data Management Contract. If there is a IPFS content request event log - `BlobLoadReq`, relayer will retrieve content from IPFS and send it to Data management Contract. 

![workflow](./workflow.png)

This repository contains the Data Management Contract,  minimal functions of client/application and relayer. Its purpose is to demonstrate the end-to-end workflow of this Proof of Concept (PoC). 

You are welcome to enhance this PoC by adding more features and building products that consume the IPFS data served in the smart contract.

## Project Structure

The repository is organized as follows:

- `contracts/`: This directory contains the Data Management Contract (DMC).

- `scripts/`: This directory houses scripts used for deploying the DMC smart contract, and scripts to simulate the functions of client and relayer.
  - `dmc/`: the scripts to deployer Data Management Contract on Filecoin.

  - `client/`: the scripts to simulate the function from client/application, including sendDataRetrieve Request, check the status of the retrieve request and continue the data process after receiving data on IPFS.

  - `relayer.js`: simulate the minimal function of a relayer to listen the event, retrieve content from IPFS and send the data to Data Management Contract.

- `test/`: This directory contains test files for the contracts. 

## Getting Started
> **Note**
> Before getting started, we are going to need a local IPFS node to serve content. Make sure you install a [IPFS Desktop App](https://docs.ipfs.tech/install/ipfs-desktop/) in your local computer.

To get started with the project, follow these steps:

1. Clone the repository

   ```shell
   git clone https://github.com/longfeiWan9/data-management-contract.git
   ```

2. Install the project dependencies

   ```shell
   cd data-management-contract
   npm install
   ```
   Create an `.evn` file in the project so you can add your wallet key and contract address in there for this project to use.  Make sure you have enough tFIL in your wallet for testing.
   ```shell
   PRIVATE_KEY=<your-wallet-key>
   DMC_ADDR=<your-dataManagementContract-address>
   ```

3. Deploy the Data Management Contract

   You can also test the contract  to verify the functionality of the contracts before deploying it

   ```
   npx hardhat test
   ```

   Let's deploy the data management contract to the Filecoin calibration network.

   ```
   npx hardhat run scripts/deploy.js --networks calibration
   ```
   Copy the smart contract address and add it in your `.env` file. 

4. Run the relayer demon 

   Relayer will listen the `BlobLoadReq` event from the Data Management Contract. 

   ```
   npx hardhat run scripts/relayer.js
   ```

5. Simulate client to send a request to load a NFT metadata json file from IPFS.

   > **Note**
   > In this PoC, we only consider processing the request to retrieve small data from IPFS, such as a metaData.json.

   You need to add your CID in the `scripts/client/sendRequest.js` . 

   ```
   const cid = '<replace the CID you want to retrive from IPFS>';
   ```

   Then run the `scripts/client/sendRequest.js` to send the request to the Data Management Contract. Once the transaction is executed on chain, a `LoadBlobReq` even will be emitted carrying a `correlationId` and `cidHex`.

   ```shell
   $ npx hardhat run scripts/client/sendRequest.js
   
   0xb1ed3d8944953e9217d4f22d80ce5400e1727e7b62662010bd63fb193f0c3c32
   requestBlobLoad transaction is confirmed on Chain.
   Event args 4,0x00015512204aac179adc23fded7923cd9d06b2057637d03fe2da9d2fbcd5a7eb59473f6b48,1000000000000000000,1000000000000000000
   ```

6. Relayer will capture the `LoadBlobReq` event and process the request

   Once there is a `BlobLoadReq` emitted, relayer will 

   - read the CID in the log 
   - fetch the content from IPFS node
   - send it to Data Management Contract for this request 

7. Once the data process is finished, clients can check the status of their request.

   In step-5, there is a `correlationId` being emitted and it represent your request in the smart contract. So we can use it to check the status of the client's request. 
   In `script/client/checkRequestStatus.js `, add the `correlationId` from step-5 and run the script to check the status of your request.

   ```shell
   $ npx hardhat run scripts/client/checkRequestStatus.js
   
   Request status:  1
   Requested CID:  bafkreickvqlzvxbd7xwxsi6ntudleblwg7id7yw2tux3zvnh5nmuop3lja
   ```

8. After client's data is served in smart contract, client can call `resume` function to continue the process which requires data inside the smart contract.

   In `resume` function, data can be re-send to another smart contract to process using `delegateCall`.  It's up to builders to build more logic here to handle their own unique use case.


## Contributing

Contributions to the project are welcome! If you find any issues, have suggestions for improvements, or would like to add new features, please feel free to open an issue or submit a pull request. Make sure to follow the established coding conventions and provide clear descriptions for your contributions.

## License

The project is available under the [MIT License](LICENSE). Feel free to use, modify, and distribute the code as per the terms of the license.