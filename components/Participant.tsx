import React from "react";
import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { RemoteParticipant, Track } from "livekit-client";

import { useParticipant } from "../hooks/useParticipant";
import { useParticipants } from "../hooks/useParticipants";
import useWindowDimensions from "../hooks/useWindowDimensions";
import ParticipantRenderer from "./renderers/ParticipantRenderer";

interface Props {
  rounded: boolean;
  width?: number;
  height?: number;
  gridArea?: string;
  participant: RemoteParticipant;
}

export default function Participant({
  rounded = true,
  width,
  height,
  gridArea,
  participant,
}: Props): JSX.Element {
  const { width: windowWidth = 0, height: windowHeight = 0 } =
    useWindowDimensions();
  const { subscribedTracks } = useParticipant(participant);
  const participants = useParticipants();

  let borderRadius = "0";
  if (rounded && windowWidth > windowHeight) {
    borderRadius = "5px";
  }

  const micTrack = subscribedTracks.find(
    (track) => track.source === Track.Source.Microphone
  );

  const cameraTrack = subscribedTracks.find(
    (track) => track.source === Track.Source.Camera
  );

  if (
    participants &&
    participants.length === 1 &&
    cameraTrack?.dimensions &&
    cameraTrack.dimensions.width < cameraTrack.dimensions.height &&
    windowWidth < windowHeight
  ) {
    width = windowWidth;
    height = windowHeight;
  }

  return (
    <Box
      layout
      layoutId={participant.sid}
      as={motion.div}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      gridArea={gridArea && gridArea}
      width={width && `${width}px`}
      height={height && `${height}px`}
      minWidth="160px"
      minHeight="90px"
      background="black"
      role="group"
      position="relative"
      overflow="hidden"
      borderRadius={borderRadius}
      zIndex={10}
    >
      <ParticipantRenderer participant={participant} />
    </Box>
  );
}
