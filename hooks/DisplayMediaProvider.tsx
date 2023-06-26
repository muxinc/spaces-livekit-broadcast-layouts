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
  RoomEvent,
  LocalTrack,
  LocalParticipant,
  RemoteTrackPublication,
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
      track: RemoteTrack,
      _publication: RemoteTrackPublication,
      participant: RemoteParticipant,
    ) => {
      if (track.source === Track.Source.ScreenShare) {
        setScreenShareTrack(track);
        setParticipantScreenSharing(participant);
      }

      if (track.source === Track.Source.ScreenShareAudio) {
        setScreenShareAudioTrack(track);
        setParticipantScreenSharing(participant);
      }
    };

    room?.on(
      RoomEvent.TrackSubscribed,
      handleScreenShareSubscribed
    );

    return () => {
      room?.off(
        RoomEvent.TrackSubscribed,
        handleScreenShareSubscribed
      );
    };
  }, [room]);

  // Screenshare unsubscribed
  useEffect(() => {
    const handleScreenShareUnsubscribed = (
      publication: RemoteTrackPublication,
      _participant: RemoteParticipant,
    ) => {
      if (publication.source === Track.Source.ScreenShare) {
        setScreenShareTrack(null);
        setParticipantScreenSharing(null);
      }

      if (publication.source === Track.Source.ScreenShareAudio) {
        setScreenShareTrack(null);
        setParticipantScreenSharing(null);
      }
    };

    room?.on(
      RoomEvent.TrackUnpublished,
      handleScreenShareUnsubscribed
    );

    return () => {
      room?.off(
        RoomEvent.TrackUnpublished,
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
      screenShareTrack?.stop();
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
