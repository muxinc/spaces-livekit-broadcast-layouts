import { Room } from "livekit-client";
import { useContext } from "react";

import { MuxContext } from "./MuxContext";

/**
 * Returns an instance of space passed to or created by closest <SpaceProvider>.
 */
export const useRoom = (): {
  room: Room | null;
  joinError: string | null;
} => {
  const mux = useContext(MuxContext);

  return { room: mux?.room ?? null, joinError: mux?.joinError ?? null };
};
