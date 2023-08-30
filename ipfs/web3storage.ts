// import { Web3Storage } from "web3.storage";

// export function createWeb3StorageClient() {
//   const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY;

//   if (!token) {
//     return console.error(
//       "A token is needed. You can create one on https://web3.storage"
//     );
//   }
//   const storage = new Web3Storage({ token });
//   return storage;
// }

// export async function uploadJsonWeb3storage(client: Web3Storage, files: Blob[]) {
//   console.log(`Uploading ${files.length} files`);
//   const cid = await client.put(files);
//   console.log("Web3.storage content added with CID:", cid);
//   return cid;
// }
