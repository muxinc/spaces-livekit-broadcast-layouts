import React from "react";
import { Box } from "@chakra-ui/react";
import { RemoteParticipant } from "livekit-client";
import ParticipantRenderer from "./renderers/ParticipantRenderer";

interface Props {
  participant: RemoteParticipant;
}

export default function CropParticipant({ participant }: Props): JSX.Element {
  return (
    <Box
      width="100%"
      height="100%"
      background="black"
      position="relative"
      overflow="hidden"
      zIndex={10}
    >
      <ParticipantRenderer participant={participant} />
    </Box>
  );
}
