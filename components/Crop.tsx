import React from "react";
import { Box } from "@chakra-ui/react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { useParticipants } from "../hooks/useParticipants";
import useWindowDimensions from "../hooks/useWindowDimensions";
import { wideCrop, squareCrop, portraitCrop } from "lib/crop";

import { useScreenShare } from "hooks/useScreenShare";
import AudioRenderer from "./renderers/AudioRenderer";
import CropParticipant from "./CropParticipant";

interface ContainerProps {
  x: number;
  y: number;
  w: number;
  h: number;
}

const FadeIn = keyframes`
from {
  opacity: 0;
}
to {
  opacity: 1;
}
`;

const Container = styled.div<ContainerProps>`
  position: absolute;
  left: ${({ x }) => x * 100 + "%"};
  top: ${({ y }) => y * 100 + "%"};
  width: ${({ w }) => w * 100 + "%"};
  height: ${({ h }) => h * 100 + "%"};
  transition-property: left, top, width, height;
  transition-duration: 0.3s;
  animation: ${FadeIn} 0.3s;
`;

export default function Crop(): JSX.Element {
  const { width: windowWidth = 0, height: windowHeight = 0 } =
    useWindowDimensions();
  const { screenShareAudioTrack } = useScreenShare();

  let layoutPositions: typeof wideCrop;
  if (windowWidth > windowHeight) {
    layoutPositions = wideCrop;
  } else if (windowWidth === windowHeight) {
    layoutPositions = squareCrop;
  } else {
    layoutPositions = portraitCrop;
  }

  const participants =
    useParticipants()?.slice(0, layoutPositions.length) || [];

  return (
    <Box width="100%" height="100%">
      {screenShareAudioTrack && <AudioRenderer track={screenShareAudioTrack} />}
      {participants.map((participant, index) => {
        const position = layoutPositions[participants.length - 1][index];
        return (
          <Container key={index} {...position}>
            <CropParticipant key={participant.id} participant={participant} />
          </Container>
        );
      })}
    </Box>
  );
}
