import { IPFS_GATEWAY } from "../config/endpoint";

const CID_TIMEOUT = 3000

export async function getJsonByCID_gateway(cid: string): Promise<any> {
  return new Promise((resolve, reject) => {
    let timeid = setTimeout(() => {
      resolve(null);
    }, CID_TIMEOUT);
    fetch(`${IPFS_GATEWAY}/${cid}`, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
    })
      .then((data) => {
        clearTimeout(timeid);
        data
          .json()
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            console.error("getJsonByCID error", cid, err);
            reject(err);
          });
      })
      .catch((err) => {
        console.error("getJsonByCID error", cid, err);
        reject(err);
      });
  });
}

export  function getFileByCID_gateway(cid: string): string {
  return `${IPFS_GATEWAY}/${cid}`;
}
