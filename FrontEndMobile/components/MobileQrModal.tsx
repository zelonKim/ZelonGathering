import { OS } from "@/types/ConfigOS";
import { MobileQrModalProps } from "@/types/MobileQrModalProps";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MOBILE_OS } from "./mobileOS";

export function MobileQrModal({ isOpen, onClose }: MobileQrModalProps) {
  const [activeTab, setActiveTab] = useState<OS>("android");
  const [qrErrors, setQrErrors] = useState<Record<OS, boolean>>({
    android: false,
    ios: false,
  });

  const currentConfig = MOBILE_OS[activeTab];
  const hasError = qrErrors[activeTab];

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.modalCard}
          onPress={(e) => e.stopPropagation()}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            style={styles.closeButton}
          >
            <Feather name="x" size={18} color="#78716C" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Zelon Gathering 앱 설치</Text>
            <Text style={styles.subtitle}>
              스마트폰 카메라로 QR 코드를 스캔하세요
            </Text>
          </View>

          <View style={styles.tabContainer}>
            {(Object.keys(MOBILE_OS) as OS[]).map((platform) => {
              const isActive = activeTab === platform;
              return (
                <TouchableOpacity
                  key={platform}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab(platform)}
                  style={styles.tabButton}
                >
                  <Text
                    style={[
                      styles.tabText,
                      isActive ? styles.tabTextActive : styles.tabTextInactive,
                    ]}
                  >
                    {MOBILE_OS[platform].label}
                  </Text>
                  {isActive && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.body}>
            <View style={styles.qrContainer}>
              {hasError ? (
                <Text style={styles.errorText}>
                  {currentConfig.label}
                  {"\n"}
                  <Text style={{ color: "#FF7A59" }}>QR 준비 중</Text>
                </Text>
              ) : (
                <Image
                  source={{ uri: currentConfig.qrPath }}
                  style={styles.qrImage}
                  resizeMode="contain"
                  onError={() =>
                    setQrErrors((prev) => ({ ...prev, [activeTab]: true }))
                  }
                />
              )}
            </View>

            <View style={styles.guideBox}>
              <View style={styles.guideHeader}>
                <MaterialCommunityIcons
                  name="qrcode-scan"
                  size={15}
                  color="#FF7A59"
                />
                <Text style={styles.guideTitle}>{currentConfig.title}</Text>
              </View>
              <Text style={styles.guideDescription}>{currentConfig.guide}</Text>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

///////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(41, 37, 36, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 24,
    position: "relative",
    elevation: 10,
    shadowColor: "#FF7A59",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#F5F5F4",
    padding: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  header: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#292524",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#A8A29E",
    marginTop: 6,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F4",
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingBottom: 12,
    alignItems: "center",
    position: "relative",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#FF7A59",
  },
  tabTextInactive: {
    color: "#A8A29E",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: "#FF7A59",
    borderRadius: 2,
  },
  body: {
    alignItems: "center",
  },
  qrContainer: {
    width: 160,
    height: 160,
    backgroundColor: "#FBFBF9",
    borderWidth: 1,
    borderColor: "#F5F5F4",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    marginBottom: 20,
  },
  qrImage: {
    width: "100%",
    height: "100%",
  },
  errorText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A8A29E",
    textAlign: "center",
    lineHeight: 18,
  },
  guideBox: {
    width: "100%",
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 16,
    padding: 16,
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#292524",
  },
  guideDescription: {
    fontSize: 12,
    fontWeight: "500",
    color: "#78716C",
    lineHeight: 18,
  },
});
