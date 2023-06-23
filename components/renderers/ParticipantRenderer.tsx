import { Center } from "@chakra-ui/react";
import { RemoteParticipant, TrackSource } from "@mux/spaces-web";
import VideoOff from "components/icons/VideoOff";
import { useParticipant } from "hooks/useParticipant";
import AudioRenderer from "./AudioRenderer";
import DisplayNameRenderer from "./DisplayNameRenderer";
import VideoRenderer from "./VideoRenderer";

interface Props {
  participant: RemoteParticipant;
}

export default function ParticipantRenderer({ participant }: Props) {
  const { isCameraOff, subscribedTracks } = useParticipant(participant);

  const micTrack = subscribedTracks.find(
    (track) => track.source === TrackSource.Microphone
  );

  const cameraTrack = subscribedTracks.find(
    (track) => track.source === TrackSource.Camera
  );

  return (
    <>
      {micTrack && <AudioRenderer track={micTrack} />}

      <DisplayNameRenderer participant={participant} />

      {cameraTrack && (
        <VideoRenderer
          connectionId={participant.connectionId}
          track={cameraTrack}
        />
      )}

      {(isCameraOff || !cameraTrack) && (
        <Center
          background="#000000"
          position="absolute"
          left="0"
          top="0"
          w="100%"
          h="100%"
        >
          {isCameraOff && <VideoOff width="45" height="45" color="#E8E8E8" />}
        </Center>
      )}
    </>
  );
}
