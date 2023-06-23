import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  ActiveSpeaker,
  LocalParticipant,
  ParticipantRole,
  RemoteParticipant,
  Room,
  RoomEvent,
} from "livekit-client";

import { MuxContext } from "./MuxContext";
import { DisplayMediaProvider } from "./DisplayMediaProvider";
import { MAX_PARTICIPANTS_PER_PAGE } from "lib/constants";

const participantHasTracks = (participant: RemoteParticipant) => {
  return (
    participant.getVideoTracks().length > 0 ||
    participant.getAudioTracks().length > 0
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
          (p) => p.connectionId === newParticipant.connectionId
        );
        if (
          !found &&
          newParticipant.role !== ParticipantRole.Subscriber &&
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
          (p) => p.connectionId !== participantLeaving.connectionId
        )
      );
    };

    const handleParticipantTrackPublished = (
      participantWhoPublished: RemoteParticipant
    ) => {
      setParticipants((oldParticipantArray) => {
        const found = oldParticipantArray.find(
          (p) => p.connectionId === participantWhoPublished.connectionId
        );
        if (!found) {
          return [...oldParticipantArray, participantWhoPublished];
        }
        return oldParticipantArray;
      });
    };

    const handleParticipantTrackUnpublished = (
      participantWhoUnpublished: RemoteParticipant
    ) => {
      setParticipants((oldParticipantArray) => {
        if (
          !participantHasTracks(participantWhoUnpublished) &&
          !showNonPublishingParticipants
        ) {
          return oldParticipantArray.filter(
            (p) => p.connectionId !== participantWhoUnpublished.connectionId
          );
        }
        return oldParticipantArray;
      });
    };

    const handleActiveSpeakerChanged = (
      activeSpeakerChanges: ActiveSpeaker[]
    ) => {
      setParticipants((oldParticipantArray) => {
        const updatedParticipants = [...oldParticipantArray];

        activeSpeakerChanges.forEach((activeSpeaker: ActiveSpeaker) => {
          if (activeSpeaker.participant instanceof RemoteParticipant) {
            const participantIndex = updatedParticipants.findIndex(
              (p) => p.connectionId === activeSpeaker.participant.connectionId
            );

            if (participantIndex >= MAX_PARTICIPANTS_PER_PAGE - 1) {
              updatedParticipants.splice(participantIndex, 1);
              updatedParticipants.unshift(activeSpeaker.participant);
            }
          }
        });
        return updatedParticipants;
      });
    };

    const handleParticipantTrackSubscriptionChange = (
      participantWhoChanged: RemoteParticipant
    ) => {
      setParticipants((oldParticipantArray) => {
        const updatedSubscriptionParticipants = oldParticipantArray.map(
          (oldParticipant) =>
            oldParticipant.connectionId === participantWhoChanged.connectionId
              ? participantWhoChanged
              : oldParticipant
        );

        return [
          ...updatedSubscriptionParticipants.filter((p) => p.isSubscribed()),
          ...updatedSubscriptionParticipants.filter((p) => !p.isSubscribed()),
        ];
      });
    };

    room.on(SpaceEvent.ParticipantJoined, handleParticipantJoined);
    room.on(SpaceEvent.ParticipantLeft, handleParticipantLeft);

    room.on(
      SpaceEvent.ParticipantTrackPublished,
      handleParticipantTrackPublished
    );
    room.on(
      SpaceEvent.ParticipantTrackUnpublished,
      handleParticipantTrackUnpublished
    );
    room.on(SpaceEvent.ActiveSpeakersChanged, handleActiveSpeakerChanged);

    room.on(
      SpaceEvent.ParticipantTrackSubscribed,
      handleParticipantTrackSubscriptionChange
    );
    room.on(
      SpaceEvent.ParticipantTrackUnsubscribed,
      handleParticipantTrackSubscriptionChange
    );

    room
      .connect(livekitUrl, jwt, {})
      .then((_localParticipant: LocalParticipant) => {
        setLocalParticipant(_localParticipant);
      })
      .catch((error) => {
        setJoinError(error.message);
      });

    roomRef.current = room;

    return () => {
      room.off(SpaceEvent.ParticipantJoined, handleParticipantJoined);
      room.off(SpaceEvent.ParticipantLeft, handleParticipantLeft);

      room.off(
        SpaceEvent.ParticipantTrackPublished,
        handleParticipantTrackPublished
      );
      room.off(
        SpaceEvent.ParticipantTrackUnpublished,
        handleParticipantTrackUnpublished
      );
      room.off(SpaceEvent.ActiveSpeakersChanged, handleActiveSpeakerChanged);

      room.off(
        SpaceEvent.ParticipantTrackSubscribed,
        handleParticipantTrackSubscriptionChange
      );
      room.off(
        SpaceEvent.ParticipantTrackUnsubscribed,
        handleParticipantTrackSubscriptionChange
      );

      setParticipants([]);
      room.leave();
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
