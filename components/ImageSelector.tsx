import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import FileInput from "./FileInput";
import { ImageUploaded } from "../config/types";
import { blobToImage } from "../utils";
import { useModalProvider } from "../provider/ModalProvider";

export function ImageSelector({
  files,
  onFilesChange,
  showAddNew,
  showClose,
}: {
  files: ImageUploaded[];
  onFilesChange?: (_files: ImageUploaded[]) => void;
  showAddNew?: boolean;
  showClose?: boolean;
}) {
  const {
    setImages,
    setImageCur,
    openImageViewerModal,
    closeImageViewerModal,
  } = useModalProvider();

  const clickClose = (index: number) => {
    if (index < 0 || index >= files.length) return;
    let _files: ImageUploaded[] = [];
    if (index == 0) {
      _files = files.slice(1);
    }
    if (index == files.length - 1) {
      _files = files.slice(0, index);
    } else {
      _files = files.slice(0, index).concat(files.slice(index + 1));
    }
    if (onFilesChange) onFilesChange(_files);
  };

  const clickImg = (index: number) => {
    setImages(files);
    setImageCur(index);
    openImageViewerModal();
  };

  const appendImg = (_files: ImageUploaded[]) => {
    if (onFilesChange) onFilesChange(files.concat(_files));
  };

  return (
    <div>
      <div
        className={
          "grid gap-2 items-center " +
          (showClose || files.length > 1 ? "grid-cols-3" : "")
        }
        onClick={(e: any) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {files.length > 0 &&
          files.map((value, index) => {
            let imgSrc = value.srcUrl ? value.srcUrl : blobToImage(value.data as Blob);
            return (
              <div key={index} className="relative">
                <div
                  className={
                    "flex items-center overflow-hidden rounded-xl cursor-pointer " +
                    (showAddNew || files.length > 1 ? "h-36" : "h-auto")
                  }
                  onClick={(e: any) => {
                    e.preventDefault();
                    e.stopPropagation();
                    clickImg(index);
                  }}
                >
                  <img className="w-full" src={imgSrc} />
                </div>
                {showClose && (
                  <button
                    className="btn btn-circle w-6 h-6 min-h-0 right-2 top-2 absolute z-1"
                    onClick={(e: any) => {
                      e.preventDefault();
                      e.stopPropagation();
                      clickClose(index);
                    }}
                  >
                    <XMarkIcon />
                  </button>
                )}
              </div>
            );
          })}
        {showAddNew && files.length > 0 && files.length < 9 && (
          <FileInput
            maxLength={9 - files.length}
            onFileChange={(_files: ImageUploaded[]) => appendImg(_files)}
          >
            <div className="btn btn-square btn-outline border-slate-300 w-full h-32 hover:bg-transparent hover:border-primary hover:stroke-primary hover:text-primary">
              <PlusIcon className="w-12 h-12 m-auto text-slate-400" />
            </div>
          </FileInput>
        )}
      </div>
    </div>
  );
}
