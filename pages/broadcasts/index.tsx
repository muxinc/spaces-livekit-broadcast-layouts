import React from "react";
import type { NextPage } from "next";
import getConfig from "next/config";
import Head from "next/head";
import { useRouter } from "next/router";

import { SpaceProvider } from "hooks/SpaceProvider";
import { LayoutProvider } from "context/Layout";
import Stage from "../../components/Stage";
import { Layout } from "../../lib/types";

interface Props {
  spaceBackendURL: string;
}

const BroadcastPage: NextPage<Props> = ({ spaceBackendURL = "" }: Props) => {
  let {
    isReady,
    query: {
      token = "",
      background = null,
      layout = Layout.Gallery,
      show_non_publishing_participants: showNonPublishingParticipants = false,
    },
  } = useRouter();
  if (Array.isArray(token)) {
    token = token[0];
  }
  if (Array.isArray(background)) {
    background = background[0];
  }
  if (Array.isArray(layout)) {
    layout = layout[0];
  }
  if (Array.isArray(showNonPublishingParticipants)) {
    showNonPublishingParticipants = showNonPublishingParticipants[0] === "true";
  } else {
    showNonPublishingParticipants = showNonPublishingParticipants === "true";
  }

  if (!isReady) return null;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1.0" />
        <title>Mux Broadcast</title>
      </Head>
      <SpaceProvider
        jwt={token}
        showNonPublishingParticipants={showNonPublishingParticipants as boolean}
      >
        <LayoutProvider backgroundImage={background} layout={layout as Layout}>
          <Stage />
        </LayoutProvider>
      </SpaceProvider>
    </>
  );
};

BroadcastPage.getInitialProps = async (ctx) => {
  const { serverRuntimeConfig } = getConfig();
  return { spaceBackendURL: serverRuntimeConfig.MUX_SPACES_BACKEND_URL };
};

export default BroadcastPage;
