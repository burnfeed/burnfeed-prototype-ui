import { useEffect, useState } from "react";
import { ImageUploaded } from "../config/types";

export default function FileInput({
  maxLength,
  onFileChange,
  children,
}: {
  maxLength: number;
  onFileChange: (files: ImageUploaded[]) => void;
  children: React.ReactNode;
}) {
  const [inputId, setInputId] =  useState("imgPicker");

  const handleChange = (e: any) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      let arr: ImageUploaded[] = [];
      for (let i = 0; i < files.length; i++) {
        arr.push({
          name: files[i].name,
          type: files[i].type,
          cid: "",
          data: files[i]
        });
      }
      onFileChange(arr);
    }
  };

  useEffect(() => {
    setInputId(`inputId_${Math.floor(Math.random() * 1000)}`)
  }, [])

  return (
    <>
      <label htmlFor={inputId} className="cursor-pointer p-1">
        {children}
      </label>
      <input
        type="file"
        id={inputId}
        className="hidden"
        onChange={handleChange}
        accept="image/png,image/jpeg,image/gif,image/webp"
        multiple={true}
        maxLength={maxLength}
      />
      
    </>
  );
}
