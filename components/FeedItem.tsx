import {
  shortAddress,
  formatDateTimeByTs,
  shortCID,
  blobToImage,
  formatWei,
} from "../utils";
import LikeBtn from "./LikeBtn";
import Avatar from "./Avatar";
import twemoji from "twemoji";
import Link from "next/link";
import { ChatBubbleLeftIcon, FireIcon } from "@heroicons/react/24/outline";
import CIDLinkBtn from "./CIDLinkBtn";
import { useModalProvider } from "../provider/ModalProvider";
import { ActionSubType, ImageUploaded } from "../config/types";
import RepostBtn from "./RepostBtn";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useProfileProvider } from "../provider/ProfileProvider";
import { useAccount } from "wagmi";
import { useIPFSProvider } from "../provider/IPFSProvider";
import { ImageSelector } from "./ImageSelector";
import { getFileByCID_gateway } from "../ipfs";

export interface FeedItemProp {
  subtype: ActionSubType;
  cid: string;
  user: string;
  content: string;
  quoteData: any | null;
  timestamp: number;
  comments: string[];
  commentsCount: number;
  likes: string[];
  likesCount: number;
  retweetCount: number;
  burn: bigint;
  images?: ImageUploaded[];
  onContentClick?: (_cid: string) => void;
  isLast?: boolean;
  onLoadMore?: () => void;
}

export default function FeedItem({
  subtype,
  cid,
  user,
  timestamp,
  content,
  quoteData,
  comments,
  commentsCount,
  likes,
  likesCount,
  retweetCount,
  burn,
  images,
  onContentClick,
  isLast,
  onLoadMore,
}: FeedItemProp) {
  const itemRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { address, isConnected, isDisconnected } = useAccount();
  const { profileData } = useProfileProvider();
  const { openInputModal, closeInputModal, setModalTitle, setInputConfig } =
    useModalProvider();
  const [isCommented, setIsCommented] = useState(false);
  const [itemJumpLink, setItemJumpLink] = useState("");
  const [profileLink, setProfileLink] = useState("");
  const [loadedImages, setLoadedImages] = useState<ImageUploaded[]>([]);
  const [quoteLoadedImages, setQuoteLoadedImages] = useState<ImageUploaded[]>(
    []
  );
  const { getImageByCIDbatch } = useIPFSProvider();

  const getContentImages = async (_images: ImageUploaded[]) => {
    const results = await getImageByCIDbatch(_images);
    setLoadedImages(results);
  };

  useEffect(() => {
    if (images) {
      // getContentImages(images);
      setLoadedImages(
        images.map((img, index) => ({
          ...img,
          index,
          srcUrl: getFileByCID_gateway(img.cid),
        }))
      );
    }
  }, [images]);

  useEffect(() => {
    if (quoteData && quoteData.images) {
      // getContentImages(images);
      setQuoteLoadedImages(
        (quoteData.images as ImageUploaded[]).map((img, index) => ({
          ...img,
          index,
          srcUrl: getFileByCID_gateway(img.cid),
        }))
      );
    }
  }, [quoteData]);

  useEffect(() => {
    if (!cid) return;
    let _cid = cid;
    if (subtype === ActionSubType.REPOST && quoteData && quoteData.cid) {
      _cid = quoteData.cid;
    }
    setItemJumpLink(`/detail?cid=${_cid}&`);
  }, [cid, subtype, quoteData]);

  useEffect(() => {
    if (!user) return;
    let _user = user;
    if (subtype === ActionSubType.REPOST && quoteData && quoteData.sender) {
      _user = quoteData.sender;
    }
    setProfileLink(`/profile?user=${_user}&`);
  }, [user, subtype, quoteData]);

  useEffect(() => {
    if (isConnected && profileData) {
      // setIsLiked(profileData.likesSet.has(cid));
      setIsCommented(profileData.commentsSet.has(cid));
    }
  }, [isConnected, address, profileData]);

  /**
   * Implement Intersection Observer to check if the last Card in the array is visible on the screen, then set a new limit
   */
  useEffect(() => {
    if (!itemRef?.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (isLast && entry.isIntersecting) {
        if (onLoadMore) onLoadMore();
        observer.unobserve(entry.target);
      }
    });

    observer.observe(itemRef.current);
  }, [isLast]);

  return (
    <div
      ref={itemRef}
      className="rounded-lg mb-4 p-2 md:p-4 hover:bg-slate-100 cursor-pointer"
      onClick={(e: any) => {
        e.stopPropagation();
        e.preventDefault();
        // @todo repost item, show original feed directly.
        router.push(itemJumpLink);
      }}
    >
      <div className="flex space-x-4">
        <div
          onClick={(e: any) => {
            e.stopPropagation();
            e.preventDefault();
            router.push(profileLink);
          }}
        >
          <Avatar address={user} />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-1">
            <div
              onClick={(e: any) => {
                e.stopPropagation();
                e.preventDefault();
                router.push(profileLink);
              }}
            >
              <span className="text-gray-500">{shortAddress(user)}</span>
            </div>
            <span className="text-gray-500">&middot;</span>
            <span className="text-gray-500">
              {timestamp ? formatDateTimeByTs(timestamp) : ""}
            </span>
            <span className="flex-1 text-right hidden md:block">
              <CIDLinkBtn cid={cid} />
            </span>
          </div>
          {
            // comments of
            subtype == ActionSubType.COMMENT && quoteData && (
              <p className="text-slate-400 text-sm mt-2">
                reply to{" "}
                <Link
                  className="hover:text-primary"
                  href={`/profile?user=${quoteData.sender}&`}
                >
                  {shortAddress(quoteData.sender)}
                </Link>
                :{/* <span className="ml-2">{quoteData.content}</span> */}
              </p>
            )
          }
          {
            // repost
            subtype == ActionSubType.REPOST && quoteData && (
              <p className="text-slate-400 text-sm mt-2">repost</p>
            )
          }
          <div
            className="mt-2 text-gray-800"
            onClick={(e: any) => {
              e.stopPropagation();
              e.preventDefault();
              if (onContentClick) {
                (onContentClick as (c: string) => void)(cid);
              }
            }}
            dangerouslySetInnerHTML={{
              __html: twemoji.parse(content ? content : ""),
            }}
          ></div>
          {
            // images of content
            loadedImages.length > 0 ? (
              <div className="py-4">
                <ImageSelector files={loadedImages} />
              </div>
            ) : (
              <></>
            )
          }
          {/* quote tweet */}
          {(subtype == ActionSubType.COMMENT ||
            subtype == ActionSubType.REPOST ||
            subtype == ActionSubType.QUOTE) &&
            quoteData && (
              <div className="mt-3 p-4 pl-6 border-2 rounded-xl">
                <div className="flex items-center space-x-1">
                  <div
                    onClick={(e: any) => {
                      e.stopPropagation();
                      e.preventDefault();
                      router.push(`/profile?user=${quoteData.sender}&`);
                    }}
                  >
                    <Avatar address={quoteData.sender} size={2} />
                  </div>
                  <div
                    onClick={(e: any) => {
                      e.stopPropagation();
                      e.preventDefault();
                      router.push(`/profile?user=${quoteData.sender}&`);
                    }}
                  >
                    <span className="text-gray-500">
                      {shortAddress(quoteData.sender)}
                    </span>
                  </div>
                  <span className="text-gray-500">&middot;</span>
                  <span className="text-gray-500">
                    {formatDateTimeByTs(quoteData.timestamp)}
                  </span>
                </div>
                <div
                  className="mt-2 text-gray-800"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    e.preventDefault();
                    router.push(`/detail?cid=${quoteData.cid}&`);
                  }}
                  dangerouslySetInnerHTML={{
                    __html: twemoji.parse(
                      quoteData.content ? quoteData.content : ""
                    ),
                  }}
                ></div>
                {
                  // images of content
                  quoteLoadedImages.length > 0 ? (
                    <div className="py-4">
                      <ImageSelector files={quoteLoadedImages} />
                    </div>
                  ) : (
                    <></>
                  )
                }
                {/* Repost use `originalTweet` like,repost,comments btn */}
                <div
                  className={
                    "flex justify-between mt-4 " +
                    (subtype == ActionSubType.REPOST ? "" : "hidden")
                  }
                >
                  <div className="flex space-x-4">
                    <LikeBtn
                      tweetCID={quoteData.cid}
                      likesCount={quoteData.likesCount}
                    />
                    {/* comments */}
                    <button
                      className={
                        "flex items-center space-x-1 " +
                        (isCommented
                          ? "text-primary stroke-primary"
                          : "text-gray-500 stroke-slate-500")
                      }
                      onClick={(e: any) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setModalTitle(
                          `Reply to ${shortAddress(quoteData.sender)}`
                        );
                        setInputConfig({
                          subtype: ActionSubType.COMMENT,
                          tweet: quoteData.cid,
                          newTweet: "",
                          followee: "",
                          burn: 0,
                        });
                        openInputModal();
                      }}
                    >
                      <ChatBubbleLeftIcon className="w-6 hover:stroke-primary" />
                      <span className="hover:text-primary">
                        {quoteData.commentsCount ? quoteData.commentsCount : 0}
                      </span>
                    </button>
                    {/* repost or quote */}
                    <RepostBtn
                      tweetCID={quoteData.cid}
                      quoteUser={quoteData.sender}
                      repostsCount={quoteData.retweetCount}
                    />
                  </div>
                </div>
              </div>
            )}
          <div
            className={"flex justify-between mt-4 w-full"}
            onClick={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div
              className={
                "flex space-x-4 " +
                (subtype == ActionSubType.TWEET ||
                subtype == ActionSubType.COMMENT ||
                subtype == ActionSubType.QUOTE
                  ? ""
                  : "hidden")
              }
            >
              <LikeBtn tweetCID={cid} likesCount={likesCount} />
              {/* comments */}
              <button
                className={
                  "flex items-center space-x-1 " +
                  (isCommented
                    ? "text-primary stroke-primary"
                    : "text-gray-500 stroke-slate-500")
                }
                onClick={(e: any) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setModalTitle(`Reply to ${shortAddress(user)}`);
                  setInputConfig({
                    subtype: ActionSubType.COMMENT,
                    tweet: cid,
                    newTweet: "",
                    followee: "",
                    burn: 0,
                  });
                  openInputModal();
                }}
              >
                <ChatBubbleLeftIcon className="w-6 hover:stroke-primary" />
                <span className="hover:text-primary">
                  {commentsCount ? commentsCount : 0}
                </span>
              </button>
              {/* repost or quote */}
              <RepostBtn
                tweetCID={cid}
                quoteUser={user}
                repostsCount={retweetCount}
              />
            </div>
            <div
              className={
                "flex-1 text-right " + (burn && burn > 0 ? "" : "hidden")
              }
            >
              <FireIcon className="w-5 mr-1 inline-block stroke-primary" />
              <span className="pt-1 text-primary">
                {burn ? formatWei(burn) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
