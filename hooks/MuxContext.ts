import { createContext } from "react";
import { LocalParticipant, RemoteParticipant, Room } from "livekit-client";

interface Mux {
  room: Room | null;
  localParticipant: LocalParticipant | null;
  participants: RemoteParticipant[];
  joinError: string | null;
}

export const MuxContext = createContext<Mux | null>(null);
