import React from "react";
import { Box } from "@chakra-ui/react";
import { RemoteParticipant } from "livekit-client";
import ParticipantRenderer from "./renderers/ParticipantRenderer";

interface Props {
  participant: RemoteParticipant;
  parentWidth: number | null;
  parentHeight: number | null;
  hidden: boolean;
  square?: boolean;
}

export default function ActiveParticipant({
  participant,
  parentWidth,
  parentHeight,
  hidden,
  square,
}: Props): JSX.Element {
  const getDimensions = () => {
    if (parentWidth && parentHeight && !square) {
      const isParentWide = parentWidth / parentHeight > 16 / 9;

      if (parentHeight > parentWidth) {
        return { width: "100%" };
      }

      return isParentWide
        ? {
            height: "100%",
            width: `${(parentHeight * 16) / 9}px`,
          }
        : {
            width: "100%",
            height: `${(parentWidth * 9) / 16}px`,
          };
    } else {
      return {
        height: "100%",
      };
    }
  };

  return (
    <Box
      position="relative"
      textAlign="center"
      overflow="hidden"
      zIndex={10}
      margin="auto"
      hidden={hidden}
      {...getDimensions()}
    >
      <ParticipantRenderer participant={participant} />
    </Box>
  );
}
