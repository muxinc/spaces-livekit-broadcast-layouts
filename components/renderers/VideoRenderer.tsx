import React, { useEffect, useRef, useState } from "react";
import { Track } from "livekit-client";

interface Props {
  track: Track;
  connectionId: string;
}

export default function VideoRenderer({
  track,
  connectionId,
}: Props): JSX.Element {
  const videoEl = useRef<HTMLVideoElement | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const el = videoEl.current;
    if (!el) return;

    el.muted = true;
    const handleVideoLoaded = () => setVideoLoaded(true);
    el.addEventListener("loadeddata", handleVideoLoaded);
    track.attach(el);
    return () => {
      el.removeEventListener("loadeddata", handleVideoLoaded);
      track.detach(el);
    };

    // The MediaStreamTrack prop needs to be observed rather than the Mux Track
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.track]);

  return (
    <video
      id={connectionId}
      ref={videoEl}
      autoPlay
      playsInline
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        backgroundColor: videoLoaded ? "transparent" : "#000000",
      }}
    />
  );
}
