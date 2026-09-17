import { MapSelectionModalProps } from "@/types/MapSelectionModalProps";
import { getKakaoAddress } from "@/utils/getKakaoAddress";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  MapPressEvent,
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const handleMapClick = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedPlaceCoords({ latitude, longitude });

    try {
      const res = await getKakaoAddress(latitude, longitude);

      if (res && res.address) {
        setGatheringAddress(res.address);
      } else {
        setGatheringAddress(
          `선택된 위치: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
        );
      }
    } catch (error) {
      console.error("카카오 주소 변환 실패:", error);
      setGatheringAddress(
        `선택된 위치: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      );
    }
  };

  ///////////////////////////////////////////////////////////////////////////////////

  const handleConfirm = () => {
    if (!selectedPlaceCoords) {
      Alert.alert("알림", "지도에서 모임 장소를 먼저 터치해 주세요! 📍");
      return;
    }
    setGatheringPlace(gatheringAddress);
    onClose();
  };

  ///////////////////////////////////////////////////////////////////////////////////

  const initialRegion = {
    latitude: Number(
      selectedPlaceCoords?.latitude || location?.latitude || 37.5665,
    ),
    longitude: Number(
      selectedPlaceCoords?.longitude || location?.longitude || 126.978,
    ),
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  ///////////////////////////////////////////////////////////////////////////////////

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.mapWrapper}>
          <View style={styles.instructionBadge}>
            <Feather name="map-pin" size={14} color="#FF7A59" />
            <Text style={styles.instructionText}>
              원하는 모임 장소를 지도에서 터치해 주세요 📍
            </Text>
          </View>

          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={initialRegion}
            onPress={handleMapClick}
          >
            {selectedPlaceCoords && (
              <Marker
                coordinate={{
                  latitude: Number(selectedPlaceCoords.latitude),
                  longitude: Number(selectedPlaceCoords.longitude),
                }}
                pinColor="#FF7A59"
              />
            )}
          </MapView>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={styles.closeButton}
          >
            <Feather name="x" size={18} color="#44403C" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomCard}>
          <View style={styles.addressBox}>
            {gatheringAddress ? (
              <View style={styles.addressRow}>
                <Feather
                  name="map-pin"
                  size={20}
                  color="#FF7A59"
                  style={styles.addressIcon}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.addressLabel}>선택된 모임 장소</Text>
                  <Text style={styles.addressText}>{gatheringAddress}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyAddressBox}>
                <Feather name="map-pin" size={24} color="#FF7A59" />
                <Text style={styles.emptyAddressText}>
                  지도를 터치하여 모임 장소에 핀을 꽂아주세요!
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleConfirm}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmButtonText}>이 장소로 지정하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

///////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0C0A09",
  },
  mapWrapper: {
    flex: 1,
    backgroundColor: "#1C1917",
    borderRadius: 16,
    margin: 12,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  instructionBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 10,
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 8,
    borderRadius: 12,
    zIndex: 10,
  },
  bottomCard: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 12,
  },
  addressBox: {
    padding: 12,
    backgroundColor: "#F5F5F4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E7E5E4",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  addressIcon: {
    marginTop: 2,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF7A59",
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    color: "#292524",
    fontWeight: "600",
  },
  emptyAddressBox: {
    alignItems: "center",
    paddingVertical: 8,
    gap: 6,
  },
  emptyAddressText: {
    fontSize: 13,
    color: "#78716C",
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: "#FF7A59",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
