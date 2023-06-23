import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  ActiveSpeaker,
  LocalParticipant,
  ParticipantRole,
  RemoteParticipant,
  Space,
  SpaceEvent,
} from "@mux/spaces-web";

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
  jwt?: string;
  showNonPublishingParticipants: boolean;
  children: ReactNode;
};

export const SpaceProvider: React.FC<Props> = ({
  children,
  showNonPublishingParticipants,
  jwt,
}) => {
  const spaceRef = useRef<Space | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [localParticipant, setLocalParticipant] =
    useState<LocalParticipant | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    if (!jwt) {
      return;
    }

    let space: Space;
    try {
      space = new Space(jwt, {
        automaticParticipantLimit: MAX_PARTICIPANTS_PER_PAGE,
      });
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

    space.on(SpaceEvent.ParticipantJoined, handleParticipantJoined);
    space.on(SpaceEvent.ParticipantLeft, handleParticipantLeft);

    space.on(
      SpaceEvent.ParticipantTrackPublished,
      handleParticipantTrackPublished
    );
    space.on(
      SpaceEvent.ParticipantTrackUnpublished,
      handleParticipantTrackUnpublished
    );
    space.on(SpaceEvent.ActiveSpeakersChanged, handleActiveSpeakerChanged);

    space.on(
      SpaceEvent.ParticipantTrackSubscribed,
      handleParticipantTrackSubscriptionChange
    );
    space.on(
      SpaceEvent.ParticipantTrackUnsubscribed,
      handleParticipantTrackSubscriptionChange
    );

    space
      .join()
      .then((_localParticipant: LocalParticipant) => {
        setLocalParticipant(_localParticipant);
      })
      .catch((error) => {
        setJoinError(error.message);
      });

    spaceRef.current = space;

    return () => {
      space.off(SpaceEvent.ParticipantJoined, handleParticipantJoined);
      space.off(SpaceEvent.ParticipantLeft, handleParticipantLeft);

      space.off(
        SpaceEvent.ParticipantTrackPublished,
        handleParticipantTrackPublished
      );
      space.off(
        SpaceEvent.ParticipantTrackUnpublished,
        handleParticipantTrackUnpublished
      );
      space.off(SpaceEvent.ActiveSpeakersChanged, handleActiveSpeakerChanged);

      space.off(
        SpaceEvent.ParticipantTrackSubscribed,
        handleParticipantTrackSubscriptionChange
      );
      space.off(
        SpaceEvent.ParticipantTrackUnsubscribed,
        handleParticipantTrackSubscriptionChange
      );

      setParticipants([]);
      space.leave();
    };
  }, [jwt, setJoinError]);

  return (
    <MuxContext.Provider
      value={{
        space: spaceRef.current,
        participants,
        localParticipant,
        joinError,
      }}
    >
      <DisplayMediaProvider>{children}</DisplayMediaProvider>
    </MuxContext.Provider>
  );
};
