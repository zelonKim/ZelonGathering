import { useOpenPrivateChatRoom } from "@/hooks/useOpenPrivateChatRoom";
import { Day } from "@/types/Day";
import { GatheringParticipant } from "@/types/GatheringDetail";
import { GatheringInfoTabProps } from "@/types/GatheringInfoTabProps";
import { Time } from "@/types/Time";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router"
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export function GatheringInfoTab({
  gathering,
  activeParticipants,
  cateTheme,
  isHost,
  isKicked,
  isAlreadyParticipant,
  isJoinGatheringPending,
  myId,
  handleJoinPress,
  handleKickPress,
  DAY_MAPS,
  TIME_MAPS,
}: GatheringInfoTabProps) {

  const [selectedParticipant, setSelectedParticipant] =
    useState<GatheringParticipant | null>(null);

  const { mutate: openDmMutation, isPending: isOpenDmPending } =
    useOpenPrivateChatRoom();

  const handleMemberPress = (p: GatheringParticipant) => {
    const participantUserId = p.user?.id || p.userId;
    if (participantUserId !== myId) {
      setSelectedParticipant(p);
    }
  };

  const closeModal = () => setSelectedParticipant(null);

  const selectedUserId =
    selectedParticipant?.user?.id || selectedParticipant?.userId;

    ///////////////////////////////////////////////////////////////////////////////////

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View
            style={[styles.categoryBadge, { backgroundColor: cateTheme.bg }]}
          >
            <Text style={[styles.categoryText, { color: cateTheme.text }]}>
              {cateTheme.label} {cateTheme.emoji}
            </Text>
          </View>

          {isHost ? (
            <View style={styles.badgeHost}>
              <Text style={styles.badgeHostText}>내가 만든 모임</Text>
            </View>
          ) : isKicked ? (
            <View style={styles.badgeKicked}>
              <Feather name="slash" size={12} color="#EF4444" />
              <Text style={styles.badgeKickedText}>참여 불가</Text>
            </View>
          ) : isAlreadyParticipant ? (
            <View style={styles.badgeJoined}>
              <Feather name="check-circle" size={12} color="#FF7A59" />
              <Text style={styles.badgeJoinedText}>참여 완료</Text>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleJoinPress}
              disabled={isJoinGatheringPending}
              style={styles.joinButton}
            >
              {isJoinGatheringPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.joinButtonText}>참여하기 🚀</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.title}>{gathering.title}</Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>
            모집 현황: {activeParticipants.length} /{" "}
            {gathering.maxParticipants ?? 4}명
          </Text>
        </View>

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={14} color="#FF7A59" />
            <Text style={styles.infoText}>{gathering.gatheringPlace}</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="calendar" size={14} color="#FF7A59" />
            <Text style={styles.infoText}>
              {DAY_MAPS[gathering.gatheringDay as Day] ||
                gathering.gatheringDay}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="clock" size={14} color="#FF7A59" />
            <Text style={styles.infoText}>
              {TIME_MAPS[gathering.gatheringTime as Time] ||
                gathering.gatheringTime}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>모임 소개</Text>
        <Text style={styles.description}>
          {gathering.description || "등록된 소개글이 없습니다."}
        </Text>
      </View>


      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>
          참여 중인 멤버 ({activeParticipants.length}명)
        </Text>

        <View style={styles.memberList}>
          {activeParticipants.map((p: GatheringParticipant, idx: number) => {
            const participantUserId = p.user?.id || p.userId;
            const isMe = participantUserId === myId;
            const isParticipantHost = participantUserId === gathering.host.id;
            return (
              <View
                key={participantUserId || String(idx)}
                style={styles.memberCard}
              >
                <TouchableOpacity
                  activeOpacity={isMe ? 1 : 0.7}
                  onPress={() => handleMemberPress(p)}
                  style={styles.memberMainInfo}
                >
                  <View style={styles.avatar}>
                    {p.user?.profileImg ? (
                      <Image
                        source={{ uri: p.user.profileImg }}
                        style={styles.avatarImg}
                      />
                    ) : (
                      <Text style={{ fontSize: 18 }}>🍑</Text>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>
                        {p.user?.nickname || "참여자"}
                      </Text>
                      {isParticipantHost && (
                        <View style={styles.hostBadge}>
                          <Text style={styles.hostBadgeText}>👑 방장</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.mannerRow}>
                      <FontAwesome5
                        name="thermometer-half"
                        size={12}
                        color="#FF7A59"
                      />
                      <Text style={styles.mannerText}>
                        매너 온도 {p.user?.mannerTemperature ?? 36.5}°C
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>


                {isHost && participantUserId !== myId && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      handleKickPress(
                        participantUserId,
                        p.user?.nickname || "참여자",
                      )
                    }
                    style={styles.kickButton}
                  >
                    <Feather name="user-x" size={14} color="#E11D48" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </View>


      <Modal
        visible={!!selectedParticipant}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedParticipant?.user?.nickname || "참여자"}
            </Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                closeModal();
                if (selectedUserId) {
                  router.push(`/profileInfo/${selectedUserId}`);
                }
              }}
            >
              <Feather name="user" size={16} color="#44403C" />
              <Text style={styles.modalOptionText}>프로필 보기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                closeModal();
                if (selectedUserId) {
                  openDmMutation(selectedUserId);
                }
              }}
            >
              <Ionicons name="chatbubble-outline" size={16} color="#FF7A59" />
              <Text style={[styles.modalOptionText, { color: "#FF7A59" }]}>
                DM 보내기
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

///////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "700",
  },
  badgeHost: {
    backgroundColor: "#F5F5F4",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeHostText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#78716C",
  },
  badgeKicked: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeKickedText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#EF4444",
  },
  badgeJoined: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFEBE5",
    borderWidth: 1,
    borderColor: "rgba(255, 122, 89, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeJoinedText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FF7A59",
  },
  joinButton: {
    backgroundColor: "#FF7A59",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#292524",
    lineHeight: 28,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F5F5F4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#78716C",
  },
  infoList: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#FAFAFA",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#78716C",
  },
  divider: {
    height: 1,
    backgroundColor: "#F5F5F4",
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#292524",
  },
  description: {
    fontSize: 14,
    fontWeight: "500",
    color: "#57534E",
    lineHeight: 20,
  },
  membersSection: {
    gap: 12,
  },
  memberList: {
    gap: 12,
  },
  memberCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memberMainInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    backgroundColor: "#F5F5F4",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#292524",
  },
  hostBadge: {
    backgroundColor: "rgba(255, 122, 89, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 122, 89, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  hostBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FF7A59",
  },
  mannerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  mannerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF7A59",
  },
  kickButton: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 8,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#292524",
    marginBottom: 4,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#F5F5F4",
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#44403C",
  },
});
