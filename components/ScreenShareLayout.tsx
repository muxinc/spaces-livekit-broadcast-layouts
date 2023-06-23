import { Center, Flex, Grid } from "@chakra-ui/react";

import { useParticipants } from "../hooks/useParticipants";
import ScreenShareRenderer from "./renderers/ScreenShareRenderer";
import Participant from "./Participant";
import { generateScreenshareGalleryTemplateAreas } from "../lib/gallery";
import { useScreenShare } from "hooks/useScreenShare";
import AudioRenderer from "./renderers/AudioRenderer";

export default function ScreenShareLayout(): JSX.Element {
  const participants = useParticipants();
  const { screenShareAudioTrack } = useScreenShare();
  const numParticipants = participants?.length || 0;
  const gridTemplateAreas =
    generateScreenshareGalleryTemplateAreas(numParticipants);

  return (
    <Flex
      zIndex={100}
      direction="row"
      height="100%"
      padding="60px"
      alignItems="center"
      justifyContent="space-between"
    >
      {screenShareAudioTrack && <AudioRenderer track={screenShareAudioTrack} />}
      <ScreenShareRenderer />
      <Grid
        width={numParticipants > 5 ? "600px" : "400px"}
        height="100%"
        alignContent="center"
        gridTemplateAreas={`${gridTemplateAreas}`}
        rowGap="30px"
        columnGap="30px"
        marginLeft="30px"
      >
        {participants?.map((participant, index) => {
          const gridArea = String.fromCharCode("A".charCodeAt(0) + index);
          return (
            <Participant
              key={participant.id}
              participant={participant}
              rounded={true}
              gridArea={gridArea}
            />
          );
        })}
      </Grid>
    </Flex>
  );
}
