import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Track,
  RemoteParticipant,
  RemoteTrack,
  TrackSource,
  RoomEvent,
  LocalTrack,
  LocalParticipant,
} from "livekit-client";

import { useRoom } from "./useRoom";
import { useLocalParticipant } from "./useLocalParticipant";
import { DisplayMediaContext } from "./DisplayMediaContext";

type Props = {
  children: ReactNode;
};

export const DisplayMediaProvider: React.FC<Props> = ({ children }) => {
  const { room } = useRoom();
  const localParticipant = useLocalParticipant();
  const [screenShareTrack, setScreenShareTrack] = useState<Track | null>(null);
  const [screenShareAudioTrack, setScreenShareAudioTrack] =
    useState<Track | null>(null);
  const [screenShareError, setScreenShareError] = useState("");
  const [participantScreenSharing, setParticipantScreenSharing] =
    useState<RemoteParticipant | null>(null);

  const isLocalScreenShare = useMemo(() => {
    return participantScreenSharing instanceof LocalParticipant;
  }, [participantScreenSharing]);

  // Screenshare subscribed
  useEffect(() => {
    const handleScreenShareSubscribed = (
      participant: RemoteParticipant,
      track: RemoteTrack
    ) => {
      if (track.source === TrackSource.Screenshare) {
        setScreenShareTrack(track);
        setParticipantScreenSharing(participant);
      }

      if (track.source === TrackSource.ScreenshareAudio) {
        setScreenShareAudioTrack(track);
        setParticipantScreenSharing(participant);
      }
    };

    room?.on(
      SpaceEvent.ParticipantTrackSubscribed,
      handleScreenShareSubscribed
    );

    return () => {
      room?.off(
        SpaceEvent.ParticipantTrackSubscribed,
        handleScreenShareSubscribed
      );
    };
  }, [room]);

  // Screenshare unsubscribed
  useEffect(() => {
    const handleScreenShareUnsubscribed = (
      _participant: RemoteParticipant,
      track: RemoteTrack
    ) => {
      if (track.source === TrackSource.Screenshare) {
        setScreenShareTrack(null);
        setParticipantScreenSharing(null);
      }

      if (track.source === TrackSource.ScreenshareAudio) {
        setScreenShareTrack(null);
        setParticipantScreenSharing(null);
      }
    };

    room?.on(
      SpaceEvent.ParticipantTrackUnpublished,
      handleScreenShareUnsubscribed
    );

    return () => {
      room?.off(
        SpaceEvent.ParticipantTrackSubscribed,
        handleScreenShareUnsubscribed
      );
    };
  }, [room]);

  const toggleScreenShare = useCallback(async () => {
    if (screenShareTrack) {
      // Shouldn't happen, but just to prevent a bug being added later
      if (!isLocalScreenShare || !(screenShareTrack instanceof LocalTrack)) {
        console.error(
          "Invalid state. Screen share toggled while someone else is sharing."
        );
        return;
      }

      // Stop screen share
      localParticipant?.unpublishTracks([screenShareTrack]);
      screenShareTrack.track?.stop();
      setScreenShareTrack(null);
      setParticipantScreenSharing(null);
    }
  }, [localParticipant, screenShareTrack, isLocalScreenShare]);

  return (
    <DisplayMediaContext.Provider
      value={{
        screenShareTrack,
        screenShareAudioTrack,
        isLocalScreenShare,
        toggleScreenShare,
        screenShareError,
        participantScreenSharing,
      }}
    >
      {children}
    </DisplayMediaContext.Provider>
  );
};
