import { useRouter } from "next/router";
import { shortCID } from "../utils";

export default function CIDLinkBtn({ cid }: { cid: string }) {
  const router = useRouter();
  return (
    <div
      className="text-gray-500"
      onClick={(e: any) => {
        e.stopPropagation();
        e.preventDefault();
        router.push(`https://ipfs.io/ipfs/${cid}`)
      }}
    >
      cid: <span className="hover:text-primary">{shortCID(cid)}</span>
    </div>
  );
}
