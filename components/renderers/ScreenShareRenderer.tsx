import React, { useEffect, useRef } from "react";
import { Flex } from "@chakra-ui/react";

import { useScreenShare } from "hooks/useScreenShare";

export default function ScreenShareRenderer(): JSX.Element {
  const { screenShareTrack, participantScreenSharing } = useScreenShare();
  const videoEl = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = videoEl.current;
    if (!el) return;

    el.muted = true;
    screenShareTrack?.attach(el);
    return () => {
      screenShareTrack?.detach(el);
    };
  }, [screenShareTrack]);

  return (
    <Flex
      width="100%"
      height="100%"
      flexDirection="column"
      justifyContent="center"
    >
      <div style={{ position: "relative", maxHeight: "100%" }}>
        <video
          style={{ width: "100%", height: "100%" }}
          ref={videoEl}
          autoPlay
          playsInline
        />
      </div>
    </Flex>
  );
}
