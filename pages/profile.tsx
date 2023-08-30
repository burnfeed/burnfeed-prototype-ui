import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../layout";
import Avatar from "../components/Avatar";
import { parseCID, shortAddress } from "../utils";
import { useSimpubProvider } from "../provider/SimpubProvider";
import { USERS_BY_ID } from "../graphql/queries";
import { useLazyQuery } from "@apollo/client";
import FeedsList from "../components/FeedsList";
import Link from "next/link";
import { useProfileProvider } from "../provider/ProfileProvider";
import FollowBtn from "../components/FollowBtn";

export default function UserProfile() {
  const router = useRouter();
  const [profileUser, setProfileUser] = useState("");
  const [gqlData, setGqlData] = useState<any | null>(null);
  const [curTab, setCurTab] = useState(0);
  const { txSendCount } = useSimpubProvider();
  const [postsList, setPostsList] = useState<any[]>([]);
  const [repliesList, setRepliesList] = useState<any[]>([]);
  const [likesList, setLikesList] = useState<any[]>([]);

  const [fetchGql, { stopPolling, refetch }] = useLazyQuery(USERS_BY_ID, {
    variables: {
      id: profileUser.toLowerCase(),
    },
    pollInterval: 1000,
    onCompleted(data: any) {
      const users = data.users;
      console.log("USERS_BY_ID res: ", data);
      if (users) {
        stopPolling();
        if (users[0]) {
          setGqlData(users[0]);
          setPostsList(
            users[0].tweets.filter(
              (item: any) =>
                item.subtype == 0 || item.subtype == 6 || item.subtype == 7
            )
          );
          setRepliesList(
            users[0].tweets.filter((item: any) => item.subtype == 1)
          );
          setLikesList(users[0].likes.map((item: any) => item.tweet));
        } else {
          setGqlData({});
          setPostsList([]);
          setRepliesList([]);
          setLikesList([]);
        }
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
    fetchGql();
  };

  useEffect(() => {
    if (txSendCount > 0)
      refetch({
        fetchPolicy: "network-only",
      });
  }, [txSendCount]);

  useEffect(() => {
    if (router.query.user && router.query.user !== profileUser) {
      // if (router.query.tab && router.query.tab == `${curTab}`) return;
      initFetch();
    }
  }, [router.query.user]);

  return (
    <Layout title="">
      {profileUser ? (
        <>
          <div className="flex space-x-2 md:space-x-4 p-2 md:p-8">
            <div className="hidden md:block">
              <Avatar size={4} address={profileUser} />
            </div>
            <div className="block md:hidden">
              <Avatar size={3} address={profileUser} />
            </div>
            <div className="flex-1">
              <div className="">
                <p className="font-semibold text-black hidden md:block">
                  {profileUser}
                </p>
                <p className="font-semibold text-black block md:hidden">
                  {shortAddress(profileUser)}
                </p>
                {gqlData && (
                  <p className="text-slate-600">
                    <Link
                      href={`/followers?user=${profileUser}&tab=0&`}
                      className="mr-2 md:mr-4 hover:text-primary"
                    >
                      flollowers:{" "}
                      {gqlData.followersCount ? gqlData.followersCount : 0}
                    </Link>
                    <Link
                      href={`/followers?user=${profileUser}&tab=1&`}
                      className="mr-2 md:mr-4 hover:text-primary"
                    >
                      flollowing:{" "}
                      {gqlData.followeesCount ? gqlData.followeesCount : 0}
                    </Link>
                  </p>
                )}
              </div>
            </div>
            <div>
              <FollowBtn user={profileUser} />
            </div>
          </div>
          <div className="tabs py-4 px-8 w-full">
            <a
              className={
                (curTab === 0 ? "tab-active " : "") + "tab tab-bordered flex-1"
              }
              onClick={() => handleTabClick(0)}
            >
              Posts{" "}
              {gqlData &&
                (gqlData.tweetsCount ? gqlData.tweetsCount : 0) +
                  (gqlData.retweetsCount ? gqlData.retweetsCount : 0)}
            </a>
            <a
              className={
                (curTab === 1 ? "tab-active " : "") + "tab tab-bordered flex-1"
              }
              onClick={() => handleTabClick(1)}
            >
              Replies{" "}
              {gqlData && gqlData.commentsCount ? gqlData.commentsCount : ""}
            </a>
            <a
              className={
                (curTab === 2 ? "tab-active " : "") + "tab tab-bordered flex-1"
              }
              onClick={() => handleTabClick(2)}
            >
              Likes {gqlData && gqlData.likesCount ? gqlData.likesCount : ""}
            </a>
          </div>
          {gqlData ? (
            <div className="px-8">
              <div className={curTab === 0 ? "" : "hidden"}>
                {postsList.length > 0 ? (
                  <FeedsList gqlData={postsList} />
                ) : (
                  <p className="text-center text-slate-400">no posts</p>
                )}
              </div>
              <div className={curTab === 1 ? "" : "hidden"}>
                {repliesList.length > 0 ? (
                  <FeedsList gqlData={repliesList} />
                ) : (
                  <p className="text-center text-slate-400">no posts</p>
                )}
              </div>
              <div className={curTab === 2 ? "" : "hidden"}>
                {likesList.length > 0 ? (
                  <FeedsList gqlData={likesList} />
                ) : (
                  <p className="text-center text-slate-400">no posts</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 m-auto text-center">
              <span className="loading loading-infinity loading-lg"></span>
              <div>Loading Feeds...</div>
            </div>
          )}
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
