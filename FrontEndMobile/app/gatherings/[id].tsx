import { client } from "@/api/client";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const COLORS = {
  primary: "#FF7A59",
  primaryLight: "#FFEBE5",
  background: "#FBFBF9",
  surface: "#FFFFFF",
  textMain: "#292524",
  textSub: "#78716C",
  border: "#E7E5E4",
};

const CATEGORY_MAP: Record<
  string,
  { label: string; emoji: string; bg: string; text: string }
> = {
  STUDY: { label: "스터디", emoji: "📖", bg: "#E0F2FE", text: "#0369A1" },
  SPORTS: { label: "스포츠", emoji: "⚽️", bg: "#E6F4EA", text: "#137333" },
  ART: { label: "아트", emoji: "🎨", bg: "#FAE7F3", text: "#B80066" },
  FOOD: { label: "푸드", emoji: "🍔", bg: "#FEF0E6", text: "#D94E2B" },
  BOOK: { label: "독서", emoji: "📚", bg: "#F1ECE4", text: "#614E3D" },
  GAME: { label: "게임", emoji: "🎯", bg: "#EDE9FE", text: "#5B21B6" },
  TALK: { label: "토크", emoji: "🎙️", bg: "#F4F4F5", text: "#3F3F46" },
  TOUR: { label: "투어", emoji: "🚠", bg: "#E0F7FA", text: "#006064" },
};

const DAY_MAP: Record<string, string> = {
  MON: "월요일",
  TUE: "화요일",
  WED: "수요일",
  THU: "목요일",
  FRI: "금요일",
  SAT: "토요일",
  SUN: "일요일",
};

const TIME_MAP: Record<string, string> = {
  AM_06: "오전 6시",
  AM_07: "오전 7시",
  AM_08: "오전 8시",
  AM_09: "오전 9시",
  AM_10: "오전 10시",
  AM_11: "오전 11시",
  PM_12: "정오 12시",
  PM_01: "오후 1시",
  PM_02: "오후 2시",
  PM_03: "오후 3시",
  PM_04: "오후 6시",
  PM_05: "오후 5시",
  PM_06: "오후 6시",
  PM_07: "오후 7시",
  PM_08: "오후 8시",
  PM_09: "오후 9시",
  PM_10: "오후 10시",
};

export default function GatheringDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { id, tab } = useLocalSearchParams<{
    id: string;
    tab?: "INFO" | "CHAT";
  }>();

  // 잔상 방지용 캐시 클리어 슛
  useEffect(() => {
    return () => {
      queryClient.resetQueries({ queryKey: ["gatheringDetail", id] });
      queryClient.resetQueries({ queryKey: ["gatheringChats", id] });
    };
  }, [id]);

  const [activeTab, setActiveTab] = useState<"INFO" | "CHAT">(
    tab === "CHAT" ? "CHAT" : "INFO",
  );

  const [chatInput, setChatInput] = useState("");
  const chatScrollViewRef = useRef<ScrollView>(null);

  // 🔄 1. 백엔드 상세 조회 엔드포인트 연동
  const {
    data: gathering,
    isLoading: isGatheringLoading,
    isError: isGatheringError,
  } = useQuery({
    queryKey: ["gatheringDetail", id],
    queryFn: async () => {
      const { data } = await client.get(`/gatherings/${id}`);
      return data;
    },
    enabled: !!id,
    refetchInterval: 3000,
  });

  // 👤 2. 현재 로그인한 내 정보 캐시 조회
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const { data } = await client.get("/users/me");
      return data;
    },
  });

  const myId = userProfile?.id;

  // 🛡️ [권한 로직 정밀 튜닝 슛]
  // 내 참여 정보 객체를 명확하게 찾습니다.
  const myParticipation = gathering?.participants?.find(
    (p: any) => p.user?.id === myId || p.userId === myId,
  );

  // 1. 내가 강퇴당한 유저인지 체크 ('REJECTED' 상태인지 확인)
  const isKicked = myParticipation?.status === "REJECTED";

  // 2. 승인된(ACCEPTED) 유저이거나 별도의 status 필드가 명시되지 않은 기존 정상 참여자만 인정
  const isAlreadyParticipant =
    !!myId && !!myParticipation && myParticipation.status !== "REJECTED";

  const isHost = !!myId && gathering?.hostId === myId;

  // 3. 🌟 [채팅 가드 강화] 방장이거나 정상 참여자여야 하며, '강퇴당한 상태(isKicked)'가 절대 아니어야만 채팅 접근 허용
  const canAccessChat = (isHost || isAlreadyParticipant) && !isKicked;

  useEffect(() => {
    if (tab === "CHAT" && canAccessChat) {
      setActiveTab("CHAT");
    } else if (tab === "CHAT" && !canAccessChat) {
      // 혹시라도 탭 파라미터로 강퇴 유저가 CHAT 진입 시 자동으로 INFO로 튕겨내기
      setActiveTab("INFO");
    }
  }, [tab, canAccessChat]);

  // 💬 3. [채팅] 백엔드 단체 채팅 과거 내역 조회 연동
  const { data: chatMessages = [] } = useQuery({
    queryKey: ["gatheringChats", id],
    queryFn: async () => {
      const { data } = await client.get(`/chats/public/${id}`, {
        params: { limit: 1000 },
      });
      return [...data].reverse();
    },
    enabled: !!id && activeTab === "CHAT" && canAccessChat,
    refetchInterval: 2000,
  });

  // 🚀 4. [채팅] 메시지 전송 뮤테이션
  const sendChatMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return await client.post(`/chats/public/${id}`, { message });
    },
    onSuccess: () => {
      setChatInput("");
      queryClient.invalidateQueries({ queryKey: ["gatheringChats", id] });
      setTimeout(
        () => chatScrollViewRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "메시지를 보내지 못했습니다.";
      Alert.alert("오류", errorMsg);
    },
  });

  // 🚀 5. 참여 신청 뮤테이션
  const joinGatheringMutation = useMutation({
    mutationFn: async () => {
      const { data } = await client.post(`/gatherings/${id}/join`);
      return data;
    },
    onSuccess: (data) => {
      if (data?.message) Alert.alert("알림", data.message);
      queryClient.invalidateQueries({ queryKey: ["gatheringDetail", id] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message ||
        "소모임방 참여 처리 중 문제가 발생했습니다.";
      Alert.alert("알림", errorMsg);
    },
  });

  // 🚪 6. 방 나가기 처리 뮤테이션 (참여자 전용)
  const leaveGatheringMutation = useMutation({
    mutationFn: async () => {
      const { data } = await client.delete(`/gatherings/${id}/leave`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gatherings"] });
      queryClient.resetQueries({ queryKey: ["gatheringDetail", id] });
      router.back();
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "소모임방에서 나가지 못했습니다.";
      Alert.alert("실패", errorMsg);
      router.back();
    },
  });

  // 🗑️ 7. 소모임 삭제 처리 뮤테이션 (방장 전용)
  const deleteGatheringMutation = useMutation({
    mutationFn: async () => {
      const { data } = await client.delete(`/gatherings/${id}`);
      return data;
    },
    onSuccess: (data) => {
      if (data?.message) Alert.alert("알림", data.message);

      queryClient.invalidateQueries({ queryKey: ["gatherings"] });
      queryClient.resetQueries({ queryKey: ["gatheringDetail", id] });
      queryClient.resetQueries({ queryKey: ["gatheringChats", id] });
      router.back();
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "소모임방을 삭제하지 못했습니다.";
      Alert.alert("실패", errorMsg);
    },
  });

  // 🚫 8. 멤버 강퇴 처리 뮤테이션 (방장 전용)
  const kickParticipantMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      return await client.patch(`/gatherings/${id}/participants`, {
        userId: targetUserId,
        status: "REJECTED",
      });
    },
    onSuccess: () => {
      Alert.alert("성공", "해당 멤버를 소모임에서 강퇴 처리했습니다.");
      queryClient.invalidateQueries({ queryKey: ["gatheringDetail", id] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "멤버 강퇴 처리에 실패했습니다.";
      Alert.alert("오류", errorMsg);
    },
  });

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    sendChatMessageMutation.mutate(chatInput.trim());
  };

  const handleJoinPress = () => {
    Alert.alert("소모임 참여", "정말로 이 소모임에 참여하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "확인", onPress: () => joinGatheringMutation.mutate() },
    ]);
  };

  const handleKickPress = (targetUserId: string, nickname: string) => {
    Alert.alert(
      "멤버 강퇴",
      `정말로 '${nickname}' 멤버를 강퇴 하시겠습니까?\n\n‼️ 강퇴된 멤버는 이 소모임에 다시 참여할 수 없습니다.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "강퇴",
          style: "destructive",
          onPress: () => kickParticipantMutation.mutate(targetUserId),
        },
      ],
    );
  };

  const handleHeaderBack = () => {
    if (!gathering) {
      router.back();
      return;
    }
    const myId = userProfile?.id;

    if (!!myId && gathering.hostId === myId) {
      Alert.alert(
        "소모임 삭제",
        "정말로 이 소모임을 삭제하시겠습니까?\n\n⚠️ 삭제된 소모임은 다시 복구할 수 없습니다",
        [
          { text: "취소", style: "cancel" },
          {
            text: "확인",
            style: "destructive",
            onPress: () => deleteGatheringMutation.mutate(),
          },
        ],
      );
      return;
    }

    if (!!myId && gathering.hostId !== myId) {
      Alert.alert("소모임 나가기", `정말로 소모임 참여를 취소하시겠습니까?`, [
        { text: "취소", style: "cancel" },
        {
          text: "확인",
          style: "destructive",
          onPress: () => leaveGatheringMutation.mutate(),
        },
      ]);
    }
  };

  if (isGatheringLoading || isProfileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>소모임방에 입장하는 중입니다 🍑</Text>
      </View>
    );
  }

  if (isGatheringError || isProfileError || !gathering) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={COLORS.textSub}
        />
        <Text style={styles.errorText}>
          존재하지 않거나 삭제된 소모임입니다. 👀
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 12,
            backgroundColor: COLORS.primary,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 12,
          }}
          onPress={() => {
            queryClient.invalidateQueries({ queryKey: ["gatherings"] });
            router.replace("/");
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>
            목록으로 돌아가기
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const categoryKey = gathering.category?.toUpperCase() || "TALK";
  const catTheme = CATEGORY_MAP[categoryKey] || {
    label: gathering.category,
    emoji: "📍",
    bg: "#F2F0EC",
    text: "#292524",
  };

  // 👥 [목록 정화 필터 추가] 강퇴당한 유저(`status === 'REJECTED'`)는 명단 리스트에서 원천 제외
  const activeParticipants =
    gathering.participants?.filter((p: any) => p.status !== "REJECTED") || [];

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {gathering.title}
        </Text>

        {/* 방장이거나 참여 완료된 정회원만 나가기/삭제 아이콘 단추 활성화 */}
        {canAccessChat ? (
          <TouchableOpacity onPress={handleHeaderBack} activeOpacity={0.7}>
            <Ionicons
              name={isHost ? "trash-outline" : "exit-outline"}
              size={Platform.OS === "ios" ? 22 : 21}
              color={COLORS.textMain}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* 상단 탭 구조바 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "INFO" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("INFO")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "INFO" && styles.activeTabText,
            ]}
          >
            모임 소개 정보
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "CHAT" && styles.activeTabButton,
          ]}
          onPress={() => {
            if (!canAccessChat) {
              Alert.alert(
                "입장 불가",
                isKicked
                  ? "강퇴된 소모임이므로 채팅방에 입장할 수 없습니다. ❌"
                  : "소모임 참여 멤버만 채팅할 수 있습니다.",
              );
              return;
            }
            setActiveTab("CHAT");
          }}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "CHAT" && styles.activeTabText,
            ]}
          >
            실시간 채팅방
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1. 모임 소개 정보 */}
      {activeTab === "INFO" && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.mainCard}>
            <View style={styles.cardTopHeader}>
              <View
                style={[styles.categoryBadge, { backgroundColor: catTheme.bg }]}
              >
                <Text style={[styles.categoryText, { color: catTheme.text }]}>
                  {catTheme.label} {catTheme.emoji}
                </Text>
              </View>

              {/* 🌟 [우측 상단 버튼 액션 분기 처리 고도화] */}
              {isHost ? (
                <View style={[styles.joinActionBtn, styles.hostBadge]}>
                  <Text style={styles.hostBadgeText}>내가 만든 모임 👑</Text>
                </View>
              ) : isKicked ? (
                // 강퇴당한 멤버인 경우 참여 완료 대신 '참여 불가' 렌더링 슛
                <View style={[styles.joinActionBtn, styles.kickedBadge]}>
                  <Ionicons name="ban-outline" size={14} color="#EF4444" />
                  <Text style={styles.kickedBadgeText}>참여 불가</Text>
                </View>
              ) : isAlreadyParticipant ? (
                <View style={[styles.joinActionBtn, styles.joinCompletedBtn]}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={COLORS.primary}
                  />
                  <Text style={styles.joinCompletedBtnText}>참여 완료</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.joinActionBtn, styles.joinSubmitBtn]}
                  onPress={handleJoinPress}
                  disabled={joinGatheringMutation.isPending}
                >
                  {joinGatheringMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.joinSubmitBtnText}>
                      참여하기 <Ionicons name="arrow-forward-outline" />
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.titleText}>{gathering.title}</Text>
            <View style={[styles.metaRow, { marginBottom: 12 }]}>
              <View style={styles.peopleBadge}>
                <Text style={styles.peopleText}>
                  모집 현황: {activeParticipants.length ?? 1} /{" "}
                  {gathering.maxParticipants ?? 4}명
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Ionicons
                name="location-sharp"
                size={14}
                color={COLORS.primary}
              />
              <Text style={styles.metaText}>{gathering.gatheringPlace}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons
                name="calendar-clear-outline"
                size={14}
                color={COLORS.primary}
              />
              <Text style={styles.metaText}>
                {gathering.gatheringDay
                  ?.map((d: string) => DAY_MAP[d] || d)
                  .join(", ") || "요일 미정"}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="alarm-outline" size={14} color={COLORS.primary} />
              <Text style={styles.metaText}>
                {gathering.gatheringTime
                  ?.map((t: string) => TIME_MAP[t] || t)
                  .join(", ") || "시간 미정"}
              </Text>
            </View>

            <View style={styles.divider} />
            <Text style={styles.descriptionTitle}>모임 소개</Text>
            <Text style={styles.descriptionText}>
              {gathering.description || "등록된 소개글이 없습니다."}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>방장</Text>
          <View style={styles.userRow}>
            <View style={styles.avatarContainer}>
              {gathering.host?.profileImg ? (
                <Image
                  source={gathering.host.profileImg.trim()}
                  style={styles.avatar}
                />
              ) : (
                <Text style={styles.avatarText}>🍑</Text>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.nicknameText}>
                {gathering.host?.nickname || "방장"}
              </Text>
              <Text style={styles.mannerText}>
                🌡️ 매너 온도 {gathering.host?.mannerTemperature}°C
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            참여 중인 멤버 ({activeParticipants.length}명)
          </Text>
          {/* 👥 [수정] 강퇴되지 않은 activeParticipants 목록만 화면에 맵핑 배포 */}
          {activeParticipants.map((p: any, idx: number) => {
            const participantUserId = p.user?.id || p.userId;

            return (
              <View key={participantUserId || idx} style={styles.userRow}>
                <View style={styles.avatarContainer}>
                  {p.user?.profileImg ? (
                    <Image
                      source={p.user.profileImg.trim()}
                      style={styles.avatar}
                    />
                  ) : (
                    <Text style={styles.avatarText}>🏃</Text>
                  )}
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.nicknameText}>
                    {p.user?.nickname || "참여자"}
                  </Text>
                  <Text style={styles.mannerText}>
                    🌡️ 매너 온도 {p.user?.mannerTemperature}°C
                  </Text>
                </View>

                {isHost && participantUserId !== myId && (
                  <TouchableOpacity
                    style={styles.kickButton}
                    activeOpacity={0.7}
                    onPress={() =>
                      handleKickPress(
                        participantUserId,
                        p.user?.nickname || "참여자",
                      )
                    }
                  >
                    <Ionicons
                      name="person-remove-outline"
                      style={{ fontSize: 14 }}
                      color="#E11D48"
                    />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {activeTab === "CHAT" && canAccessChat && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.chatWrapper} // 👈 flex: 1이 들어간 기존 스타일 그대로 활용
          keyboardVerticalOffset={Platform.select({
            ios: 53,
            android: 26,
          })}
        >
          {/* 2. 메시지가 흘러가는 스크롤 영역 */}
          <ScrollView
            ref={chatScrollViewRef}
            contentContainerStyle={styles.chatScrollContent}
            onContentSizeChange={() =>
              chatScrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {chatMessages.length === 0 ? (
              <Text style={styles.emptyText}>
                실시간 채팅방이 개설되었습니다! {"\n"} 첫 대화를 나눠보세요 💬
              </Text>
            ) : (
              chatMessages.map((msg: any) => {
                const isMe = msg.senderId === myId;
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.chatBubbleRow,
                      isMe ? styles.chatRowMe : styles.chatRowOther,
                    ]}
                  >
                    {!isMe && (
                      <View style={styles.chatAvatarBox}>
                        {msg.sender?.profileImg ? (
                          <Image
                            source={msg.sender.profileImg.trim()}
                            style={styles.chatAvatar}
                          />
                        ) : (
                          <Text style={{ fontSize: 12 }}>🏃</Text>
                        )}
                      </View>
                    )}
                    <View
                      style={isMe ? styles.chatInfoMe : styles.chatInfoOther}
                    >
                      {!isMe && (
                        <Text style={styles.chatSenderName}>
                          {msg.sender?.nickname || "멤버"}
                        </Text>
                      )}
                      <View
                        style={[
                          styles.bubble,
                          isMe ? styles.bubbleMe : styles.bubbleOther,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chatMessageText,
                            isMe ? styles.chatTextMe : styles.chatTextOther,
                          ]}
                        >
                          {msg.message}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* 3. 하단 메시지 입력창 바 (이제 키보드 바로 위에 이쁘게 밀착합니다) */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="메시지를 입력해주세요"
              placeholderTextColor={COLORS.textSub}
              value={chatInput}
              onChangeText={setChatInput}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !chatInput.trim() && { backgroundColor: COLORS.border },
              ]}
              onPress={handleSendMessage}
              disabled={!chatInput.trim() || sendChatMessageMutation.isPending}
            >
              <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: Platform.OS === "ios" ? 10 : 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    gap: 12,
  },
  loadingText: { fontSize: 14, fontWeight: "600", color: COLORS.textSub },
  errorText: { fontSize: 14, fontWeight: "600", color: COLORS.textSub },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textMain,
    maxWidth: "70%",
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabButton: { flex: 1, paddingVertical: 14, alignItems: "center" },
  activeTabButton: { borderBottomWidth: 3, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: "600", color: COLORS.textSub },
  activeTabText: { color: COLORS.primary, fontWeight: "800" },

  scrollContent: { padding: 20 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 12,
    paddingLeft: 4,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarText: { fontSize: 22 },
  userInfo: { marginLeft: 12, gap: 2 },
  nicknameText: { fontSize: 14, fontWeight: "700", color: COLORS.textMain },
  mannerText: { fontSize: 11, fontWeight: "600", color: COLORS.primary },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSub,
    textAlign: "center",
    marginTop: 100,
    fontWeight: "500",
    lineHeight: 20,
  },

  mainCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  categoryText: { fontSize: 12, fontWeight: "800" },
  joinActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  joinSubmitBtn: { backgroundColor: COLORS.primary },
  joinSubmitBtnText: { fontSize: 11, color: "#FFFFFF", fontWeight: "800" },
  joinCompletedBtn: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  joinCompletedBtnText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "800",
  },
  hostBadge: {
    backgroundColor: "#F5F5F4",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hostBadgeText: { fontSize: 11, color: COLORS.textSub, fontWeight: "700" },
  peopleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F5F5F4",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  peopleText: { fontSize: 12, color: COLORS.textSub, fontWeight: "700" },
  titleText: {
    fontSize: 22,
    fontWeight: Platform.OS === "ios" ? "900" : "700",
    color: COLORS.textMain,
    marginBottom: 14,
    marginTop: 10,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  metaText: { fontSize: 13, color: COLORS.textSub, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#F5F5F4", marginVertical: 16 },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: "#44403C",
    fontWeight: "600",
    lineHeight: 22,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F2F0EC",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatar: { width: 44, height: 44, borderRadius: 14 },

  chatWrapper: { flex: 1, justifyContent: "space-between" },
  chatScrollContent: { padding: 16, paddingBottom: 24 },
  chatBubbleRow: { flexDirection: "row", marginBottom: 14, maxWidth: "80%" },
  chatRowMe: { alignSelf: "flex-end" },
  chatRowOther: { alignSelf: "flex-start" },
  chatAvatarBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F2F0EC",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: 8,
    marginTop: 4,
  },
  chatAvatar: { width: 32, height: 32 },
  chatInfoMe: { alignItems: "flex-end" },
  chatInfoOther: { alignItems: "flex-start" },
  chatSenderName: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSub,
    marginBottom: 4,
  },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMe: { backgroundColor: COLORS.primary, borderBottomRightRadius: 2 },
  bubbleOther: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chatMessageText: { fontSize: 14, lineHeight: 20, fontWeight: "500" },
  chatTextMe: { color: "#FFFFFF" },
  chatTextOther: { color: COLORS.textMain },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 15 : 14,
    paddingBottom: Platform.OS === "ios" ? 8 : 15,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#F5F5F4",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: Platform.OS === "ios" ? 14 : 13,
    color: COLORS.textMain,
    maxHeight: 80,
    minHeight: 38,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },

  kickButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF1F2",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginLeft: "auto",
  },
  kickButtonText: {
    fontSize: 11,
    color: "#E11D48",
    fontWeight: "800",
  },

  // 🚨 [추가] 강퇴당한 유저(참여 불가) 전용 뱃지 스타일 규격 스펙
  kickedBadge: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  kickedBadgeText: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "800",
  },
});
