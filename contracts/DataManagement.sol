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
    mapping(uint256 => bytes) public requestedCid; // correlationId <-> cid
    mapping(uint256 => RequestStatus) public requestStatus; // correlationId <-> requestStatus
    mapping(uint256 => bytes) public dataStore; // correlationId <-> dataStore

    constructor() {
        _correlationId = 0;
    }

    event BlobLoadReq(uint256 correlationId, bytes cid, uint256 reward, uint64 timeout);
    event BlobLoadRes(uint256 correlationId, Result result);
    event DataRetrieved(uint256 correlationId, bytes cid);
    event IsCIDMatch(bool IsCIDMatch);
        
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
        // Additional check for CID match
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
        //TODO: send the payload to client's smart contract by delegateCall or resume certain operation.

        delete dataStore[correlationId];
        return dataPayload;
    }

    /** 
     * Check if received payload matches requested CID.
     * assume the payload is single IPLD blob under 256 kb.
     */
    function _checkCidMatch(bytes memory payload, bytes memory cid) internal returns (bool) {
        // For singble IPLD blob, using shar256 to get its multiHash
        bytes memory payloadMultiHash = abi.encodePacked(sha256(payload));
        
        // cid multihash extraction: last 32 bytes of cid.
        bytes memory cidMultiHash = new bytes(32);
        for (uint256 i = cid.length - 32; i < cid.length; i++) {
            cidMultiHash[i - (cid.length - 32)] = cid[i];
        }
        
        // compare payloadMultiHash & cidMultiHash
        bool areEqual = payloadMultiHash.length == cidMultiHash.length && keccak256(payloadMultiHash) == keccak256(cidMultiHash);
        emit IsCIDMatch(areEqual);
        return areEqual;
    }
}