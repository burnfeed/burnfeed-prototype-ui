import Link from "next/link";
import Avatar from "./Avatar";
import FollowBtn from "./FollowBtn";

export interface FollowerItemProp {
  id: string;
}
export default function FollowerItem({ id }: FollowerItemProp) {
  return (
    <Link
      className="flex space-x-4 py-6 mx-8 border-b"
      href={`/profile?user=${id}&`}
    >
      <Avatar address={id} size={3} />
      <div className="flex-1">
        <span className="font-semibold text-black block py-2">{id}</span>
      </div>
      <FollowBtn user={id} />
    </Link>
  );
}
