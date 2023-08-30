import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function BurnInput({
  onConfirm,
}: {
  onConfirm: (b: bigint) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const [burnBN, setBurnBN] = useState<bigint>(BigInt(0));
  const [timeId, setTimeId] = useState(-1);

  const inputChange = (value: string) => {
    if (value === "") {
      setBurnBN(BigInt(0));
    } else {
      setBurnBN(BigInt(value));
    }
  };

  const confirm = () => {
    if (onConfirm) onConfirm(burnBN);
    setBurnBN(BigInt(0));
    setInputValue("");
    (window as any).burnInputModal.close();
  };

  return (
    <div className="relative">
      <XMarkIcon
        className="w-9 p-2 absolute top-0 right-0 cursor-pointer"
        onClick={(e: any) => {
          e.preventDefault();
          e.stopPropagation();
          (window as any).burnInputModal.close();
        }}
      />
      <h3 className="font-bold text-xl mb-2">Burn Ether:</h3>
      <div className="relative">
        <input
          type="text"
          placeholder="Input Burn Ether Number"
          className="input input-bordered input-primary w-full max-w-md mx-auto my-4"
          value={inputValue}
          onChange={(e: any) => {
            const value = e.target.value;
            setInputValue(value);
            if (timeId > -1) clearTimeout(timeId);
            const _id = setTimeout(() => {
              inputChange(value);
            }, 400);
            setTimeId(Number(_id));
          }}
        />
        <span className="absolute right-6 top-6">Wei</span>
      </div>
      <div
        className="btn btn-primary w-full max-w-md mt-6"
        onClick={(e: any) => {
          e.preventDefault();
          e.stopPropagation();
          confirm();
        }}
      >
        Edit
      </div>
    </div>
  );
}
