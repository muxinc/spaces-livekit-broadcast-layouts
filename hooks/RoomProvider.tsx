import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  LocalParticipant,
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
} from "livekit-client";

import { MuxContext } from "./MuxContext";
import { DisplayMediaProvider } from "./DisplayMediaProvider";
import { MAX_PARTICIPANTS_PER_PAGE } from "lib/constants";

const participantHasTracks = (participant: RemoteParticipant) => {
  return (
    participant.videoTracks.size > 0 ||
    participant.audioTracks.size > 0
  );
};

type Props = {
  livekitUrl?: string;
  jwt?: string;
  showNonPublishingParticipants: boolean;
  children: ReactNode;
};

export const RoomProvider: React.FC<Props> = ({
  children,
  showNonPublishingParticipants,
  jwt,
  livekitUrl,
}) => {
  const roomRef = useRef<Room | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [localParticipant, setLocalParticipant] =
    useState<LocalParticipant | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    if (!jwt || !livekitUrl) {
      return;
    }

    let room: Room;
    try {
      room = new Room();
    } catch (e: any) {
      setJoinError(e.message);
      return;
    }

    const handleParticipantJoined = (newParticipant: RemoteParticipant) => {
      setParticipants((oldParticipantArray) => {
        const found = oldParticipantArray.find(
          (p) => p.sid === newParticipant.sid
        );
        if (
          !found &&
          newParticipant.permissions?.canPublish &&
          (participantHasTracks(newParticipant) ||
            showNonPublishingParticipants)
        ) {
          return [...oldParticipantArray, newParticipant];
        }
        return oldParticipantArray;
      });
    };

    const handleParticipantLeft = (participantLeaving: RemoteParticipant) => {
      setParticipants((oldParticipantArray) =>
        oldParticipantArray.filter(
          (p) => p.sid !== participantLeaving.sid
        )
      );
    };

    const handleParticipantTrackPublished = (
      _publication: RemoteTrackPublication,
      participantWhoPublished: RemoteParticipant
    ) => {
      setParticipants((oldParticipantArray) => {
        const found = oldParticipantArray.find(
          (p) => p.sid === participantWhoPublished.sid
        );
        if (!found) {
          return [...oldParticipantArray, participantWhoPublished];
        }
        return oldParticipantArray;
      });
    };

    const handleParticipantTrackUnpublished = (
      _publication: RemoteTrackPublication,
      participantWhoUnpublished: RemoteParticipant
    ) => {
      setParticipants((oldParticipantArray) => {
        if (
          !participantHasTracks(participantWhoUnpublished) &&
          !showNonPublishingParticipants
        ) {
          return oldParticipantArray.filter(
            (p) => p.sid !== participantWhoUnpublished.sid
          );
        }
        return oldParticipantArray;
      });
    };

    const handleActiveSpeakerChanged = (
      activeSpeakerChanges: Participant[]
    ) => {
      setParticipants((oldParticipantArray) => {
        const updatedParticipants = [...oldParticipantArray];

        activeSpeakerChanges.forEach((activeSpeaker: Participant) => {
          if (activeSpeaker instanceof RemoteParticipant) {
            const participantIndex = updatedParticipants.findIndex(
              (p) => p.sid === activeSpeaker.sid
            );

            if (participantIndex >= MAX_PARTICIPANTS_PER_PAGE - 1) {
              updatedParticipants.splice(participantIndex, 1);
              updatedParticipants.unshift(activeSpeaker);
            }
          }
        });
        return updatedParticipants;
      });
    };

    const handleParticipantTrackSubscriptionChange = (
      _track: RemoteTrack,
      _publication: RemoteTrackPublication,
      participantWhoChanged: RemoteParticipant
    ) => {
      setParticipants((oldParticipantArray) => {
        const updatedSubscriptionParticipants = oldParticipantArray.map(
          (oldParticipant) =>
            oldParticipant.sid === participantWhoChanged.sid
              ? participantWhoChanged
              : oldParticipant
        );

        return [ ...updatedSubscriptionParticipants ];
      });
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantJoined);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantLeft);

    room.on(
      RoomEvent.TrackPublished,
      handleParticipantTrackPublished
    );
    room.on(
      RoomEvent.TrackUnpublished,
      handleParticipantTrackUnpublished
    );
    room.on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakerChanged);

    room.on(
      RoomEvent.TrackSubscribed,
      handleParticipantTrackSubscriptionChange
    );
    room.on(
      RoomEvent.TrackUnsubscribed,
      handleParticipantTrackSubscriptionChange
    );

    room
      .connect(livekitUrl, jwt, {})
      .then(() => {
        setLocalParticipant(room.localParticipant);
        room.participants.forEach(handleParticipantJoined);
      })
      .catch((error) => {
        setJoinError(error.message);
      });

    roomRef.current = room;

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantJoined);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantLeft);

      room.off(
        RoomEvent.TrackPublished,
        handleParticipantTrackPublished
      );
      room.off(
        RoomEvent.TrackUnpublished,
        handleParticipantTrackUnpublished
      );
      room.off(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakerChanged);

      room.off(
        RoomEvent.TrackSubscribed,
        handleParticipantTrackSubscriptionChange
      );
      room.off(
        RoomEvent.TrackUnsubscribed,
        handleParticipantTrackSubscriptionChange
      );

      setParticipants([]);
      room.disconnect();
    };
  }, [jwt, setJoinError]);

  return (
    <MuxContext.Provider
      value={{
        room: roomRef.current,
        participants,
        localParticipant,
        joinError,
      }}
    >
      <DisplayMediaProvider>{children}</DisplayMediaProvider>
    </MuxContext.Provider>
  );
};
