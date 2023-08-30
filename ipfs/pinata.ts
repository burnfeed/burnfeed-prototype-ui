import { ImageUploaded } from "../config/types";
import { PINATA_API, PINATA_FILE_API } from "../config/endpoint";

export async function uploadJsonDataPinata(data: any): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const toId = setTimeout(() => {
      reject("Upload ipfs timeout");
    }, 10000);
    fetch(PINATA_API, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        authorization: "Bearer " + process.env.NEXT_PUBLIC_PINATA_JWT,
        // "x-api-key": process.env.NEXT_PUBLIC_PINATA_PRIVATE_KEY as string,
      },
      body: JSON.stringify({
        pinataContent: data,
        // pinToIPFS: true,
      }), // body data type must match "Content-Type" header
    })
      .then((response) => {
        clearTimeout(toId);
        response
          .json()
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      })
      .catch((err) => {
        clearTimeout(toId);
        reject(err);
      });
  });
}

export async function uploadFileDataPinata(
  data: ImageUploaded
): Promise<string | null> {
  const formData = new FormData();
  formData.append("pinataMetadata", JSON.stringify({
    name: data.name,
  }));
  formData.append("pinataOptions", JSON.stringify({
    cidVersion: 0,
  }));
  formData.append("wrapWithDirectory", "false");
  formData.append("file", data.data as Blob)

  return new Promise((resolve, reject) => {
    const toId = setTimeout(() => {
      reject("Upload ipfs timeout");
    }, 10000);
    fetch(PINATA_FILE_API, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        // "Content-Type": `multipart/form-data;boundary=${(formData as any)._boundary}`,
        accept: "application/json",
        authorization: "Bearer " + process.env.NEXT_PUBLIC_PINATA_JWT,
      },
      body: formData,
    })
      .then((response) => {
        clearTimeout(toId);
        response
          .json()
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      })
      .catch((err) => {
        clearTimeout(toId);
        reject(err);
      });
  });
}
