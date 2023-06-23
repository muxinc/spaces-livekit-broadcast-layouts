import {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Box, Flex, Center } from "@chakra-ui/react";
import {
  SpaceEvent,
  RemoteParticipant,
  Track,
  RemoteTrack,
  Participant,
} from "livekit-client";

import { useRoom } from "../hooks/useRoom";
import { useScreenShare } from "hooks/useScreenShare";
import { useParticipants } from "../hooks/useParticipants";
import useWindowDimensions from "../hooks/useWindowDimensions";
import ActiveParticipant from "./ActiveParticipant";
import ScreenShareRenderer from "./renderers/ScreenShareRenderer";
import AudioRenderer from "./renderers/AudioRenderer";
import useLayout from "hooks/useLayout";
import { Layout } from "lib/types";

interface Props {}

export default function ActiveSpeakerView({}: Props): JSX.Element {
  const { room } = useRoom();
  const participants = useParticipants();
  const { screenShareTrack, screenShareAudioTrack } = useScreenShare();
  const layout = useLayout();
  const { width = 0, height = 0 } = useWindowDimensions();

  const [activeSpeakingParticipant, setActiveSpeakingParticipant] =
    useState<RemoteParticipant>();

  const [activeScreensharingParticipant, setActiveScreensharingParticipant] =
    useState<RemoteParticipant>();

  const setDefaultActiveScreensharingParticipant = useCallback(
    (oldActiveScreensharingParticipant?: RemoteParticipant) => {
      const filteredScreensharingParticipants =
        oldActiveScreensharingParticipant
          ? participants?.filter(
              (participant) =>
                participant !== oldActiveScreensharingParticipant &&
                Array.from(participant.videoTracks.values())
                  .some((track) => track.source === Track.Source.ScreenShare)
            )
          : participants?.filter((participant) =>
              Array.from(participant.videoTracks.values())
                .some((track) => track.source === Track.Source.ScreenShare)
            );

      const screensharingParticipantWithVideo =
        filteredScreensharingParticipants?.find(
          (participant) => !!participant.videoTracks
        );

      setActiveScreensharingParticipant(
        screensharingParticipantWithVideo ||
          filteredScreensharingParticipants![0]
      );

      return (
        screensharingParticipantWithVideo ||
        filteredScreensharingParticipants![0]
      );
    },
    [activeScreensharingParticipant, participants]
  );

  const setDefaultActiveSpeakingParticipant = useCallback(
    (oldActiveSpeakingParticipant?: RemoteParticipant) => {
      const filteredSpeakingParticipants = oldActiveSpeakingParticipant
        ? participants?.filter(
            (participant) => participant !== oldActiveSpeakingParticipant
          )
        : participants;

      const speakingParticipantWithVideo = filteredSpeakingParticipants?.find(
        (participant) => !!participant.videoTracks
      );

      setActiveSpeakingParticipant(
        speakingParticipantWithVideo || filteredSpeakingParticipants![0]
      );
    },
    [activeSpeakingParticipant, participants]
  );

  useEffect(() => {
    if (!activeSpeakingParticipant && participants && participants.length > 0) {
      const defaultActiveScreensharingParticipant =
        setDefaultActiveScreensharingParticipant();

      if (defaultActiveScreensharingParticipant) {
        setActiveSpeakingParticipant(defaultActiveScreensharingParticipant);
      } else {
        setDefaultActiveSpeakingParticipant();
      }
    }

    const handleActiveSpeakersChanged = (
      activeSpeakers: Array<Participant>
    ) => {
      const activeSpeakingParticipantIsSpeaking = activeSpeakers.some(
        (speaker) => speaker === activeSpeakingParticipant
      );

      if (activeSpeakingParticipantIsSpeaking) {
        return;
      }

      const newActiveSpeakingParticipant = activeSpeakers.find(
        (speaker) => speaker instanceof RemoteParticipant
      );

      if (newActiveSpeakingParticipant) {
        setActiveSpeakingParticipant(
          newActiveSpeakingParticipant as RemoteParticipant
        );

        if (
          Array.from(newActiveSpeakingParticipant.videoTracks.values())
            .some((track) => track.source === Track.Source.ScreenShare)
        ) {
          setActiveScreensharingParticipant(
            newActiveSpeakingParticipant as RemoteParticipant
          );
        }
      }
    };

    const handleActiveParticipantLeft = (participant: RemoteParticipant) => {
      if (participant === activeSpeakingParticipant) {
        setDefaultActiveSpeakingParticipant(participant);
      }

      if (participant === activeScreensharingParticipant) {
        setDefaultActiveScreensharingParticipant(participant);
      }
    };

    const handleScreenshareSubscription = (
      participant: RemoteParticipant,
      track: RemoteTrack
    ) => {
      if (
        track.source === Track.Source.ScreenShare &&
        !activeScreensharingParticipant
      ) {
        setActiveScreensharingParticipant(participant);
      }
    };

    const handleScreenshareUnsubscription = (
      participant: RemoteParticipant,
      track: RemoteTrack
    ) => {
      if (
        track.source === Track.Source.ScreenShare &&
        activeScreensharingParticipant === participant
      ) {
        setDefaultActiveScreensharingParticipant(participant);
      }
    };

    room?.on(SpaceEvent.ActiveSpeakersChanged, handleActiveSpeakersChanged);
    room?.on(SpaceEvent.ParticipantLeft, handleActiveParticipantLeft);
    room?.on(
      SpaceEvent.ParticipantTrackSubscribed,
      handleScreenshareSubscription
    );
    room?.on(
      SpaceEvent.ParticipantTrackUnsubscribed,
      handleScreenshareUnsubscription
    );

    return () => {
      room?.off(SpaceEvent.ActiveSpeakersChanged, handleActiveSpeakersChanged);
      room?.off(SpaceEvent.ParticipantLeft, handleActiveParticipantLeft);
      room?.off(
        SpaceEvent.ParticipantTrackSubscribed,
        handleScreenshareSubscription
      );
      room?.off(
        SpaceEvent.ParticipantTrackUnsubscribed,
        handleScreenshareUnsubscription
      );
    };
  });

  const [participantContainerWidth, setParticipantContainerWidth] = useState<
    number | null
  >(null);
  const [participantContainerHeight, setParticipantContainerHeight] = useState<
    number | null
  >(null);
  const participantContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (participantContainerRef.current) {
      setParticipantContainerWidth(participantContainerRef.current.clientWidth);
      setParticipantContainerHeight(
        participantContainerRef.current.clientHeight
      );
    }
  });

  let overlaySpeaker = false;
  if (screenShareTrack) {
    if (width <= height || layout === Layout.Crop) {
      overlaySpeaker = true;
    }
  }

  function renderLayout() {
    if (overlaySpeaker) {
      const square = height >= width;
      let offset =
        layout !== Layout.Crop ? (width === height ? "60px" : "36px") : "0px";

      let participantWidth;
      let participantHeight;

      if (width > height) {
        participantWidth = "383px";
        participantHeight = "215.44px";
      } else if (width === height) {
        participantWidth = "240px";
        participantHeight = "240px";
      } else {
        participantWidth = "360px";
        participantHeight = "360px";
      }

      return (
        <>
          {screenShareTrack && <ScreenShareRenderer />}
          {screenShareAudioTrack && (
            <AudioRenderer track={screenShareAudioTrack} />
          )}
          <Box
            right={offset}
            bottom={offset}
            position="absolute"
            width={participantWidth}
            height={participantHeight}
            ref={participantContainerRef}
          >
            {participants?.map((participant) => (
              <ActiveParticipant
                square={square}
                key={participant.sid}
                hidden={activeSpeakingParticipant !== participant}
                participant={participant}
                parentWidth={participantContainerWidth}
                parentHeight={participantContainerHeight}
              />
            ))}
          </Box>
        </>
      );
    } else {
      return (
        <>
          {screenShareTrack && <ScreenShareRenderer />}
          {screenShareAudioTrack && (
            <AudioRenderer track={screenShareAudioTrack} />
          )}
          <Box
            display="flex"
            margin="auto"
            width={screenShareTrack ? "400px" : "100%"}
            height="100%"
            ref={participantContainerRef}
            marginLeft={screenShareTrack ? "30px" : ""}
          >
            {participants?.map((participant) => (
              <ActiveParticipant
                key={participant.sid}
                square={width === height}
                hidden={activeSpeakingParticipant !== participant}
                participant={participant}
                parentWidth={participantContainerWidth}
                parentHeight={participantContainerHeight}
              />
            ))}
          </Box>
        </>
      );
    }
  }

  return (
    <Box height="100%" zIndex={100}>
      <Flex
        zIndex={100}
        direction="row"
        height="100%"
        alignItems="center"
        justifyContent="space-between"
      >
        {renderLayout()}
      </Flex>
    </Box>
  );
}
