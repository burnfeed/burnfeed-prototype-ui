import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Layout from "../layout";
import TweetInput from "../components/TweetInput";
import FeedsList from "../components/FeedsList";
import { GQL_FEEDS_ALL, GQL_FEEDS_FOLLOWING } from "../graphql/queries";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useSimpubProvider } from "../provider/SimpubProvider";
import { useProfileProvider } from "../provider/ProfileProvider";
import Link from "next/link";
import Avatar from "../components/Avatar";
import AddressLinkBtn from "../components/AddressLinkBtn";

const Home: NextPage = () => {
  const router = useRouter();
  const { address, isConnected, isDisconnected } = useAccount();
  const [curTab, setCurTab] = useState(0);
  const [gqlDataAll, setGqlDataAll] = useState<any[] | null>(null);
  const [gqlDataFollowing, setGqlDataFollowing] = useState<any[] | null>(null);
  const { profileData } = useProfileProvider();
  const { txSendCount } = useSimpubProvider();
  const [fetchFeeds, { startPolling, stopPolling }] = useLazyQuery(
    GQL_FEEDS_ALL,
    {
      variables: {
        first: 1000,
        skip: 0,
        orderBy: "burn",
        orderDirection: "desc",
      },
      onCompleted(data: any) {
        console.log("GQL_FEEDS res: ", data);
        stopPolling();

        const _feeds = data.tweets;
        if (_feeds) {
          setGqlDataAll(_feeds);
        }
      },
    }
  );

  const [fetchFwollowingFeeds, { stopPolling: stopPollingFollowing }] =
    useLazyQuery(GQL_FEEDS_FOLLOWING, {
      variables: {
        first: 1000,
        skip: 0,
        orderBy: "timestamp",
        orderDirection: "desc",
        followeeList: profileData ? Array.from(profileData.followeesSet) : [],
      },
      onCompleted(data: any) {
        console.log("GQL_FEEDS_FOLLOWING res: ", data);
        stopPollingFollowing();

        const _feeds = data.tweets;
        if (_feeds) {
          setGqlDataFollowing(_feeds);
        }
      },
    });

  const handleTabClick = (i: number) => {
    router.replace({
      query: { ...router.query, tab: i },
    });
    setCurTab(i);
  };

  const fetchData = () => {
    fetchFeeds();
    fetchFwollowingFeeds();
  };

  useEffect(() => {
    if (txSendCount > 0) {
      setGqlDataAll(null);
      setGqlDataFollowing(null);
      fetchFeeds({
        fetchPolicy: "network-only",
      });
      fetchFwollowingFeeds({
        fetchPolicy: "network-only",
      });
    }
  }, [txSendCount]);

  useEffect(() => {
    fetchData();
  }, [profileData]);

  useEffect(() => {
    const tab = router.query.tab as string;
    if (tab != null) {
      setCurTab(Number(tab));
    }
  }, [router.query]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout title="">
      <div className="px-4 md:px-6">
        <div className="md:p-2">
          <div className="flex">
            {isConnected && address && profileData && (
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
              <TweetInput subtype={0} />
            </div>
          </div>
          <div className="tabs py-4 px-8 w-full">
            <a
              className={
                (curTab === 0 ? "tab-active " : "") + "tab tab-bordered flex-1"
              }
              onClick={() => handleTabClick(0)}
            >
              All
            </a>
            <a
              className={
                (curTab === 1 ? "tab-active " : "") + "tab tab-bordered flex-1"
              }
              onClick={() => handleTabClick(1)}
            >
              Following
            </a>
          </div>
          <div className={curTab === 0 ? "" : "hidden"}>
            {gqlDataAll ? (
              <FeedsList gqlData={gqlDataAll} />
            ) : (
              <div className="p-8 m-auto text-center">
                <span className="loading loading-infinity loading-lg"></span>
                <div>Loading Feeds...</div>
              </div>
            )}
          </div>
          <div className={curTab === 1 ? "" : "hidden"}>
            {isConnected && profileData ? (
              profileData.followeesCount > 0 ? (
                gqlDataFollowing ? (
                  <FeedsList gqlData={gqlDataFollowing} />
                ) : (
                  <div className="p-8 m-auto text-center">
                    <span className="loading loading-infinity loading-lg"></span>
                    <div>Loading Feeds...</div>
                  </div>
                )
              ) : (
                <div className="p-8 m-auto text-center">
                  You haven't follow anyone.
                </div>
              )
            ) : (
              <div className="p-8 m-auto text-center">
                Please Connect Wallet
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
