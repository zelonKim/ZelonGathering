import { Coords } from "./Coords";

export interface MapSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Coords;
  selectedPlaceCoords: Coords | null;
  setSelectedPlaceCoords: (coords: Coords) => void;
  gatheringAddress: string;
  setGatheringAddress: (address: string) => void;
  setGatheringPlace: (place: string) => void;
}
