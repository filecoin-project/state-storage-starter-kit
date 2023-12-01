import { create } from "kubo-rpc-client";
import all from "it-all";
import { concat as uint8ArrayConcat } from "uint8arrays/concat";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";

async function main() {
  // connect to the default API address http://localhost:5001
  const client = create();
  const version = await client.version();
  console.log("version:", version);
  const cid = "0x00015512204aac179adc23fded7923cd9d06b2057637d03fe2da9d2fbcd5a7eb59473f6b48";
  // call Core API methods
  const data = uint8ArrayConcat(await all(client.cat(cid)));
  console.log(data.length);
  console.log("mydata:", uint8ArrayToString(data));
  console.log("mydata:", uint8ArrayToHex(data));
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