// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

enum Result { OK, ERR, TIMEOUT, CANCELLED }
enum RequestStatus { None, Pending, Completed }

interface BlobLoader {
    function deliverBlob(uint256 correlationId, bytes memory payload) external;

    function retrieve(uint256 correlationId) external returns (bytes memory);
}

contract DataManagement is BlobLoader{
    uint256 private _correlationId;
    mapping(uint256 => bytes) public requestedCid;
    mapping(uint256 => RequestStatus) public requestStatus; // correlationId <-> requestStatus
    mapping(uint256 => bytes) public dataStore; // correlationId <-> dataStore

    constructor() {
        _correlationId = 0;
    }

    event BlobLoadReq(uint256 correlationId, bytes cid, uint256 reward, uint64 timeout);
    event BlobLoadRes(uint256 correlationId, Result result);
    event DataRetrieved(uint256 correlationId, bytes cid);
        
    /**
     * To request data from IPFS.
     * caller: client's smart contract
     * Client send a request to retrieval data from IPFS.
     */ 
    function requestBlobLoad(bytes memory cid, uint256 reward, uint64 timeout) external {
        _correlationId +=1;
        requestedCid[_correlationId] = cid;
        requestStatus[_correlationId] = RequestStatus.Pending;
        emit BlobLoadReq(_correlationId, cid, reward, timeout);
    }

    /**
     * Send the data, which is fetched from IPFS, into this smart contact
     * caller: relayer
     * store data and emit an BlobLoadRes event
     */ 
    function deliverBlob(uint256 correlationId, bytes memory payload) external {
        require(requestStatus[correlationId] == RequestStatus.Pending, "Request not pending");
        bytes memory cid = requestedCid[correlationId];
        // Additional check for CID match (some pseudo-code here could look like)
        require(_checkCidMatch(payload, cid), "CID mismatch");

        dataStore[correlationId] = payload;
        requestStatus[correlationId] = RequestStatus.Completed;
        emit BlobLoadRes(correlationId, Result.OK);
    }

    /**
     * Once relayer delivered the payload to contract, client can resume an operation which use the data stored on IPFS.
     * caller: client smart contract
     * send data to caller smart contract by delegateCall.
     */ 
    function retrieve(uint256 correlationId) external returns (bytes memory){
        require(requestStatus[correlationId] == RequestStatus.Completed, "Request not completed");

        bytes memory dataPayload = dataStore[correlationId];
        bytes memory cid = requestedCid[correlationId];
        emit DataRetrieved(correlationId, cid);

        delete dataStore[correlationId];
        return dataPayload;
    }

    /** 
     * Check if received payload matches requested CID.
     * assume the payload is single IPLD blob under 256 kb.
     */
    function _checkCidMatch(bytes memory payload, bytes memory cid)internal returns (bool){
        //Calculate payload multihash with sha256()

        //Abstract multilHash from cid

        //Compare 
        return true;
    }
}

