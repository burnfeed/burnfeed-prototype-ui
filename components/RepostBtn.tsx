import { ethers } from "ethers";
import { useSimpubProvider } from "../provider/SimpubProvider";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import Toastify from "toastify-js";
import { ActionJsonData, ActionSubType, SimPubAction } from "../config/types";
import {
  ArrowPathRoundedSquareIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { useModalProvider } from "../provider/ModalProvider";
import { shortAddress, shortCID } from "../utils";
import { useProfileProvider } from "../provider/ProfileProvider";
import { CID_PLACEHOLDER } from "../provider/ActionsManager";

export interface RepostBtnProp {
  tweetCID: string;
  quoteUser: string;
  repostsCount: number;
}
export default function RepostBtn({
  tweetCID,
  quoteUser,
  repostsCount,
}: RepostBtnProp) {
  const { address, isConnected, isDisconnected } = useAccount();
  const [count, setCount] = useState(0);
  const [isReposted, setIsReposted] = useState(false);
  const { insertAction } = useSimpubProvider();
  const { profileData } = useProfileProvider();
  const { openInputModal, closeInputModal, setModalTitle, setInputConfig } =
    useModalProvider();

  const clickRepost = async (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isConnected) {
      Toastify({
        text: "Please Connect Wallet",
        className: "toast-info",
      }).showToast();
      return;
    }
    if (isReposted) {
      Toastify({
        text: "Already reposted",
        className: "toast-info",
      }).showToast();
      return;
    }
    console.log(address?.toLowerCase(), quoteUser);
    if (address?.toLowerCase() == quoteUser.toLowerCase()) {
      Toastify({
        text: "Can't repost yourself",
        className: "toast-info",
      }).showToast();
      return;
    }
    let json_data: ActionJsonData = {
      subtype: ActionSubType.REPOST,
      sender: address as `0x${string}`,
      tweet: tweetCID,
      newTweet: "",
      timestamp: new Date().getTime(),
    };
    let action: SimPubAction = {
      subtype: ActionSubType.REPOST,
      tweet: tweetCID,
      newTweet: CID_PLACEHOLDER,
      followee: ethers.ZeroAddress,
      burn: 0,
      jsonData: json_data,
      onActionDelete: () => {
        setIsReposted(false);
      }
    };
    console.log("RepostBtn insert action: ", action);
    insertAction(action);
    setIsReposted(true);
    setCount(count + 1);
  };

  useEffect(() => {
    setCount(repostsCount)
  }, [repostsCount])

  useEffect(() => {
    if (isConnected && profileData) {
      setIsReposted(
        profileData.repostsSet.has(tweetCID) ||
          profileData.quotesSet.has(tweetCID)
      );
    }
  }, [address, isConnected, profileData]);

  return (
    <div className="dropdown">
      <button
        tabIndex={0}
        className={
          "flex items-center space-x-1 " +
          (isReposted ? "text-primary" : "text-gray-500")
        }
        onClick={(e: any) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <ArrowPathRoundedSquareIcon className="w-6 hover:stroke-primary" />
        <span className="hover:text-primary">
          {count}
        </span>
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] bg-base-100 shadow-lg menu p-2 rounded-box w-38"
      >
        <li>
          <button className="text-black" onClick={clickRepost}>
            <ArrowPathRoundedSquareIcon className="w-6" />
            Repost
          </button>
        </li>
        <li>
          <button
            className="text-black"
            onClick={(e: any) => {
              e.stopPropagation();
              e.preventDefault();
              setModalTitle(
                `Quote ${shortAddress(quoteUser)}'s tweet:   ${shortCID(
                  tweetCID
                )}`
              );
              setInputConfig({
                subtype: ActionSubType.QUOTE,
                tweet: tweetCID,
                newTweet: "",
                followee: "",
                burn: 0,
              });
              openInputModal();
            }}
          >
            <PencilIcon className="w-6" />
            Quote
          </button>
        </li>
      </ul>
    </div>
  );
}
