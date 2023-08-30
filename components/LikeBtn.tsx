import { ethers } from "ethers";
import { useSimpubProvider } from "../provider/SimpubProvider";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import Toastify from "toastify-js";
import { ActionSubType } from "../config/types";
import { useProfileProvider } from "../provider/ProfileProvider";

export interface LikeBtnProp {
  tweetCID: string;
  likesCount: number;
}
export default function LikeBtn({ tweetCID, likesCount }: LikeBtnProp) {
  const { address, isConnected, isDisconnected } = useAccount();
  const { insertAction, deleteAction, publishActions } = useSimpubProvider();
  const [isLiked, setIsLiked] = useState(false);
  const [count, setCount] = useState(0);
  const { profileData } = useProfileProvider();

  const clickLikeBtn = async (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isConnected) {
      Toastify({
        text: "Please Connect Wallet",
        className: "toast-info",
      }).showToast();
      return;
    }
    // delete repeated action in
    let del_i = -1;
    for (let i = 0; i < publishActions.length; i++) {
      const row = publishActions[i];
      if (row.tweet == tweetCID) {
        if (isLiked && row.subtype == ActionSubType.LIKE) {
          del_i = i;
          break;
        } else if (!isLiked && row.subtype == ActionSubType.UNLIKE) {
          del_i = i;
          break;
        }
      }
    }
    if (del_i > -1) {
      deleteAction(del_i);
    } else {
      let action = {
        subtype: isLiked ? ActionSubType.UNLIKE : ActionSubType.LIKE,
        tweet: tweetCID,
        newTweet: "",
        followee: ethers.ZeroAddress,
        burn: 0,
        onActionDelete: () => {
          setIsLiked(isLiked);
          setCount(likesCount);
        }
      };
      insertAction(action);
    }
    setIsLiked(!isLiked);
    setCount(count + (!isLiked ? 1 : -1))
  };

  useEffect(() => {
    if (isConnected && address && profileData) {
      setIsLiked(profileData.likesSet.has(tweetCID));
    }
  }, [address, isConnected, profileData]);

  useEffect(() => {
    if (likesCount != null) setCount(likesCount);
  }, [likesCount]);

  return (
    <>
      <button
        className="flex items-center space-x-1 text-gray-500 hover:stroke-primary hover:text-primary"
        onClick={clickLikeBtn}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke={isLiked ? "red" : "currentColor"}
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
        <span>{count}</span>
      </button>
    </>
  );
}
