import { shortAddress } from "../utils";

export default function AddressLinkBtn({
  address,
}: {
  address: `0x${string}` | undefined | string;
}) {
  return (
    <span className="text-gray-500 hover:text-primary">
      {shortAddress(address as string)}
    </span>
  );
}
