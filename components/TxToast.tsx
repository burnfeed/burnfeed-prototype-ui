import { useEffect } from "react";
import Toastify from "toastify-js";

export interface TxToastProp {
  isWriteError: boolean;
  writeError: any;
  isWaitTxError: boolean;
  waitTxError: any;
  isWaitTxSuccess: boolean;
  waitTxSuccess: string;
}

export default function TxToast({
  isWriteError,
  writeError,
  isWaitTxError,
  waitTxError,
  isWaitTxSuccess,
  waitTxSuccess,
}: TxToastProp) {
  useEffect(() => {
    if (isWriteError) {
      Toastify({
        text: "send transaction faild.",
        // text: JSON.stringify(writeError),
        className: "toast-error",
      }).showToast();
    }
  }, [isWriteError]);

  useEffect(() => {
    if (isWaitTxError) {
      Toastify({
        text: JSON.stringify(waitTxError),
        className: "toast-error",
      }).showToast();
    }
  }, [isWaitTxError]);

  useEffect(() => {
    if (isWaitTxSuccess) {
      Toastify({
        text: waitTxSuccess,
        className: "toast-success",
      }).showToast();
    }
  }, [isWaitTxSuccess]);
  return (
    <></>
  );
}
