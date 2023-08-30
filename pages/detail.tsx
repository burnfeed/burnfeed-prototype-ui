import { useRouter } from "next/router";
import DataFlowItem from "../components/FeedItem";
import TweetInput from "../components/TweetInput";
import { useEffect, useState } from "react";
// import { getJsonByCID } from "../ipfs";
import Layout from "../layout";
import Avatar from "../components/Avatar";
import Link from "next/link";
import { useAccount } from "wagmi";
import { parseCID, shortAddress } from "../utils";
import AddressLinkBtn from "../components/AddressLinkBtn";
import { ActionSubType, ImageUploaded } from "../config/types";
import { useLazyQuery, useQuery } from "@apollo/client";
import { GQL_FEED_ID } from "../graphql/queries";
import Toastify from "toastify-js";
import FeedItem from "../components/FeedItem";
import { useSimpubProvider } from "../provider/SimpubProvider";
import { useIPFSProvider } from "../provider/IPFSProvider";
import { getFileByCID_gateway } from "../ipfs";

export default function FeedDetail() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [detailData, setDetailData] = useState<any | null>(null);
  const [cid, setCid] = useState("");
  const [gqlData, setGqlData] = useState<any>({});
  const [comments, setComments] = useState<any[] | null>(null);
  const { txSendCount } = useSimpubProvider();
  const [fetching, setFetching] = useState(true);
  const { getJsonByCID, getImageByCIDbatch } = useIPFSProvider();

  const [fetchGql, { stopPolling, refetch }] = useLazyQuery(GQL_FEED_ID, {
    variables: {
      cid: cid,
    },
    pollInterval: 1000,
    onCompleted(data: any) {
      console.log("GQL_FEED_ID res: ", data);
      const _feeds = data.tweets;
      if (_feeds && _feeds[0]) {
        stopPolling();
        const _gqlData = {
          ..._feeds[0],
          quoteData: null,
        };
        if (_feeds[0].commentOriginTweet) {
          _gqlData.quoteData = _feeds[0].commentOriginTweet;
        } else if (_feeds[0].repostOriginTweet) {
          _gqlData.quoteData = _feeds[0].repostOriginTweet;
        } else if (_feeds[0].quoteOriginTweet) {
          _gqlData.quoteData = _feeds[0].quoteOriginTweet;
        }
        setGqlData(_gqlData);
        // comments
        fetchCommentsDetail(_gqlData.comments);
      }
      setFetching(false);
    },
  });

  const fetchCommentsDetail = async (gqlComments: any[]) => {
    let list: any[] = [];
    let promises: Promise<any | null>[] = [];
    for (let i = 0; i < gqlComments.length; i++) {
      const _cid = parseCID(gqlComments[i].id);
      if (!_cid) {
        console.error("parse CID faild: ", gqlComments[i].id);
        promises.push(Promise.resolve(null));
      } else {
        promises.push(getJsonByCID(_cid));
      }
    }
    const results = await Promise.all(promises);
    for (let i = 0; i < results.length; i++) {
      if (results[i]) {
        list.push({
          ...results[i],
          cid: gqlComments[i].id,
          user: gqlComments[i].user.id,
          likesCount: gqlComments[i].likesCount,
          commentsCount: gqlComments[i].commentsCount,
          retweetCount: gqlComments[i].retweetCount,
          timestamp: Number(gqlComments[i].timestamp) * 1000,
          content: results[i].newTweet,
        });
      }
    }
    console.log("comments", list);
    setComments(list);
  };

  const resetPage = () => {
    setCid("");
    setDetailData(null);
    setGqlData({});
    setComments(null);
  };

  const handleClickComment = (cid: string) => {
    resetPage();
    router.push(`/detail?cid=${cid}&`);
  };

  const fetchByCID = async () => {
    const cid = parseCID(router.query.cid as string);
    if (!cid) {
      Toastify({
        text: "CID invalid.",
        className: "toast-error",
      }).showToast();
      return;
    }
    const res = (await getJsonByCID(cid as string)) as any;
    const images = res["images"]
      ? res["images"].map((img: ImageUploaded, index: number) => ({
          ...img,
          index,
          srcUrl: getFileByCID_gateway(img.cid),
        }))
      : [];
    let data = {
      ...gqlData,
      cid: cid,
      user: res["sender"] ? res["sender"] : "",
      timestamp: Number(gqlData.timestamp) * 1000,
      content:
        gqlData.subtype === ActionSubType.TWEET
          ? res["tweet"]
          : res["newTweet"],
      images,
      quoteData: null,
    };
    if (gqlData && gqlData.quoteData) {
      const quoteRes = (await getJsonByCID(
        gqlData.quoteData.id as string
      )) as any;
      data.quoteData = {
        cid: gqlData.quoteData.id,
        content:
          quoteRes.subtype === ActionSubType.TWEET
            ? quoteRes.tweet
            : quoteRes.newTweet,
        ...gqlData.quoteData,
        ...quoteRes,
      };
    }
    setDetailData(data);
  };

  useEffect(() => {
    if (cid && gqlData) fetchByCID();
  }, [cid, gqlData]);

  useEffect(() => {
    if (txSendCount > 0)
      refetch({
        fetchPolicy: "network-only",
      });
  }, [txSendCount]);

  useEffect(() => {
    if (router.query.cid) {
      resetPage();
      setCid(router.query.cid as string);
      fetchGql();
    }
  }, [router.query]);

  return (
    <Layout title="">
      {detailData ? (
        <>
          <DataFlowItem
            likesCount={gqlData.likesCount}
            retweetCount={gqlData.retweetCount}
            commentsCount={gqlData.commentsCount}
            onCommentClick={() => {}}
            {...detailData}
          />
          <div className="py-6 px-4 flex border-t">
            {isConnected && address && (
              <div className="py-8">
                <div className="items-center space-x-2 text-center mr-4">
                  <Link href={`/profile?user=${address}&`}>
                    <Avatar address={address} />
                    <span className="block">
                      <AddressLinkBtn address={address} />
                    </span>
                  </Link>
                </div>
              </div>
            )}
            <div className="flex-1">
              <TweetInput
                subtype={ActionSubType.COMMENT}
                quoteTweet={router.query.cid as string}
              />
            </div>
          </div>
          <div className="py-6 pl-6 ">
            <div className="text-lg font-bold pb-4 ">Comments</div>
            {comments ? (
              comments.length > 0 ? (
                comments.map((item, index) => (
                  <FeedItem
                    key={index}
                    onContentClick={handleClickComment}
                    {...item}
                  ></FeedItem>
                ))
              ) : (
                <div className="p-8 m-auto text-center text-slate-400">
                  no comments yet
                </div>
              )
            ) : (
              <div className="p-8 m-auto text-center">
                <span className="loading loading-infinity loading-lg"></span>
                <div>Loading comments...</div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-8 m-auto text-center">
          <span className="loading loading-infinity loading-lg"></span>
          <div>Loading...</div>
        </div>
      )}
    </Layout>
  );
}
