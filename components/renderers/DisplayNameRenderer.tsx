import styled from "@emotion/styled";
import { RemoteParticipant } from "@mux/spaces-web";
import useLayout from "hooks/useLayout";
import { useParticipant } from "hooks/useParticipant";
import { useParticipants } from "hooks/useParticipants";
import { useScreenShare } from "hooks/useScreenShare";
import useWindowDimensions from "hooks/useWindowDimensions";
import { Layout } from "lib/types";

interface Props {
  participant: RemoteParticipant;
  isScreenShare?: boolean;
}

const DisplayNameBox = styled.div<{ $large: boolean }>`
  position: absolute;
  padding-left: 5px;
  padding-right: 5px;
  border-radius: 5px;
  background: rgba(50, 50, 50, 0.75);
  bottom: 5px;
  left: 5px;
  max-width: calc(100% - 10px);

  ${({ $large }) =>
    $large &&
    `
      bottom: 10px;
      left: 10px;
      padding-top: 5px;
      padding-bottom: 5px;
      max-width: calc(100% - 20px);  
  `}

  p {
    line-height: 40px;
    font-family: "NotoSans-Bold";
    font-size: ${({ $large }) => ($large ? "28" : "24")}px;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const addPossessive = (name: string) =>
  name.endsWith("s") ? `${name}' Screen` : `${name}'s Screen`;

export default function DisplayNameRenderer({
  participant,
  isScreenShare = false,
}: Props): JSX.Element {
  const { displayName } = useParticipant(participant);
  const layout = useLayout();
  const name = displayName.split("\n")[0];

  const { screenShareTrack } = useScreenShare();
  const participants = useParticipants() ?? [];
  const { width = 0, height = 0 } = useWindowDimensions();

  const numParticipantsShown =
    layout === Layout.ActiveSpeaker ? 1 : participants?.length;

  return name ? (
    <DisplayNameBox
      $large={!screenShareTrack && numParticipantsShown <= 4 && width > height}
    >
      <p>{isScreenShare ? addPossessive(name) : name}</p>
    </DisplayNameBox>
  ) : (
    <></>
  );
}
