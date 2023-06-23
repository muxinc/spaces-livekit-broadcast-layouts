import React from "react";
import { Spinner, Center, Flex } from "@chakra-ui/react";

import { useRoom } from "../hooks/useRoom";
import { useScreenShare } from "hooks/useScreenShare";
import useWindowDimensions from "../hooks/useWindowDimensions";
import Gallery from "./Gallery";
import ActiveSpeakerView from "./ActiveSpeakerView";
import ScreenShareLayout from "./ScreenShareLayout";
import { Layout } from "../lib/types";
import useBackgroundImage from "hooks/useBackgroundImage";
import useLayout from "hooks/useLayout";
import Crop from "./Crop";

export default function Stage(): JSX.Element {
  const { room } = useRoom();
  const { width = 0, height = 0 } = useWindowDimensions();
  const { screenShareTrack } = useScreenShare();
  const backgroundImage = useBackgroundImage();
  const layout = useLayout();

  const bkgImg =
    backgroundImage === null ? "none" : `url('${backgroundImage}')`;

  const renderLayout = () => {
    if (layout === Layout.Gallery) {
      if (width > height) {
        return screenShareTrack ? <ScreenShareLayout /> : <Gallery />;
      } else {
        return screenShareTrack ? <ActiveSpeakerView /> : <Gallery />;
      }
    } else if (layout === Layout.ActiveSpeaker) {
      return <ActiveSpeakerView />;
    }
    // crop layout
    else {
      return screenShareTrack ? <ActiveSpeakerView /> : <Crop />;
    }
  };

  return (
    <>
      <Flex
        direction="column"
        height="100%"
        overflow="hidden"
        backgroundColor="#323232"
        backgroundImage={bkgImg}
        backgroundRepeat="no-repeat"
        backgroundPosition="top left"
      >
        {!room ? (
          <Center height="100%">
            <Spinner colorScheme="purple" size="xl" />
          </Center>
        ) : (
          renderLayout()
        )}
      </Flex>
    </>
  );
}
