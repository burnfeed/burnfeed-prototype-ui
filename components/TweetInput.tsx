import { useEffect, useState } from "react";
import EmojiPicker from "./EmojiPicker";
import { EmojiClickData } from "emoji-picker-react";
import twemoji from "twemoji";
import { CID } from "multiformats";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import Toastify from "toastify-js";
import { PhotoIcon } from "@heroicons/react/24/outline";
import {
  ActionJsonData,
  ActionSubType,
  ImageUploaded,
  SimPubAction,
} from "../config/types";
import { useSimpubProvider } from "../provider/SimpubProvider";
import { CID_PLACEHOLDER } from "../provider/ActionsManager";
import { FaceSmileIcon } from "@heroicons/react/24/outline";
import FileInput from "./FileInput";
import { ImageSelector } from "./ImageSelector";

export interface TweetInputProp {
  subtype: ActionSubType;
  quoteTweet?: string;
  newTweet?: string;
  // followee?: string;
  burn?: number | bigint;
  onClickSend?: () => void;
}

const PLACE_HOLDER_TXT = {
  [ActionSubType.TWEET]: "What's happening?",
  [ActionSubType.COMMENT]: "Post your reply!",
  [ActionSubType.FOLLOW]: "",
  [ActionSubType.UNFOLLOW]: "",
  [ActionSubType.LIKE]: "",
  [ActionSubType.UNLIKE]: "",
  [ActionSubType.REPOST]: "",
  [ActionSubType.QUOTE]: "Post your reply!",
};

export default function TweetInput({
  subtype,
  quoteTweet,
  newTweet,
  burn,
  onClickSend,
}: TweetInputProp) {
  const { address, isConnected, isDisconnected } = useAccount();
  const [tweetContent, setTweetContent] = useState("");
  const [showEmojiPopup, setShowEmojiPopup] = useState(false);
  const { insertAction } = useSimpubProvider();
  const [selectedFiles, setSelectedFiles] = useState<ImageUploaded[]>([]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTweetContent(event.target.value);
  };

  const handleEmojiChoosen = (emoji: EmojiClickData) => {
    setTweetContent(tweetContent + emoji.emoji);
  };

  const handleFileChange = (files: ImageUploaded[]) => {
    if (files.length > 9) files = files.slice(0, 9);
    setSelectedFiles(files);
  };

  const handleTweet = async () => {
    if (!isConnected) {
      Toastify({
        text: "Please Connect Wallet",
        className: "toast-info",
      }).showToast();
      return;
    }

    console.log(`Tweet content: ${tweetContent}`);
    setShowEmojiPopup(false);
    let json_data: ActionJsonData = {
      subtype: subtype,
      sender: address as `0x${string}`,
      tweet: "",
      newTweet: "",
      timestamp: new Date().getTime(),
    };

    let action: SimPubAction = {
      subtype: subtype,
      tweet: "",
      newTweet: "",
      followee: ethers.ZeroAddress,
      burn: 0,
    };
    switch (subtype) {
      case ActionSubType.TWEET:
        action.tweet = CID_PLACEHOLDER;
        json_data.tweet = tweetContent;
        break;
      case ActionSubType.COMMENT:
        action.tweet = quoteTweet as string;
        action.newTweet = CID_PLACEHOLDER;
        json_data.tweet = quoteTweet as string;
        json_data.newTweet = tweetContent;
        break;
      case ActionSubType.REPOST:
        action.tweet = quoteTweet as string;
        action.newTweet = CID_PLACEHOLDER;
        json_data.tweet = quoteTweet as string;
        json_data.newTweet = "";
        break;
      case ActionSubType.QUOTE:
        action.tweet = quoteTweet as string;
        action.newTweet = CID_PLACEHOLDER;
        json_data.tweet = quoteTweet as string;
        json_data.newTweet = tweetContent;
        break;
      default:
        console.error(`subtype ${subtype} not in ActionSubType.`);
        return;
    }

    if (selectedFiles.length > 0) {
      json_data.images = selectedFiles.map((f, index) => ({
        index,
        ...f,
      }));
    }

    action.jsonData = json_data;
    console.warn("TweetInput action:", action)
    insertAction(action);
    setTweetContent("");
    setSelectedFiles([]);
    if (onClickSend) onClickSend();
  };

  return (
    <div className="relative border border-gray-300 rounded-lg p-4 mb-4">
      <textarea
        className="w-full p-2 bg-transparent resize-none"
        rows={3}
        placeholder={PLACE_HOLDER_TXT[subtype] as string}
        value={tweetContent}
        onChange={handleInputChange}
      />
      <div className="flex justify-between mt-2">
        <div className="flex items-center space-x-1">
          <button
            className={
              "text-primary-blue font-semibold " +
              (showEmojiPopup ? "bg-slate-100" : "")
            }
            onClick={(e: any) => {
              e.stopPropagation();
              e.preventDefault();
              setShowEmojiPopup(!showEmojiPopup);
            }}
          >
            <FaceSmileIcon
              className={
                "w-8 hover:stroke-primary" +
                (showEmojiPopup ? "stroke-primary" : "")
              }
            />
          </button>
          <FileInput
            maxLength={9 - selectedFiles.length}
            onFileChange={handleFileChange}
          >
            <PhotoIcon
              className={"w-8 hover:stroke-primary active:stroke-primary"}
            />
          </FileInput>
        </div>
        <button
          className={`btn btn-primary rounded-full font-semibold text-white px-6 ${
            tweetContent.length === 0 ? "bg-gray-300 cursor-not-allowed" : ""
          }`}
          onClick={handleTweet}
          disabled={tweetContent.length === 0}
        >
          Post
        </button>
      </div>

      <div className={"mt-4 " + (selectedFiles.length > 0 ? "" : "hidden")}>
        <ImageSelector
          files={selectedFiles}
          onFilesChange={(files: ImageUploaded[]) => setSelectedFiles(files)}
          showAddNew={true}
          showClose={true}
        />
      </div>

      <div
        className="absolute z-10"
        style={{
          display: showEmojiPopup ? "block" : "none",
        }}
      >
        <EmojiPicker onChoosen={handleEmojiChoosen} />
      </div>
    </div>
  );
}
