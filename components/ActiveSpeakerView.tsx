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
  ActiveSpeaker,
  TrackSource,
  RemoteTrack,
} from "livekit-client";

import { useSpace } from "../hooks/useRoom";
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
  const { space } = useSpace();
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
                participant
                  .getVideoTracks()
                  .some((track) => track.source === TrackSource.Screenshare)
            )
          : participants?.filter((participant) =>
              participant
                .getVideoTracks()
                .some((track) => track.source === TrackSource.Screenshare)
            );

      const screensharingParticipantWithVideo =
        filteredScreensharingParticipants?.find(
          (participant) => !!participant.getVideoTracks()
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
        (participant) => !!participant.getVideoTracks()
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
      activeSpeakers: Array<ActiveSpeaker>
    ) => {
      const activeSpeakingParticipantIsSpeaking = activeSpeakers.some(
        (speaker) => speaker.participant === activeSpeakingParticipant
      );

      if (activeSpeakingParticipantIsSpeaking) {
        return;
      }

      const newActiveSpeakingParticipant = activeSpeakers.find(
        (speaker) => speaker.participant instanceof RemoteParticipant
      );

      if (newActiveSpeakingParticipant) {
        setActiveSpeakingParticipant(
          newActiveSpeakingParticipant.participant as RemoteParticipant
        );

        if (
          newActiveSpeakingParticipant.participant
            .getVideoTracks()
            .some((track) => track.source === TrackSource.Screenshare)
        ) {
          setActiveScreensharingParticipant(
            newActiveSpeakingParticipant.participant as RemoteParticipant
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
        track.source === TrackSource.Screenshare &&
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
        track.source === TrackSource.Screenshare &&
        activeScreensharingParticipant === participant
      ) {
        setDefaultActiveScreensharingParticipant(participant);
      }
    };

    space?.on(SpaceEvent.ActiveSpeakersChanged, handleActiveSpeakersChanged);
    space?.on(SpaceEvent.ParticipantLeft, handleActiveParticipantLeft);
    space?.on(
      SpaceEvent.ParticipantTrackSubscribed,
      handleScreenshareSubscription
    );
    space?.on(
      SpaceEvent.ParticipantTrackUnsubscribed,
      handleScreenshareUnsubscription
    );

    return () => {
      space?.off(SpaceEvent.ActiveSpeakersChanged, handleActiveSpeakersChanged);
      space?.off(SpaceEvent.ParticipantLeft, handleActiveParticipantLeft);
      space?.off(
        SpaceEvent.ParticipantTrackSubscribed,
        handleScreenshareSubscription
      );
      space?.off(
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
                key={participant.id}
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
                key={participant.id}
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
