import React from "react";
import { Box } from "@chakra-ui/react";

import { useParticipants } from "../hooks/useParticipants";
import useWindowDimensions from "../hooks/useWindowDimensions";

import GalleryLayout from "./GalleryLayout";
import Participant from "./Participant";
import { useScreenShare } from "hooks/useScreenShare";
import AudioRenderer from "./renderers/AudioRenderer";

interface Props {}

export default function Gallery({}: Props): JSX.Element {
  const { width: windowWidth = 0, height: windowHeight = 0 } =
    useWindowDimensions();
  const participants = useParticipants();
  const { screenShareAudioTrack } = useScreenShare();

  let gap = 10;
  let padding = 0;
  let rounded = false;
  let aspectRatio = 9 / 16;

  if (windowWidth === windowHeight) {
    padding = 10;
    aspectRatio = 1;
  } else if (windowWidth > windowHeight) {
    gap = 30;
    padding = 60;
    aspectRatio = 16 / 9;
    rounded = true;
  } else if (windowWidth < windowHeight) {
    if (participants && participants?.length <= 4) {
      aspectRatio = 16 / 9;
    } else if (participants && participants.length > 4) {
      aspectRatio = 1;
    }
  }

  const galleryWidth = windowWidth - padding * 2;
  const galleryHeight = windowHeight - padding * 2;

  return (
    <Box width="100%" height="100%" padding={`${padding}px`} zIndex={100}>
      {screenShareAudioTrack && <AudioRenderer track={screenShareAudioTrack} />}

      <GalleryLayout
        gap={gap}
        width={galleryWidth}
        height={galleryHeight}
        aspectRatio={aspectRatio}
      >
        {participants?.map((participant) => {
          return (
            <Participant
              key={participant.sid}
              participant={participant}
              rounded={rounded}
            />
          );
        })}
      </GalleryLayout>
    </Box>
  );
}
