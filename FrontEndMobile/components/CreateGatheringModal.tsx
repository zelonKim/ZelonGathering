import { CreateGatheringModalProps } from "@/types/CreateGatheringModalProps";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CategorySelector,
  DaySelector,
  DistrictSelector,
  PlaceSelector,
  TimeSelector,
} from "./CreateGatheringSelector";
import { Modal } from "./Modal";

export function CreateGatheringModal({
  isOpen,
  onClose,
  formProps,
}: CreateGatheringModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="새로운 소모임 만들기 🍑">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContainer}
      >
        <CategorySelector
          selected={formProps.category}
          onSelect={formProps.setCategory}
          categoryColors={formProps.GATHERING_CATEGORY_COLOR}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>모임 제목</Text>
          <TextInput
            placeholder="예) 한강 러닝 모임"
            placeholderTextColor="#A8A29E"
            value={formProps.title}
            onChangeText={formProps.setTitle}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>모임 설명</Text>
          <TextInput
            placeholder="모임의 상세 소개글을 작성해 주세요."
            placeholderTextColor="#A8A29E"
            value={formProps.description}
            onChangeText={formProps.setDescription}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea]}
          />
        </View>

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

        <View style={[styles.inputGroup, { marginTop: 8 }]}>
          <Text style={styles.label}>모임 정원 (명)</Text>
          <TextInput
            placeholder="최소 2명 ~ 최대 12명"
            placeholderTextColor="#A8A29E"
            keyboardType="numeric"
            value={formProps.maxParticipants}
            onChangeText={formProps.setMaxParticipants}
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={formProps.handleCreateSubmit}
          disabled={formProps.isPending}
          style={[
            styles.submitButton,
            formProps.isPending && styles.submitButtonDisabled,
          ]}
        >
          {formProps.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>소모임방 개설하기 🚀</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

///////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  formContainer: {
    paddingVertical: 8,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#292524",
  },
  input: {
    backgroundColor: "#F5F5F4",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#292524",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#FF7A59",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: "#FF7A59A0",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
