import { useContext } from "react";
import { RemoteParticipant } from "livekit-client";

import { MuxContext } from "./MuxContext";
import { MAX_PARTICIPANTS_PER_PAGE } from "lib/constants";

/**
 * Returns an array of participants passed to or created by closest <SpaceProvider>.
 */
export const useParticipants = (): RemoteParticipant[] | undefined => {
  const mux = useContext(MuxContext);

  return mux?.participants.slice(0, MAX_PARTICIPANTS_PER_PAGE);
};
