import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useLazyQuery } from "@apollo/client";
import { USERS_PROFILE_BY_ID } from "../graphql/queries";
import { useSimpubProvider } from "./SimpubProvider";

const ProfileProviderContext = createContext<{
  fetchProfile: () => any | null;
  profileData: any | null;
} | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profileData, setProfileData] = useState<any | null>(null);
  const { address, isConnected, isDisconnected } = useAccount();
  const { txSendCount } = useSimpubProvider();

  const [fetchProfile, { loading, error }] = useLazyQuery(USERS_PROFILE_BY_ID, {
    variables: {
      id: address?.toLocaleLowerCase(),
    },
    onCompleted(data: any) {
      if (!data || !data.users) return;
      const users = data.users;
      console.log("USERS_PROFILE_BY_ID res: ", users);
      if (users && users[0]) {
        let followeesSet = new Set();
        let likesSet = new Set();
        let commentsSet = new Set();
        let repostsSet = new Set();
        let quotesSet = new Set();
        for (let i = 0; i < users[0].followees.length; i++) {
          const row = users[0].followees[i];
          followeesSet.add(row.id);
        }
        for (let i = 0; i < users[0].likes.length; i++) {
          const row = users[0].likes[i];
          likesSet.add(row.tweet.id);
        }
        for (let i = 0; i < users[0].tweets.length; i++) {
          const row = users[0].tweets[i];
          if (row.subtype == 1) {
            commentsSet.add(row.commentOriginTweet.id);
          } else if (row.subtype == 6) {
            repostsSet.add(row.repostOriginTweet.id);
          } else if (row.subtype == 7) {
            quotesSet.add(row.quoteOriginTweet.id);
          }
        }
        setProfileData(null);
        setProfileData({
          ...users[0],
          followeesSet,
          likesSet,
          commentsSet,
          repostsSet,
          quotesSet,
          last_updated: new Date().getTime(),
        });
      }
    },
  });

  useEffect(() => {
    if (isConnected && address) {
      fetchProfile();
    }
  }, [isConnected, address]);

  useEffect(() => {
    if(txSendCount) {
      fetchProfile({
        fetchPolicy: "network-only",
      });
    }
  }, [txSendCount])

  return (
    <ProfileProviderContext.Provider
      value={{
        profileData,
        fetchProfile,
      }}
    >
      {children}
    </ProfileProviderContext.Provider>
  );
}

export function useProfileProvider() {
  const context = useContext(ProfileProviderContext);
  if (!context) {
    throw new Error(
      "useProfileProvider must be used within a InputModalProvider"
    );
  }
  return context;
}
