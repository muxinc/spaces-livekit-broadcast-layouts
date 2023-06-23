import React from "react";
import type { NextPage } from "next";
import getConfig from "next/config";
import Head from "next/head";
import { useRouter } from "next/router";

import { RoomProvider } from "hooks/RoomProvider";
import { LayoutProvider } from "context/Layout";
import Stage from "../../components/Stage";
import { Layout } from "../../lib/types";

interface Props {}

const BroadcastPage: NextPage<Props> = ({}: Props) => {
  let {
    isReady,
    query: {
      url = "",
      token = "",
      background = null,
      template = Layout.Gallery,
      show_non_publishing_participants: showNonPublishingParticipants = false,
    },
  } = useRouter();
  if (Array.isArray(token)) {
    token = token[0];
  }
  if (Array.isArray(background)) {
    background = background[0];
  }
  if (Array.isArray(template)) {
    template = template[0];
  }
  if (Array.isArray(url)) {
    url = url[0];
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
      <RoomProvider
        livekitUrl={url}
        jwt={token}
        showNonPublishingParticipants={showNonPublishingParticipants as boolean}
      >
        <LayoutProvider backgroundImage={background} layout={template as Layout}>
          <Stage />
        </LayoutProvider>
      </RoomProvider>
    </>
  );
};

BroadcastPage.getInitialProps = async (ctx) => {
  const { serverRuntimeConfig } = getConfig();
  return { spaceBackendURL: serverRuntimeConfig.MUX_SPACES_BACKEND_URL };
};

export default BroadcastPage;
