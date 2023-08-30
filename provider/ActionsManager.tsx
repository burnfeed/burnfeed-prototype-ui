import { useEffect, useState } from "react";
import {
  usePrepareContractWrite,
  useAccount,
  useContractWrite,
  useWaitForTransaction,
  useFeeData,
} from "wagmi";
import { simPubAddress } from "../config/addresses";
import SimPubProtocolABI from "../abi/SimPubProtocol.json";
import {
  ActionJsonData,
  ActionSubType,
  ImageUploaded,
  SimPubAction,
} from "../config/types";
import Toastify from "toastify-js";
import TxToast from "../components/TxToast";
import ActionItem from "../components/ActionItem";
import { useSimpubProvider } from "./SimpubProvider";
import { parseGwei } from "viem";
import { validCID } from "../utils";
import { useIPFSProvider } from "./IPFSProvider";
import BurnInput from "../components/BurnInput";

export const CID_PLACEHOLDER = "cid_placeholder";
export interface ActionsManagerProp {
  publishActions: SimPubAction[];
  onSendingChange: (status: boolean) => void;
  onActionsRest: () => void;
}

export default function ActionsManager({
  publishActions,
  onSendingChange,
  onActionsRest,
}: ActionsManagerProp) {
  const { address, isConnected, isDisconnected } = useAccount();
  // const { data: gasData } = useFeeData();
  const [showPing, setShowPing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionsUploaded, setActionsUploaded] = useState<SimPubAction[]>([]);
  const { insertAction, deleteAction, replaceAction } = useSimpubProvider();
  const { uploadJsonData, uploadFileData } = useIPFSProvider();
  const [editBurnIndex, setEditBurnIndex] = useState(-1);
  const [burnSum, setBurnSum] = useState(BigInt(0));

  const {
    config,
    error,
    isLoading: isPreparing,
    isSuccess: isPrepared,
  } = usePrepareContractWrite({
    address: simPubAddress,
    abi: SimPubProtocolABI,
    functionName: "publishActions",
    args: [actionsUploaded],
    value: burnSum,
    enabled: isConnected && actionsUploaded.length > 0,
    // @todo higher gasPrice could faster, but maybe faild caused by out of funds.
    // gasPrice: gasData?.gasPrice ? (gasData?.gasPrice as bigint) * parseGwei("1.25") / parseGwei("1.0") : undefined,
    onSuccess(data) {
      console.log("onSuccess", data);
    },
  });
  const {
    write,
    data: wirteData,
    isLoading: isWriteLoading,
    isSuccess: isWriteSuccess,
    isError: isWriteError,
    error: writeError,
    reset: resetWrite,
  } = useContractWrite({
    ...config,
    onSuccess(data) {
      console.log("write onSuccess", data);
    },
    onError(error) {
      console.error("write onError", error);
      onSendingChange(false);
    },
  });
  const {
    isError: isWaitTxError,
    isLoading: isWaitTxLoading,
    error: waitTxError,
    isSuccess: isWaitTxSuccess,
  } = useWaitForTransaction({
    hash: wirteData?.hash as never,
    onSuccess(data) {
      console.log("tx send successfully:", data);
      onSendingChange(false);
      onActionsRest();
      setActionsUploaded([]);
      setTimeout(() => {
        resetWrite();
      }, 6000);
    },
    onError(err) {
      console.error("tx send faild:", err);
      onSendingChange(false);
    },
  });

  const onBurnConfirm = (b: bigint) => {
    if (editBurnIndex < 0) return;
    let action = {...publishActions[editBurnIndex]}
    action.burn = b;
    replaceAction(action, editBurnIndex);
    setEditBurnIndex(-1);
  }

  const handleImgUpload = async (
    actions: SimPubAction[]
  ): Promise<SimPubAction[] | null> => {
    let counts: number[] = [];
    let promises: Promise<string | null>[] = [];
    for (let i = 0; i < actions.length; i++) {
      const row = actions[i];
      if (!row.jsonData || !row.jsonData.images) {
        counts.push(0);
        continue;
      }
      const images = (row.jsonData as ActionJsonData).images as ImageUploaded[];
      counts.push(images.length);
      for (let j = 0; j < images.length; j++) {
        promises.push(uploadFileData(images[j]));
      }
    }
    let results = await Promise.all(promises);
    let arr: SimPubAction[] = [];
    for (let i = 0; i < counts.length; i++) {
      let obj: SimPubAction = { ...actions[i] };
      if (counts[i] > 0) {
        const images = (obj.jsonData as ActionJsonData)
          .images as ImageUploaded[];
        for (let j = 0; j < images?.length; j++) {
          const _cid = results[0];
          delete images[j].data;
          results = results.slice(1);
          if (_cid && validCID(_cid)) {
            images[j].cid = _cid as string;
          } else {
            return null;
          }
        }
        (obj.jsonData as ActionJsonData).images = [...images];
      }
      arr.push(obj);
    }
    return arr;
  };

  const handleSendActions = async () => {
    if (!isConnected) {
      Toastify({
        text: "Please Connect Wallet",
        className: "toast-info",
      }).showToast();
      return;
    }
    setUploading(true);
    if (onSendingChange) onSendingChange(true);
    // updload images
    let actions = (await handleImgUpload(publishActions)) as SimPubAction[];

    if (!actions) {
      Toastify({
        text: "Upload images IPFS faild",
        className: "toast-error",
      }).showToast();
      setUploading(false);
      return;
    }

    // sum burn number
    let s = BigInt(0);
    for (let i = 0; i < actions.length; i++) {
      s += BigInt(actions[i].burn) 
    }
    setBurnSum(s);
    
    let uploadJsonPromises: Promise<any>[] = [];
    for (let i = 0; i < actions.length; i++) {
      let item = actions[i];
      if (item.jsonData == null) {
        uploadJsonPromises.push(Promise.resolve(null));
      } else {
        let p = uploadJsonData(item.jsonData)
          .then((res: any) => {
            console.log("upload ipfs res", res);
            return res;
          })
          .catch((err: any) => {
            console.error("upload_json error:", err);

            return { error: true };
          });
        uploadJsonPromises.push(p);
      }
    }
    const results = await Promise.all(uploadJsonPromises);
    if (results.some((item) => item && item.error === true)) {
      Toastify({
        text: "Upload IPFS faild",
        className: "toast-error",
      }).showToast();
      setUploading(false);
      return;
    }
    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      if (res != null) {
        let _cid = res as string | null;
        if (!validCID(_cid)) {
          Toastify({
            text: "Upload IPFS faild",
            className: "toast-error",
          }).showToast();
          setUploading(false);
          return;
        }
        let cidKey = "";
        for (let k in actions[i]) {
          if ((actions[i] as any)[k] == CID_PLACEHOLDER) {
            cidKey = k;
            break;
          }
        }
        if (cidKey !== "") {
          (actions[i] as any)[cidKey] = _cid;
        }
      }
    }
    setUploading(false);
    setActionsUploaded(deleteJsonData(actions));
  };

  // ping animation
  useEffect(() => {
    if (!isConnected) return;
    setShowPing(true);
    setTimeout(() => {
      setShowPing(false);
    }, 900);
  }, [publishActions]);

  useEffect(() => {
    if (
      write &&
      actionsUploaded.length > 0 &&
      actionsUploaded.length == publishActions.length
    ) {
      (write as () => void)();
    }
  }, [actionsUploaded, write]);

  return (
    <>
      <div className="drawer drawer-end">
        <input id="actionsManager" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <label
            htmlFor="actionsManager"
            className="drawer-button btn btn-lg btn-circle btn-primary shadow-lg fixed bottom-12 right-8"
          >
            {showPing && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            )}
            {!showPing && publishActions.length > 0 && (
              <span className="absolute flex h-3 w-3 right-0 top-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </span>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </label>
        </div>
        <div className="drawer-side">
          <label htmlFor="actionsManager" className="drawer-overlay"></label>
          <div className="h-full flex flex-col">
            <ul className="menu flex-1 p-4 w-[32rem] bg-base-200 text-base-content">
              {publishActions.length === 0 && (
                <li className="p-4 text-center text-slate-500">
                  No Actions to Send.
                </li>
              )}
              <li>
                {publishActions.map((item, index) => (
                  <ActionItem
                    key={index}
                    onCloseClick={() => {
                      deleteAction(index);
                    }}
                    onEditClick={() => {
                      setEditBurnIndex(index);
                    }}
                    item={{ ...item }}
                  />
                ))}
              </li>
            </ul>
            <div className="p-12 bg-base-200 text-center">
              {!uploading && !isWriteLoading && !isWaitTxLoading ? (
                <button
                  className={`m-auto btn btn-primary rounded-full font-semibold text-white px-6${
                    publishActions.length === 0 ||
                    isWriteLoading ||
                    isWaitTxLoading
                      ? "bg-gray-300 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={handleSendActions}
                  disabled={
                    publishActions.length === 0 ||
                    isWriteLoading ||
                    isWaitTxLoading
                  }
                >
                  Send Actions
                </button>
              ) : (
                <button
                  className={`m-auto btn btn-primary rounded-full font-semibold text-white px-6`}
                  disabled={true}
                >
                  <span className="loading loading-spinner loading-sm"></span>
                  {uploading ? "Upload to IPFS..." : "Sending..."}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <TxToast
        isWriteError={isWriteError}
        writeError={writeError}
        isWaitTxError={isWaitTxError}
        waitTxError={waitTxError}
        isWaitTxSuccess={isWaitTxSuccess}
        waitTxSuccess="Transaction Send Successfully!"
      />
      <dialog
        id="burnInputModal"
        className="modal"
        onClick={() => {
          (window as any).burnInputModal.close();
        }}
      >
        <form
          method="dialog"
          className="modal-box overflow-visible"
          onClick={(e: any) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <BurnInput
            onConfirm={onBurnConfirm}
          />
        </form>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}

function deleteJsonData(actions: SimPubAction[]) {
  let arr: SimPubAction[] = [];
  for (let i = 0; i < actions.length; i++) {
    let obj: any = {};
    for (let k in actions[i]) {
      if (k !== "jsonData" && k !== "onActionDelete") {
        obj[k] = (actions[i] as any)[k];
      }
    }
    arr.push(obj);
  }
  return arr;
}
