import { GatheringDetail, GatheringParticipant } from "./GatheringDetail";

export interface GatheringInfoTabProps {
  gathering: GatheringDetail;
  activeParticipants: GatheringParticipant[];
  cateTheme: { bg: string; text: string; label: string; emoji: string };
  isHost: boolean;
  isKicked: boolean;
  isAlreadyParticipant: boolean;
  isJoinGatheringPending: boolean;
  myId?: string;
  handleJoinPress: () => void;
  handleKickPress: (userId: string, nickname: string) => void;
  DAY_MAPS: Record<string, string>;
  TIME_MAPS: Record<string, string>;
}
