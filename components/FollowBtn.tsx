import { ethers } from "ethers";
import { useSimpubProvider } from "../provider/SimpubProvider";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import Toastify from "toastify-js";
import { ActionSubType } from "../config/types";
import { useProfileProvider } from "../provider/ProfileProvider";

export interface FollowBtnProp {
  user: string;
}
export default function FollowBtn({ user }: FollowBtnProp) {
  const { address, isConnected, isDisconnected } = useAccount();
  const { insertAction, deleteAction, publishActions } = useSimpubProvider();
  const [isFollowed, setIsFollowed] = useState(false);
  const { profileData } = useProfileProvider();

  const clickFollowBtn = async (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isConnected) {
      Toastify({
        text: "Please Connect Wallet",
        className: "toast-info",
      }).showToast();
      return;
    }

    if (address?.toLowerCase() == user.toLowerCase()) {
      Toastify({
        text: "Can't follow yourself!",
        className: "toast-error",
      }).showToast();
      return;
    }

    // delete repeated action in
    let del_i = -1;
    for (let i = 0; i < publishActions.length; i++) {
      const row = publishActions[i];
      if (row.followee == user) {
        if (isFollowed && row.subtype == ActionSubType.FOLLOW) {
          del_i = i;
          break;
        } else if (!isFollowed && row.subtype == ActionSubType.UNFOLLOW) {
          del_i = i;
          break;
        }
      }
    }
    if (del_i > -1) {
      deleteAction(del_i);
    } else {
      let action = {
        subtype: isFollowed ? ActionSubType.UNFOLLOW : ActionSubType.FOLLOW,
        tweet: "",
        newTweet: "",
        followee: user,
        burn: 0,
        onActionDelete: () => {
          setIsFollowed(isFollowed);
        },
      };
      insertAction(action);
    }
    setIsFollowed(!isFollowed);
  };

  useEffect(() => {
    if (isConnected && address && profileData) {
      setIsFollowed(profileData.followeesSet.has(user.toLowerCase()));
    }
  }, [user, address, isConnected, profileData]);

  return (
    <>
      <button
        className={
          `btn rounded-full font-semibold text-white px-3 md:px-6 ` +
          (isFollowed ? "btn-disabled" : "btn-primary")
        }
        onClick={clickFollowBtn}
      >
        {isFollowed ? "Following" : "Follow"}
      </button>
    </>
  );
}
