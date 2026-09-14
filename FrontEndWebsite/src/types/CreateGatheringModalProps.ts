import { Category } from "./Category";
import { Coords } from "./Coords";
import { Day } from "./Day";
import { District } from "./District";
import { Time } from "./Time";

export interface CreateGatheringModalProps {
  isOpen: boolean;
  onClose: () => void;
  formProps: {
    category: string;
    setCategory: (val: Category) => void;
    title: string;
    setTitle: (val: string) => void;
    description: string;
    setDescription: (val: string) => void;
    activeDistrictTab: "SEOUL" | "GYEONGGI" | "OTHER";
    setActiveDistrictTab: (tab: "SEOUL" | "GYEONGGI" | "OTHER") => void;
    district: string;
    setDistrict: (val: District) => void;
    filteredDistricts: { key: string; label: string }[];
    selectedPlaceCoords: Coords;
    setIsMapModalOpen: (open: boolean) => void;
    gatheringPlace: string;
    setGatheringPlace: (val: string) => void;
    gatheringDay: Day[];
    setGatheringDay: React.Dispatch<React.SetStateAction<Day[]>>;
    activeTimeTab: "AM" | "PM";
    setActiveTimeTab: (tab: "AM" | "PM") => void;
    gatheringTime: Time[];
    setGatheringTime: React.Dispatch<React.SetStateAction<Time[]>>;
    filteredTimes: { key: string; label: string }[];
    maxParticipants: string;
    setMaxParticipants: (val: string) => void;
    handleCreateSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
    isPending: boolean;
    toggleArrayItem: (
      list: string[],
      setList: React.Dispatch<React.SetStateAction<string[]>>,
      item: string,
    ) => void;
    GATHERING_CATEGORY_COLOR: Record<
      string,
      {
        bg: string;
        text: string;
        emoji: string;
        label: string;
      }
    >;
    DAY_ITEMS: { key: string; label: string }[];
  };
}
