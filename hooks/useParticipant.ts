import { useCallback, useEffect, useState } from "react";
import {
  LocalParticipant,
  ParticipantEvent,
  RemoteParticipant,
  RemoteTrackPublication,
  Track,
  TrackPublication,
} from "livekit-client";

export interface ParticipantState {
  isMuted: boolean;
  isSpeaking: boolean;
  isCameraOff: boolean;
  subscribedTracks: RemoteTrackPublication[];
  displayName: string;
}

export function useParticipant(
  participant: LocalParticipant | RemoteParticipant
): ParticipantState {
  const [isMuted, setMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [subscribedTracks, setSubscribedTracks] = useState<RemoteTrackPublication[]>([]);
  const [displayName, setDisplayName] = useState(participant.name ?? '');

  const onPublicationsChanged = useCallback(() => {
    const tracks: RemoteTrackPublication[] = [];
    participant.audioTracks.forEach((track) => {
      if (track instanceof RemoteTrackPublication) tracks.push(track);
    });
    participant.videoTracks.forEach((track) => {
      if (track instanceof RemoteTrackPublication) tracks.push(track);
    });
    setSubscribedTracks(tracks);
  }, [participant]);

  useEffect(() => {
    const onMuted = (track: TrackPublication) => {
      if (track.source == Track.Source.Microphone) {
        setMuted(true);
      } else if (track.source === Track.Source.Camera) {
        setIsCameraOff(true);
      }
    };
    const onUnmuted = (track: TrackPublication) => {
      if (track.source == Track.Source.Microphone) {
        setMuted(false);
      } else if (track.source === Track.Source.Camera) {
        setIsCameraOff(false);
      }
    };
    const onDisplayNameChanged = () => {
      setDisplayName(participant.name ?? '');
    };

    participant.on(ParticipantEvent.TrackMuted, onMuted);
    participant.on(ParticipantEvent.TrackUnmuted, onUnmuted);
    participant.on(ParticipantEvent.IsSpeakingChanged, setIsSpeaking);
    participant.on(ParticipantEvent.TrackPublished, onPublicationsChanged);
    participant.on(ParticipantEvent.TrackUnpublished, onPublicationsChanged);
    participant.on(ParticipantEvent.TrackSubscribed, onPublicationsChanged);
    participant.on(ParticipantEvent.TrackUnsubscribed, onPublicationsChanged);
    participant.on(ParticipantEvent.ParticipantNameChanged, onDisplayNameChanged);

    onPublicationsChanged();
    participant.audioTracks.forEach((track) => {
      if (track.source === Track.Source.Microphone) {
        setMuted(track.isMuted);
      }
    });
    participant.videoTracks.forEach((track) => {
      if (track.source === Track.Source.Camera) {
        setIsCameraOff(track.isMuted);
      }
    });

    return () => {
      participant.off(ParticipantEvent.TrackMuted, onMuted);
      participant.off(ParticipantEvent.TrackUnmuted, onUnmuted);
      participant.off(ParticipantEvent.IsSpeakingChanged, setIsSpeaking);
      participant.off(ParticipantEvent.TrackPublished, onPublicationsChanged);
      participant.off(ParticipantEvent.TrackUnpublished, onPublicationsChanged);
      participant.off(ParticipantEvent.TrackSubscribed, onPublicationsChanged);
      participant.off(
        ParticipantEvent.TrackUnsubscribed,
        onPublicationsChanged
      );
      participant.off(
        ParticipantEvent.ParticipantNameChanged,
        onDisplayNameChanged
      );
    };
  }, [participant, onPublicationsChanged]);

  return {
    isMuted,
    isSpeaking,
    isCameraOff,
    subscribedTracks,
    displayName,
  };
}
