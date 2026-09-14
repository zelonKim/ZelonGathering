export interface JoinGatheringInfo {
  id: string;
  title: string;
  gatheringPlace: string;
  category: string;
}

export interface JoinedGatheringItem {
  id: string;
  status: string;
  gathering: JoinGatheringInfo;
}
