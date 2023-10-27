import { FC, PropsWithChildren } from "react";
import { CookiesProvider } from "react-cookie";

import { WagmiConfig, createConfig, mainnet } from "wagmi";
import { createPublicClient, http } from "viem";

import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WALLET_CONNECT_PROJECT_ID } from "./constants";

const config = createConfig({
  connectors: [
    new WalletConnectConnector({
      options: {
        projectId: WALLET_CONNECT_PROJECT_ID,
      },
    }),
    new InjectedConnector(),
  ],
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
});

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  return (
    <CookiesProvider defaultSetOptions={{ path: "/" }}>
      <WagmiConfig config={config}>{children}</WagmiConfig>
    </CookiesProvider>
  );
};
