import { useEffect, useState } from "react";
import FeedItem, { FeedItemProp } from "./FeedItem";
import { CID } from "multiformats";
// import { getJsonByCID } from "../ipfs";
import { useSimpubProvider } from "../provider/SimpubProvider";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { ActionSubType } from "../config/types";
import { useAccount } from "wagmi";
import { useIPFSProvider } from "../provider/IPFSProvider";

const PAGE_SIZE = 10;

export default function FeedsList({ gqlData }: { gqlData: any[] }) {
  const router = useRouter();
  const { address, isConnected, isDisconnected } = useAccount();
  const [dataflowList, setDataflowList] = useState<FeedItemProp[]>([]);
  const [page, setPage] = useState(1);
  const [fetching, setFetching] = useState(false);
  const { simPubContract } = useSimpubProvider();
  const { getJsonByCID } = useIPFSProvider();

  async function getTweets() {
    setFetching(true);
    let promises: (Promise<any> | null)[] = [];
    const start_i = PAGE_SIZE * (page - 1);
    for (
      let i = start_i;
      i < Math.min(start_i + PAGE_SIZE, gqlData.length);
      i++
    ) {
      let _cid = gqlData[i].id;
      console.log(i, _cid);
      try {
        _cid = CID.parse(_cid);
      } catch (error) {
        console.log("parse CID faild:", _cid);
        promises.push(null);
        continue;
      }
      promises.push(getJsonByCID(_cid.toString()));
    }
    const results = await Promise.all(promises);
    let list: (FeedItemProp & { quoteCid: string })[] = [];
    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      if (row == null) continue;
      const gqlRow = gqlData[start_i + i];
      const isNewTweet = gqlRow.subtype === ActionSubType.TWEET;
      const _item = {
        subtype: gqlRow.subtype,
        cid: gqlRow.id,
        user: row["sender"] ? row["sender"] : "",
        timestamp: Number(gqlRow.timestamp) * 1000,
        content: isNewTweet ? row["tweet"] : row["newTweet"],
        quoteCid: isNewTweet ? "" : row["tweet"],
        quoteData: null,
        comments: gqlRow.comments,
        commentsCount: gqlRow.commentsCount,
        likes: gqlRow.likes,
        likesCount: gqlRow.likesCount,
        retweetCount: gqlRow.retweetCount,
        burn: BigInt(gqlRow.burn),
        images: row["images"],
      };
      if (gqlRow["commentOriginTweet"]) {
        _item.quoteData = gqlRow["commentOriginTweet"];
      } else if (gqlRow["repostOriginTweet"]) {
        _item.quoteData = gqlRow["repostOriginTweet"];
      } else if (gqlRow["quoteOriginTweet"]) {
        _item.quoteData = gqlRow["quoteOriginTweet"];
      }
      list.push(_item);
    }

    // query quote feed
    let quotePromises: (Promise<any> | null)[] = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].subtype == ActionSubType.TWEET) {
        quotePromises.push(Promise.resolve(null));
      } else {
        quotePromises.push(getJsonByCID(list[i].quoteCid));
      }
    }
    const quoteResults = await Promise.all(quotePromises);
    for (let i = 0; i < quoteResults.length; i++) {
      if (quoteResults[i] == null) continue;
      list[i].quoteData = {
        ...list[i].quoteData,
        ...quoteResults[i],
      };
      list[i].quoteData.cid = list[i].quoteCid;
      if (quoteResults[i].subtype === ActionSubType.TWEET) {
        list[i].quoteData.content = quoteResults[i].tweet;
      } else {
        list[i].quoteData.content = quoteResults[i].newTweet;
      }
    }

    console.log("FeedsList: ", list);
    setDataflowList([...dataflowList, ...list]);
    setFetching(false);
  }

  const goDetailPage = (cid: string) => {
    router.push(`/detail?cid=${cid}&`);
  };

  useEffect(() => {
    setPage(1);
    setDataflowList([]);
    if (simPubContract && gqlData.length > 0) {
      getTweets();
    }
  }, [simPubContract, gqlData]);

  useEffect(() => {
    if (simPubContract && gqlData.length > 0) {
      getTweets();
    }
  }, [page]);

  return (
    <div>
      {dataflowList.map((item, index) => (
        <FeedItem
          key={index}
          isLast={index === dataflowList.length - 1}
          onLoadMore={() => setPage(page + 1)}
          onContentClick={goDetailPage}
          {...item}
        />
      ))}
      <div className={"p-8 m-auto text-center " + (fetching ? "" : "hidden")}>
        <span className="loading loading-infinity loading-lg"></span>
        <div>Loading more...</div>
      </div>
    </div>
  );
}
