import React from "react";
import { MapPin, X } from "lucide-react";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { MapSelectionModalProps } from "@/types/MapSelectionModalProps";

export function MapSelectionModal({
  isOpen,
  onClose,
  location,
  selectedPlaceCoords,
  setSelectedPlaceCoords,
  gatheringAddress,
  setGatheringAddress,
  setGatheringPlace,
}: MapSelectionModalProps) {
  if (!isOpen) return null;

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();
    if (lat === undefined || lng === undefined) return;

    setSelectedPlaceCoords({ latitude: lat, longitude: lng });

    try {
      const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
      const json = await res.json();

      if (json.address) {
        setGatheringAddress(json.address);
      } else {
        setGatheringAddress(
          `선택된 위치: (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        );
      }
    } catch (error) {
      console.error("주소 변환 실패:", error);
      setGatheringAddress(
        `선택된 위치: (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      );
    }
  };

  ///////////////////////////////////////////////////////////////

  const handleConfirm = () => {
    if (!selectedPlaceCoords) {
      alert("지도에서 모임 장소를 먼저 터치해 주세요! 📍");
      return;
    }
    setGatheringPlace(gatheringAddress);
    onClose();
  };

  const centerLat = Number(
    selectedPlaceCoords?.latitude || location.latitude || 37.5665,
  );
  const centerLng = Number(
    selectedPlaceCoords?.longitude || location.longitude || 126.978,
  );

  ///////////////////////////////////////////////////////////////

  return (
    <div className="fixed inset-0 bg-stone-950 z-100 flex flex-col justify-between p-4 md:p-6 animate-in fade-in duration-200">
      <div className="flex-1 bg-stone-900 rounded-2xl relative overflow-hidden border border-stone-800 flex flex-col shadow-inner">
        <div className="absolute top-4 left-4 bg-black/75 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 z-10 shadow-md backdrop-blur-sm">
          <MapPin className="w-3.5 h-3.5 text-[#FF7A59]" />
          <span>원하는 모임 장소를 지도에서 터치해 주세요 📍</span>
        </div>

        <div className="w-full h-full">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={{ lat: centerLat, lng: centerLng }}
            zoom={16}
            onClick={handleMapClick}
          >
            {selectedPlaceCoords && (
              <MarkerF
                position={{
                  lat: Number(selectedPlaceCoords.latitude),
                  lng: Number(selectedPlaceCoords.longitude),
                }}
              />
            )}
          </GoogleMap>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-stone-700 p-2 rounded-xl shadow-md z-10 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white w-full max-w-md mx-auto mt-4 p-3 pb-4 rounded-2xl border border-stone-200 shadow-2xl space-y-3 shrink-0">
        <div className="py-3 px-4 bg-stone-50 rounded-xl border border-stone-200 mt-3">
          {gatheringAddress ? (
            <div className="flex items-start gap-2.5 text-left">
              <MapPin className="w-5 h-5 text-[#FF7A59] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-[#FF7A59] block mb-0.5">
                  선택된 모임 장소
                </span>
                <p className="text-sm text-stone-800 font-medium break-keep">
                  {gatheringAddress}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <MapPin className="w-6 h-6 mx-auto text-[#FF7A59] animate-bounce" />
              <p className="flex flex-col items-center text-sm text-center text-stone-500 font-medium mt-1">
                지도를 클릭하여 모임 장소에 핀을 꽂아주세요!
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className="w-full bg-[#FF7A59] hover:bg-[#e06848] active:scale-[0.99] text-white text-[15px] font-extrabold py-3.5 rounded-xl transition shadow-md block text-center"
        >
          이 장소로 지정하기
        </button>
      </div>
    </div>
  );
}
