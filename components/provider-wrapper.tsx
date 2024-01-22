"use client";

import { getCsrfToken } from "next-auth/react";

import { DynamicContextProvider } from "../lib/dynamic";
import { EthereumWalletConnectors } from "../lib/dynamic";

export default function ProviderWrapper({ children }: React.PropsWithChildren) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
        eventsCallbacks: {
          onAuthSuccess: async (event) => {
            console.log(event);
            const { authToken } = event;

            const csrfToken = await getCsrfToken();

            fetch("/api/auth/callback/credentials", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: `csrfToken=${encodeURIComponent(
                csrfToken
              )}&token=${encodeURIComponent(authToken)}`,
            })
              .then((res) => {
                if (res.ok) {
                  console.log(res);
                  // Handle success - maybe redirect to the home page or user dashboard
                  // window.location.href = "/";
                } else {
                  // Handle any errors - maybe show an error message to the user
                  console.error("Failed to log in");
                }
              })
              .catch((error) => {
                // Handle any exceptions
                console.error("Error logging in", error);
              });
          },
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
