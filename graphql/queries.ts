import { gql } from "@apollo/client";

export const USERS_BY_ID = gql`
  query users($id: String!) {
    users(first: 1, where: { id: $id }) {
      id
      followeesCount
      followersCount
      tweetsCount
      retweetsCount
      commentsCount
      likesCount
      lastTweetUpdate
      tweets(first: 100, orderBy: timestamp, orderDirection: desc) {
        id
        subtype
        likesCount
        commentsCount
        retweetCount
        timestamp
        burn
        commentOriginTweet {
          id
          subtype
          timestamp
          commentsCount
          likesCount
          retweetCount
          burn
          user {
            id
          }
        }
        repostOriginTweet {
          id
          subtype
          timestamp
          commentsCount
          likesCount
          retweetCount
          burn
          user {
            id
          }
        }
        quoteOriginTweet {
          id
          subtype
          timestamp
          commentsCount
          likesCount
          retweetCount
          burn
          user {
            id
          }
        }
      }
      likes(first: 100, orderBy: timestamp, orderDirection: desc) {
        id
        user {
          id
        }
        tweet {
          id
          subtype
          likesCount
          commentsCount
          retweetCount
          burn
          timestamp
        }
        timestamp
      }
    }
  }
`;

export const USERS_PROFILE_BY_ID = gql`
  query users($id: String!) {
    users(first: 1, where: { id: $id }) {
      id
      followeesCount
      followersCount
      tweetsCount
      retweetsCount
      commentsCount
      likesCount
      lastTweetUpdate
      followees {
        id
      }
      followers {
        id
      }
      tweets(
        first: 1000
        orderBy: timestamp
        orderDirection: desc
        subtype_not: 0
      ) {
        id
        subtype
        timestamp
        commentOriginTweet {
          id
        }
        repostOriginTweet {
          id
        }
        quoteOriginTweet {
          id
        }
      }
      likes(first: 1000, orderBy: timestamp, orderDirection: desc) {
        id
        user {
          id
        }
        tweet {
          id
        }
        timestamp
      }
    }
  }
`;

export const USERS_FOLLOWERS = gql`
  query users($id: String!) {
    users(first: 1, where: { id: $id }) {
      id
      followeesCount
      followersCount
      followees(first: 100) {
        id
      }
      followers(first: 100) {
        id
      }
    }
  }
`;

export const GQL_FEEDS_ALL = gql`
  query GetTweets(
    $first: Int!
    $skip: Int!
    $orderBy: String
    $orderDirection: String
  ) {
    tweets(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      subtype
      timestamp
      commentsCount
      likesCount
      retweetCount
      burn
      user {
        id
      }
      comments {
        id
      }
      likes {
        id
      }
      commentOriginTweet {
        id
        subtype
        timestamp
        commentsCount
        likesCount
        retweetCount
        burn
        user {
          id
        }
      }
      repostOriginTweet {
        id
        subtype
        timestamp
        commentsCount
        likesCount
        retweetCount
        burn
        user {
          id
        }
      }
      quoteOriginTweet {
        id
        subtype
        timestamp
        commentsCount
        likesCount
        retweetCount
        burn
        user {
          id
        }
      }
    }
  }
`;

export const GQL_FEEDS_FOLLOWING = gql`
  query GetTweets(
    $first: Int!
    $skip: Int!
    $orderBy: String
    $orderDirection: String
    $followeeList: [String]
  ) {
    tweets(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { user_in: $followeeList }
    ) {
      id
      subtype
      timestamp
      commentsCount
      likesCount
      retweetCount
      burn
      user {
        id
      }
      comments {
        id
      }
      likes {
        id
      }
      commentOriginTweet {
        id
        subtype
        timestamp
        commentsCount
        likesCount
        retweetCount
        burn
        user {
          id
        }
      }
      repostOriginTweet {
        id
        subtype
        timestamp
        commentsCount
        likesCount
        retweetCount
        burn
        user {
          id
        }
      }
      quoteOriginTweet {
        id
        subtype
        timestamp
        commentsCount
        likesCount
        retweetCount
        burn
        user {
          id
        }
      }
    }
  }
`;

export const GQL_FEEDS_BY_SUBTYPE = gql`
  query GetTweets(
    $first: Int!
    $skip: Int!
    $orderBy: String
    $orderDirection: String
    $subtype: Int
  ) {
    tweets(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { subtype: $subtype }
    ) {
      id
      subtype
      commentsCount
      retweetCount
      likesCount
      likes
      burn
      timestamp
    }
  }
`;

export const GQL_FEED_ID = gql`
  query GetTweetByID($cid: String!) {
    tweets(where: { id: $cid }) {
      id
      subtype
      timestamp
      commentsCount
      likesCount
      retweetCount
      burn
      commentOriginTweet {
        id
        subtype
        timestamp
        commentsCount
        likesCount
        retweetCount
        burn
        user {
          id
        }
      }
      repostOriginTweet {
        id
        subtype
        timestamp
        commentsCount
        likesCount
        retweetCount
        burn
        user {
          id
        }
      }
      quoteOriginTweet {
        id
        subtype
        timestamp
        commentsCount
        likesCount
        retweetCount
        burn
        user {
          id
        }
      }
      comments(first: 100, orderBy: timestamp, orderDirection: desc) {
        id
        subtype
        commentOriginTweet {
          id
        }
        repostOriginTweet {
          id
        }
        quoteOriginTweet {
          id
        }
        likesCount
        commentsCount
        retweetCount
        burn
        timestamp
        user {
          id
        }
      }
    }
  }
`;
