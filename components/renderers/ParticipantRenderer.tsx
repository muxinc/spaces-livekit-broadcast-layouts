import { Center } from "@chakra-ui/react";
import { RemoteParticipant, Track } from "livekit-client";
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
    (track) => track.source === Track.Source.Microphone
  );

  const cameraTrack = subscribedTracks.find(
    (track) => track.source === Track.Source.Camera
  );

  return (
    <>
      {micTrack?.track && <AudioRenderer track={micTrack.track} />}

      <DisplayNameRenderer participant={participant} />

      {cameraTrack?.track && (
        <VideoRenderer
          connectionId={participant.sid}
          track={cameraTrack.track}
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
