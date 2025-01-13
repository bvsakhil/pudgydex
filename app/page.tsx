"use client";

import HuddlePage from "../page";
import { PrivyProvider } from "@privy-io/react-auth";

export default function SyntheticV0PageForDeployment() {
  return (
    <PrivyProvider
      appId="cm5vh1ocm00mfw5ngvqx1l3wl"
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          logo: "https://pbs.twimg.com/profile_images/1876724785264345088/W2F8RoP__400x400.jpg",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <HuddlePage />
    </PrivyProvider>
  );
}
