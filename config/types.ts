import { Address } from "viem";

//0 tweet, 1 comment, 2 like, 3 unlike, 4 follow, 5 unfollow, 6 retweet 7 quote
export enum ActionSubType {
  TWEET,
  COMMENT,
  LIKE,
  UNLIKE,
  FOLLOW,
  UNFOLLOW,
  REPOST,
  QUOTE,
}

export interface SimPubAction {
  subtype: ActionSubType;
  tweet: string;
  newTweet: string;
  followee: string;
  burn: bigint | number;
  jsonData?: ActionJsonData;
  onActionDelete?: Function;
  onBurnEdit?: Function;
}

export interface ImageUploaded {
  index?: number;
  name: string;
  type:
    | "image/png"
    | "image/jpeg"
    | "image/webp"
    | "image/gif"
    | "image/svg+xml";
  cid: string; // CID
  data?: Blob;
  srcUrl?: string; // gateway src href
}

export interface ActionJsonData {
  subtype: ActionSubType;
  sender: Address;
  tweet: string;
  newTweet: string;
  images?: ImageUploaded[]
  timestamp: number;
}


