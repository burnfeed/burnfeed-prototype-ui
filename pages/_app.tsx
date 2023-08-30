import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "toastify-js/src/toastify.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { taiko } from "../config/chain";
import { publicProvider } from "wagmi/providers/public";
import { useApollo } from "../graphql/apolloClient";
import { SimpubProvider } from "../provider/SimpubProvider";
import { ModalProvider } from "../provider/ModalProvider";
import { ProfileProvider } from "../provider/ProfileProvider";
import { IPFSProvider } from "../provider/IPFSProvider";
import { ApolloProvider } from "@apollo/client";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [taiko],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "BurnFeed",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps);

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} initialChain={taiko}>
        <ApolloProvider client={apolloClient}>
          <IPFSProvider>
            <SimpubProvider>
              <ProfileProvider>
                <ModalProvider>
                  <Component {...pageProps} />
                </ModalProvider>
              </ProfileProvider>
            </SimpubProvider>
          </IPFSProvider>
        </ApolloProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
