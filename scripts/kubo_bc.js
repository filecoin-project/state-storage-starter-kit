import { create, CID} from 'kubo-rpc-client'
import axios from 'axios'

async function main() {
    // connect to the default API address http://localhost:5001
    const client = create()
    const cid = 'bafkreickvqlzvxbd7xwxsi6ntudleblwg7id7yw2tux3zvnh5nmuop3lja';
    
    // call Core API methods
    const data = client.cat(cid);
    let uint8Array = [];
    for await (const value of data) {
        uint8Array.push(value);
    }
    console.log(uint8Array[0].length);
    console.log(uint8Array[0]);

    const payloadHex = uint8ArrayToHex(uint8Array[0]);
    console.log(console.log('payloadHex:', payloadHex));

    const ipfsURL = "https://ipfs.io/ipfs/" + cid;
    let res = await axios.get(ipfsURL);
    console.log("ipfs data:", res.data);

    const jsonString = JSON.stringify(res.data);
    console.log(Buffer.from(jsonString));
    console.log(Buffer.from(jsonString).length);
    console.log(uint8ArrayToHex(Buffer.from(jsonString)));
}
function uint8ArrayToHex(uint8Array) {
    return Array.from(uint8Array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });