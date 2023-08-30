import React, { createContext, useContext, useEffect, useState } from "react";
import { CID, create } from "kubo-rpc-client";
import { IPFS_LOCALHOST } from "../config/endpoint";
import all from "it-all";
import { getFileByCID_gateway, getJsonByCID_gateway } from "../ipfs";
import { ImageUploaded } from "../config/types";
// import { Web3Storage } from "web3.storage";
// import {
//   createWeb3StorageClient,
//   uploadJsonWeb3storage,
// } from "../ipfs/web3storage";
import { uploadFileDataPinata, uploadJsonDataPinata } from "../ipfs/pinata";

const IPFSProviderContext = createContext<{
  ipfsClient: any | null;
  uploadJsonData: (jsonData: any) => Promise<string | null>;
  getJsonByCID: (_cid: string) => Promise<any>;
  getImageByCID: (_cid: string) => Promise<any>;
  getImageByCIDbatch: (_images: ImageUploaded[]) => Promise<ImageUploaded[]>;
  uploadFileData: (data: any) => Promise<string | null>;
} | null>(null);

export function IPFSProvider({ children }: { children: React.ReactNode }) {
  const [ipfsClient, setIpfsClient] = useState<any | null>(null);
  const [web3Storage, setWeb3Storage] = useState<any | null>(null);
  const [txtencoder, setTxtencoder] = useState<TextEncoder | null>(null);

  const _uploadJsonData = async (jsonData: any): Promise<string | null> => {
    try {
      const { path } = await ipfsClient.add(
        {
          content: (txtencoder as TextEncoder).encode(JSON.stringify(jsonData)),
        },
        { pin: true, type: "application/json" }
      );
      return path;
    } catch (error) {
      console.error("uploadJsonData error:", error);
    }
    return null;
  };

  const _uploadFileData = async (data: any): Promise<string | null> => {
    try {
      const { path } = await ipfsClient.add(
        {
          content: data,
        },
        { pin: true }
      );
      return path;
    } catch (error) {
      console.error("uploadFileData error:", error);
    }
    return null;
  };

  const uploadJsonData = async (jsonData: any): Promise<string | null> => {
    const _cid = await uploadJsonDataPinata(jsonData);
    if ((_cid as any).IpfsHash) return (_cid as any).IpfsHash;
    return null;
  };

  const uploadFileData = async (data: any): Promise<string | null> => {
    const _cid = await uploadFileDataPinata(data);
    if ((_cid as any).IpfsHash) return (_cid as any).IpfsHash;
    return null;
  };

  const _getByCID = async (_cid: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        let u8arrList = (await all(ipfsClient.cat(_cid))) as Uint8Array[];
        let u8arr = new Uint8Array(
          u8arrList.reduce((acc: any, curr: any) => [...acc, ...curr], [])
        );
        resolve(u8arr);
      } catch (error) {
        reject(null);
      }
    });
  };

  const _getJsonByCID = async (_cid: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      const timeid = setTimeout(async () => {
        console.log("getJsonByCID local timeout, use ipfs.io gateway", _cid);
        const res = await getJsonByCID_gateway(_cid);
        resolve(res);
      }, 3000);
      try {
        clearTimeout(timeid);
        let u8arr = await _getByCID(_cid);
        const resStr = new TextDecoder().decode(u8arr);
        resolve(JSON.parse(resStr));
      } catch (error) {
        console.error("getJsonByCID error:", _cid, error);
        resolve(null);
      }
    });
  };

  const _getImageByCID = async (_cid: string): Promise<Blob | null> => {
    return new Promise(async (resolve, reject) => {
      try {
        let u8arr = await _getByCID(_cid);
        const blob = new Blob([u8arr], { type: "image/png" });
        resolve(blob);
      } catch (error) {
        console.error("getJsonByCID error:", _cid, error);
        resolve(null);
      }
    });
  };

  const getJsonByCID = async (_cid: string): Promise<any> => {
    return await getJsonByCID_gateway(_cid);
  }

  const getImageByCID = async (_cid: string): Promise<Blob | null> => {
    return await _getImageByCID(_cid);
  }

  const getImageByCIDbatch = async (
    _images: ImageUploaded[]
  ): Promise<ImageUploaded[]> => {
    let promises: Promise<Blob | null>[] = [];
    for (let i = 0; i < _images.length; i++) {
      if (_images[i].cid) {
        promises.push(getImageByCID(_images[i].cid));
      }
    }
    const results = await Promise.all(promises);
    let arr: ImageUploaded[] = [];
    for (let index = 0; index < results.length; index++) {
      if (results[index]) {
        arr.push({
          ..._images[index],
          index,
          data: results[index] as Blob,
        });
      }
    }
    return arr;
  };

  useEffect(() => {
    if (!ipfsClient) {
      const client = create({ url: IPFS_LOCALHOST });
      setIpfsClient(client);
    }
    if (!txtencoder) {
      setTxtencoder(new TextEncoder());
    }
    // // web3storage
    // if (!web3Storage) {
    //   const s = createWeb3StorageClient();
    //   setWeb3Storage(s);
    // }
  }, []);

  return (
    <IPFSProviderContext.Provider
      value={{
        ipfsClient,
        uploadJsonData,
        uploadFileData,
        getJsonByCID,
        getImageByCID,
        getImageByCIDbatch,
      }}
    >
      {children}
    </IPFSProviderContext.Provider>
  );
}

export function useIPFSProvider() {
  const context = useContext(IPFSProviderContext);
  if (!context) {
    throw new Error("useIPFSProvider must be used within a InputModalProvider");
  }
  return context;
}
