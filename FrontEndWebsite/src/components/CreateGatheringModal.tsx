import React from "react";
import { Loader2 } from "lucide-react";
import { CreateGatheringModalProps } from "@/types/CreateGatheringModalProps";
import { Modal } from "./Modal";
import {
  CategorySelector,
  DaySelector,
  DistrictSelector,
  PlaceSelector,
  TimeSelector,
} from "./CreateGatheringSelector";

export function CreateGatheringModal({
  isOpen,
  onClose,
  formProps,
}: CreateGatheringModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="새로운 소모임 만들기 🍑">
      <form onSubmit={formProps.handleCreateSubmit} className="space-y-5">
        <CategorySelector
          selected={formProps.category}
          onSelect={formProps.setCategory}
          categoryColors={formProps.GATHERING_CATEGORY_COLOR}
        />

        <div>
          <label className="text-sm font-bold text-[#292524] block mb-1">
            모임 제목
          </label>
          <input
            type="text"
            placeholder="예) 한강 러닝 모임"
            value={formProps.title}
            onChange={(e) => formProps.setTitle(e.target.value)}
            className="w-full bg-[#F5F5F4] p-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF7A59]/95"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-[#292524] block mb-1">
            모임 설명
          </label>
          <textarea
            placeholder="모임의 상세 소개글을 작성해 주세요."
            value={formProps.description}
            onChange={(e) => formProps.setDescription(e.target.value)}
            rows={3}
            className="w-full bg-[#F5F5F4] p-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF7A59]/95 resize-none"
          />
        </div>

        <DistrictSelector
          activeTab={formProps.activeDistrictTab}
          setActiveTab={formProps.setActiveDistrictTab}
          selectedDistrict={formProps.district}
          onSelectDistrict={formProps.setDistrict}
          filteredDistricts={formProps.filteredDistricts}
        />

        <PlaceSelector
          hasSelectedCoords={!!formProps.selectedPlaceCoords}
          onOpenMap={() => formProps.setIsMapModalOpen(true)}
          gatheringPlace={formProps.gatheringPlace}
          setGatheringPlace={formProps.setGatheringPlace}
        />

        <DaySelector
          selectedDays={formProps.gatheringDay}
          onToggleDay={(day) =>
            formProps.toggleArrayItem(
              formProps.gatheringDay,
              formProps.setGatheringDay,
              day,
            )
          }
          dayItems={formProps.DAY_ITEMS}
        />

        <TimeSelector
          activeTab={formProps.activeTimeTab}
          setActiveTab={formProps.setActiveTimeTab}
          selectedTimes={formProps.gatheringTime}
          onToggleTime={(time) =>
            formProps.toggleArrayItem(
              formProps.gatheringTime,
              formProps.setGatheringTime,
              time,
            )
          }
          filteredTimes={formProps.filteredTimes}
        />

        <div>
          <label className="text-sm font-bold text-[#292524] block mb-1 mt-6">
            모임 정원 (명)
          </label>
          <input
            type="number"
            placeholder="최소 2명 ~ 최대 12명"
            value={formProps.maxParticipants}
            onChange={(e) => formProps.setMaxParticipants(e.target.value)}
            className="w-full bg-[#F5F5F4] p-3 rounded-xl text-sm font-semibold outline-none focus:ring-1 focus:ring-[#FF7A59]/95"
          />
        </div>

        <button
          type="submit"
          disabled={formProps.isPending}
          className="w-full bg-[#FF7A59] hover:bg-[#e06848] text-white py-4 rounded-xl text-[15px] font-extrabold transition shadow-md flex justify-center items-center mt-9"
        >
          {formProps.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "소모임방 개설하기 🚀"
          )}
        </button>
      </form>
    </Modal>
  );
}
