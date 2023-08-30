import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../layout";
import Avatar from "../components/Avatar";
import { useAccount } from "wagmi";
import { ActionSubType, SimPubAction } from "../config/types";
import { useSimpubProvider } from "../provider/SimpubProvider";
import { USERS_BY_ID, USERS_FOLLOWERS } from "../graphql/queries";
import { useQuery } from "@apollo/client";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import FollowerItem, { FollowerItemProp } from "../components/FollowerItem";

export default function TweetDetail() {
  const router = useRouter();
  const { address, isConnected, isDisconnected } = useAccount();
  const [profileUser, setProfileUser] = useState("");
  const [gqlData, setGqlData] = useState<any | null>(null);
  const [curTab, setCurTab] = useState(0);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const { txSendCount } = useSimpubProvider();

  const { stopPolling, refetch } = useQuery(USERS_FOLLOWERS, {
    variables: {
      id: profileUser.toLowerCase(),
    },
    skip: profileUser === "",
    pollInterval: 1000,
    onCompleted(data: any) {
      const users = data.users;
      console.log("USERS_FOLLOWERS res: ", data);
      if (users && users[0]) {
        stopPolling();
        setGqlData(users[0]);
      }
    },
  });

  const handleTabClick = (i: number) => {
    router.replace({
      query: { ...router.query, tab: i },
    });
    setCurTab(i);
  };

  const initFetch = async () => {
    const user = router.query.user as string;
    const tab = router.query.tab as string;
    setProfileUser(user);
    if (tab != null) {
      setCurTab(Number(tab));
    }
  };

  useEffect(() => {
    if (gqlData) {
      const { followers, followees } = gqlData;
      setFollowersList(followers);
      setFollowingList(followees);
    }
  }, [gqlData]);

  useEffect(() => {
    if (txSendCount > 0)
      refetch({
        fetchPolicy: "network-only",
      });
  }, [txSendCount]);

  useEffect(() => {
    if (router.query.user) {
      initFetch();
    }
  }, [router.query]);

  return (
    <Layout title="">
      {gqlData ? (
        <>
          <div
            className="p-8 flex hover:stroke-primary hover:cursor-pointer"
            onClick={() => {
              router.back();
            }}
          >
            <ArrowLeftIcon className="w-6 mr-4" />
            <Avatar address={profileUser} size={2} />
            <span className="text-black p-1 ml-3">{profileUser}</span>
          </div>
          <div className="tabs py-4 px-8 w-full">
            <a
              className={
                (curTab === 0 ? "tab-active " : "") + "tab tab-bordered flex-1"
              }
              onClick={() => handleTabClick(0)}
            >
              Followers {gqlData.followersCount}
            </a>
            <a
              className={
                (curTab === 1 ? "tab-active " : "") + "tab tab-bordered flex-1"
              }
              onClick={() => handleTabClick(1)}
            >
              Following {gqlData.followeesCount}
            </a>
          </div>
          <div className={curTab === 0 ? "" : "hidden"}>
            {followersList.length > 0 ? (
              followersList.map((item: FollowerItemProp, index) => (
                <FollowerItem key={index} {...item} />
              ))
            ) : (
              <p className="text-slate-500 p-8 text-center">no followers</p>
            )}
          </div>
          <div className={curTab === 1 ? "" : "hidden"}>
            {followingList.length > 0 ? (
              followingList.map((item: FollowerItemProp, index) => (
                <FollowerItem key={index} {...item} />
              ))
            ) : (
              <p className="text-slate-500 p-8 text-center">no followers</p>
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
