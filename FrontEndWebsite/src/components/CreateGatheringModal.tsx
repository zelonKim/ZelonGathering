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
import { useCreateGatheringModalLanguage } from "@/hooks/languages/useCreateGatheringModalLanguage"; // 👈 전용 훅 임포트

export function CreateGatheringModal({
  isOpen,
  onClose,
  formProps,
}: CreateGatheringModalProps) {
  const { t } = useCreateGatheringModalLanguage();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.modalTitle}>
      <form onSubmit={formProps.handleCreateSubmit} className="space-y-5">
        <CategorySelector
          selected={formProps.category}
          onSelect={formProps.setCategory}
          categoryColors={formProps.GATHERING_CATEGORY_COLOR}
        />

        <div>
          <label className="text-sm font-bold text-[#292524] block mb-3 mt-6">
            {t.titleLabel}
          </label>
          <input
            type="text"
            placeholder={t.titlePlaceholder}
            value={formProps.title}
            onChange={(e) => formProps.setTitle(e.target.value)}
            className="w-full bg-[#F5F5F4] p-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF7A59]/95"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-[#292524] block mb-1">
            {t.descriptionLabel}
          </label>
          <textarea
            placeholder={t.descriptionPlaceholder}
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
            {t.maxParticipantsLabel}
          </label>
          <input
            type="number"
            placeholder={t.maxParticipantsPlaceholder}
            value={formProps.maxParticipants}
            onChange={(e) => formProps.setMaxParticipants(e.target.value)}
            className="w-full bg-[#F5F5F4] p-3 rounded-xl text-sm font-semibold outline-none focus:ring-1 focus:ring-[#FF7A59]/95"
          />
        </div>

        <button
          type="submit"
          disabled={formProps.isPending}
          className="w-full bg-[#FF7A59] hover:bg-[#e06848] text-white py-4 rounded-xl text-[15px] font-extrabold transition shadow-md flex justify-center items-center mt-9 cursor-pointer"
        >
          {formProps.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            t.submitButton
          )}
        </button>
      </form>
    </Modal>
  );
}
