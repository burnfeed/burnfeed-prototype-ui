import React, { createContext, useContext, useEffect, useState } from "react";
import TweetInput from "../components/TweetInput";
import {
  ActionSubType,
  ImageUploaded,
  SimPubAction,
} from "../config/types";
import ImageModalViewer from "./ImageModalViewer";
import BurnInput from "../components/BurnInput";

const ModalProviderContext = createContext<{
  openInputModal: () => void;
  closeInputModal: () => void;
  setModalTitle: (t: string) => void;
  setInputConfig: (t: SimPubAction) => void;
  openImageViewerModal: () => void;
  closeImageViewerModal: () => void;
  setImages: (images: ImageUploaded[]) => void;
  setImageCur: (i: number) => void;
} | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalTitle, setModalTitle] = useState("");
  const [inputConfig, setInputConfig] = useState<SimPubAction>({
    subtype: ActionSubType.COMMENT,
    tweet: "",
    newTweet: "",
    followee: "",
    burn: 0,
  });

  const [images, setImages] = useState<ImageUploaded[]>([]);
  const [imageCur, setImageCur] = useState(-1);

  function openInputModal() {
    (window as any).inputModal.showModal();
  }
  function closeInputModal() {
    (window as any).inputModal.close();
  }
  function openImageViewerModal() {
    (window as any).imageModalViewer.showModal();
  }
  function closeImageViewerModal() {
    (window as any).imageModalViewer.close();
  }
  

  return (
    <ModalProviderContext.Provider
      value={{
        openInputModal,
        closeInputModal,
        setModalTitle,
        setInputConfig,
        openImageViewerModal,
        closeImageViewerModal,
        setImages,
        setImageCur,
      }}
    >
      {children}
      <dialog id="inputModal" className="modal">
        <form
          method="dialog"
          className="modal-box overflow-visible mt-[-20rem]"
        >
          <h3 className="font-bold text-lg mb-2">{modalTitle}</h3>
          <TweetInput
            subtype={inputConfig.subtype}
            quoteTweet={inputConfig.tweet}
            newTweet={inputConfig.newTweet}
            burn={inputConfig.burn}
            onClickSend={closeInputModal}
          />
        </form>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <dialog
        id="imageModalViewer"
        className="modal"
        onClick={() => closeImageViewerModal()}
      >
        <form
          method="dialog"
          className="modal-box p-0 w-auto max-w-[80%] overflow-visible max-h-[100vh]"
        >
          <ImageModalViewer images={images} initIndex={imageCur} />
        </form>
      </dialog>

      
    </ModalProviderContext.Provider>
  );
}

export function useModalProvider() {
  const context = useContext(ModalProviderContext);
  if (!context) {
    throw new Error(
      "useModalProvider must be used within a InputModalProvider"
    );
  }
  return context;
}
