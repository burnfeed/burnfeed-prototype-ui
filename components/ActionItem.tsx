import { useEffect, useState } from "react";
import { ActionSubType, SimPubAction } from "../config/types";
import {
  DocumentTextIcon,
  ChatBubbleBottomCenterIcon,
  HeartIcon,
  UserPlusIcon,
  ArrowPathRoundedSquareIcon,
  XCircleIcon,
  UserMinusIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import CIDLinkBtn from "./CIDLinkBtn";
import { formatWei } from "../utils";

export default function ActionItem({
  item,
  onCloseClick,
  onEditClick,
}: {
  item: SimPubAction;
  onCloseClick: () => void;
  onEditClick: () => void;
}) {
  const [originalTweet, setOriginalTweet] = useState("");

  useEffect(() => {
    if (item == null) return;
    let cid = "";
    switch (item.subtype) {
      case ActionSubType.TWEET:
        if (item.jsonData) cid = item.jsonData.tweet;
        break;
      case ActionSubType.COMMENT:
        if (item.jsonData) cid = item.jsonData.tweet;
        break;
      case ActionSubType.LIKE:
        cid = `${item.tweet}`;
        break;
      case ActionSubType.UNLIKE:
        cid = `${item.tweet}`;
        break;
      case ActionSubType.FOLLOW:
        cid = `${item.followee}`;
        break;
      case ActionSubType.UNFOLLOW:
        cid = `${item.followee}`;
        break;
      case ActionSubType.REPOST:
        cid = item.tweet;
        break;
      case ActionSubType.QUOTE:
        if (item.jsonData) cid = item.jsonData.tweet;
        break;
    }
    setOriginalTweet(cid);
  }, [item]);

  return (
    <>
      <div className="relative bg-white block py-6 px-4 rounded-md shadow-sm mb-2">
        <div className={"flex text-lg action-item-color-" + item.subtype}>
          <span className="w-7 h-7">{getActionIcon(item.subtype)}</span>
          <span className="text-gray-500 ml-2 mr-2">&middot;</span>
          {getActionName(item.subtype)}
          <div className="flex-1 text-right">
            {item.subtype == ActionSubType.TWEET ? (
              <span className="text-gray-500">{originalTweet}</span>
            ) : (
              <CIDLinkBtn cid={originalTweet} />
            )}
          </div>
        </div>
        <div>
          <div className="flex space-x-2 w-full mt-4">
            <div className="flex-1 mt-1">
              <FireIcon className="w-7 mr-1 inline-block stroke-primary" />
              <span className="pt-2 text-xl">
                {item.burn ? formatWei(item.burn) : 0}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                className="btn btn-outline btn-info"
                onClick={(e: any) => {
                  e.stopPropagation();
                  e.preventDefault();
                  (window as any).burnInputModal.showModal();
                  if (onEditClick) onEditClick();
                }}
              >
                Edit Burn
              </button>
              <button
                className="btn btn-outline btn-secondary"
                onClick={(e: any) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (onCloseClick) onCloseClick();
                }}
              >
                Delete Action
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function getActionIcon(subtype: ActionSubType) {
  let icon: any = <></>;
  switch (subtype) {
    case ActionSubType.TWEET:
      icon = <DocumentTextIcon />;
      break;
    case ActionSubType.COMMENT:
      icon = <ChatBubbleBottomCenterIcon />;
      break;
    case ActionSubType.LIKE:
      icon = <HeartIcon />;
      break;
    case ActionSubType.UNLIKE:
      icon = <HeartIcon />;
      break;
    case ActionSubType.FOLLOW:
      icon = <UserPlusIcon />;
      break;
    case ActionSubType.UNFOLLOW:
      icon = <UserMinusIcon />;
      break;
    case ActionSubType.REPOST:
      icon = <ArrowPathRoundedSquareIcon />;
      break;
    case ActionSubType.QUOTE:
      icon = <ArrowPathRoundedSquareIcon />;
      break;
  }
  return icon;
}

export function getActionName(subtype: ActionSubType) {
  let n = "";
  switch (subtype) {
    case ActionSubType.TWEET:
      n = "Send NewFeed";
      break;
    case ActionSubType.COMMENT:
      n = "Send Comment";
      break;
    case ActionSubType.LIKE:
      n = "Like";
      break;
    case ActionSubType.UNLIKE:
      n = "UnLike";
      break;
    case ActionSubType.FOLLOW:
      n = "Follow";
      break;
    case ActionSubType.UNFOLLOW:
      n = "UnFollow";
      break;
    case ActionSubType.REPOST:
      n = "Repost Feed";
      break;
    case ActionSubType.QUOTE:
      n = "Quote Feed";
      break;
  }
  return n;
}
