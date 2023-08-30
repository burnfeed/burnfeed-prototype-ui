import { useEffect, useState } from "react";
import { blobToImage } from "../utils";
import { ImageUploaded } from "../config/types";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export default function ImageModalViewer({
  images,
  initIndex,
}: {
  images: ImageUploaded[];
  initIndex: number;
}) {
  const [modalImgSrc, setModalImgSrc] = useState<string>("");
  const [curIndex, setCurIndex] = useState(-1);

  const clickImg = (index: number) => {
    setCurIndex(index);
    const srcUrl = images[index].srcUrl;
    setModalImgSrc(srcUrl ? srcUrl : blobToImage(images[index].data as Blob));
  };

  useEffect(() => {
    if (curIndex > -1 && images.length > 0) {
      const srcUrl = images[curIndex].srcUrl;
      setModalImgSrc(
        srcUrl ? srcUrl : blobToImage(images[curIndex].data as Blob)
      );
    }
  }, [curIndex, images]);

  useEffect(() => {
    setCurIndex(initIndex);
  }, [initIndex]);

  return (
    <div>
      <div className="flex items-center">
        <div className="max-h-[100vh] overflow-y-auto">
          {modalImgSrc && <img className="w-full h-auto" src={modalImgSrc} />}
        </div>
        <button
          className={
            "btn btn-circle w-12 h-12 p-2 absolute left-[-3.5rem] top-1/2 " +
            (curIndex === 0 ? "hidden" : "")
          }
          onClick={(e: any) => {
            e.preventDefault();
            e.stopPropagation();
            if (curIndex == 0) return;
            clickImg(curIndex - 1);
          }}
        >
          <ArrowLeftIcon />
        </button>
        <button
          className={
            "btn btn-circle w-12 h-12 p-2 absolute right-[-3.5rem] top-1/2 " +
            (curIndex === images.length - 1 ? "hidden" : "")
          }
          onClick={(e: any) => {
            e.preventDefault();
            e.stopPropagation();
            if (curIndex == images.length - 1) return;
            clickImg(curIndex + 1);
          }}
        >
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}
