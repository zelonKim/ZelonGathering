import { getGatheringChats } from "@/app/api/chat/getGatheringChats";
import { getGatheringDetail } from "@/app/api/gathering/getGatheringDetail";
import { getMyProfile } from "@/app/api/profile/getMyProfile";
import { GatheringChatTab } from "@/components/GatheringChatTab";
import { GatheringInfoTab } from "@/components/GatheringInfoTab";
import { DAY_MAPS } from "@/constants/dayMaps";
import { GATHERING_CATEGORY_COLOR } from "@/constants/gatheringCategoryColor";
import { TIME_MAPS } from "@/constants/timeMaps";
import { useDeleteGathering } from "@/hooks/useDeleteGathering";
import { useJoinGathering } from "@/hooks/useJoinGathering";
import { useKickParticipant } from "@/hooks/useKickParticipant";
import { useLeaveGathering } from "@/hooks/useLeaveGathering";
import { useSendChatMessage } from "@/hooks/useSendChatMessage";
import { GatheringParticipant } from "@/types/GatheringDetail";
import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GatheringDetailPage() {
  const router = useRouter();
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const gatheringId = id as string;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"INFO" | "CHAT">(
    tab === "CHAT" ? "CHAT" : "INFO",
  );
  const [chatInput, setChatInput] = useState("");

  const chatEndRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    return () => {
      queryClient.resetQueries({ queryKey: ["gatheringDetail", gatheringId] });
      queryClient.resetQueries({ queryKey: ["gatheringChats", gatheringId] });
    };
  }, [gatheringId, queryClient]);

  ///////////////////////////////////////////////////////////////////////////////////

  const {
    data: gathering,
    isLoading: isGatheringLoading,
    isError: isGatheringError,
  } = useQuery({
    queryKey: ["gatheringDetail", gatheringId],
    queryFn: () => getGatheringDetail(gatheringId),
    enabled: !!gatheringId,
    refetchInterval: 3000,
  });

  ///////////////////////////////////////////////////////////////////////////////////

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["myProfile"],
    queryFn: getMyProfile,
  });

  const myId = userProfile?.id;

  ///////////////////////////////////////////////////////////////////////////////////

  const myParticipation = gathering?.participants?.find(
    (p: GatheringParticipant) => p.user?.id === myId || p.userId === myId,
  );

  const isKicked = myParticipation?.status === "REJECTED";

  const isAlreadyParticipant =
    !!myId && !!myParticipation && myParticipation.status !== "REJECTED";

  const isHost = !!myId && gathering?.host?.id === myId;

  const canAccessChat = (isHost || isAlreadyParticipant) && !isKicked;

  ///////////////////////////////////////////////////////////////////////////////////

  const { data: chatMessages = [] } = useQuery({
    queryKey: ["gatheringChats", gatheringId],
    queryFn: () => getGatheringChats(gatheringId),
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (tab === "CHAT" && canAccessChat) {
      setActiveTab("CHAT");
    } else {
      setActiveTab("INFO");
    }
  }, [tab, canAccessChat]);

  useEffect(() => {
    if (activeTab === "CHAT") {
      chatEndRef.current?.scrollToEnd({ animated: true });
    }
  }, [chatMessages, activeTab]);

  ///////////////////////////////////////////////////////////////////////////////////

  const {
    mutate: sendChatMessageMutation,
    isPending: isChatMessageSendPending,
  } = useSendChatMessage(gatheringId);

  const handleSendMessage = () => {
    if (!chatInput.trim() || isChatMessageSendPending) return;

    sendChatMessageMutation(chatInput.trim(), {
      onSuccess: () => {
        setChatInput("");
      },
    });
  };

  ///////////////////////////////////////////////////////////////////////////////////

  const { mutate: joinGatheringMutation, isPending: isJoinGatheringPending } =
    useJoinGathering(gatheringId);

  const handleJoinPress = () => {
    Alert.alert("소모임 참여", "정말로 이 소모임에 참여하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "참여", onPress: () => joinGatheringMutation() },
    ]);
  };

  ///////////////////////////////////////////////////////////////////////////////////

  const { mutate: deleteGatheringMutation } = useDeleteGathering(gatheringId);
  const { mutate: leaveGatheringMutation } = useLeaveGathering(gatheringId);

  const handleOutAction = () => {
    if (isHost) {
      Alert.alert(
        "소모임 삭제",
        "정말로 이 소모임을 삭제하시겠습니까?\n\n⚠️ 삭제 후 복구는 불가능합니다.",
        [
          { text: "취소", style: "cancel" },
          {
            text: "삭제",
            style: "destructive",
            onPress: () => deleteGatheringMutation(),
          },
        ],
      );
    } else {
      Alert.alert(
        "참여 취소",
        "정말로 소모임 참여를 취소하고 나가시겠습니까?",
        [
          { text: "취소", style: "cancel" },
          {
            text: "나가기",
            style: "destructive",
            onPress: () => leaveGatheringMutation(),
          },
        ],
      );
    }
  };

  ///////////////////////////////////////////////////////////////////////////////////

  const { mutate: kickParticipantMutation } = useKickParticipant(gatheringId);

  const handleKickPress = (targetUserId: string, nickname: string) => {
    Alert.alert("멤버 강퇴", `정말로 '${nickname}' 멤버를 강퇴 하시겠습니까?`, [
      { text: "취소", style: "cancel" },
      {
        text: "강퇴",
        style: "destructive",
        onPress: () => kickParticipantMutation(targetUserId),
      },
    ]);
  };

  ///////////////////////////////////////////////////////////////////////////////////

  if (isGatheringLoading || isProfileLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF7A59" />
        <Text style={styles.loadingText}>소모임방에 입장하는 중입니다 🍑</Text>
      </View>
    );
  }

  if (isGatheringError || isProfileError || !gathering) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-circle" size={48} color="#78716C" />
        <Text style={styles.errorText}>
          존재하지 않거나 이미 폐쇄된 소모임방입니다.
        </Text>
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => {
            queryClient.invalidateQueries({ queryKey: ["gatherings"] });
            router.replace("/");
          }}
        >
          <Text style={styles.dashboardButtonText}>대시보드로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  ///////////////////////////////////////////////////////////////////////////////////

  const cateTheme = GATHERING_CATEGORY_COLOR[gathering.category?.toUpperCase()];

  const activeParticipants =
    gathering.participants?.filter(
      (p: GatheringParticipant) => p.status === "ACCEPTED",
    ) || [];

  ///////////////////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <Feather name="chevron-left" size={24} color="#292524" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {gathering.title}
          </Text>

          {canAccessChat ? (
            <TouchableOpacity
              onPress={handleOutAction}
              style={styles.iconButton}
            >
              <Feather
                name={isHost ? "trash-2" : "log-out"}
                size={20}
                color="#292524"
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 32 }} />
          )}
        </View>

        <View style={styles.tabHeader}>
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
              소모임 정보
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
                  "알림",
                  isKicked
                    ? "강퇴된 소모임이므로 채팅방에 입장할 수 없습니다."
                    : "소모임에 참여한 멤버만 채팅방에 입장할 수 있습니다.",
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
              소모임 채팅방
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {activeTab === "INFO" && (
            <GatheringInfoTab
              gathering={gathering}
              activeParticipants={activeParticipants}
              cateTheme={cateTheme}
              isHost={isHost}
              isKicked={isKicked}
              isAlreadyParticipant={isAlreadyParticipant}
              isJoinGatheringPending={isJoinGatheringPending}
              myId={myId}
              handleJoinPress={handleJoinPress}
              handleKickPress={handleKickPress}
              DAY_MAPS={DAY_MAPS}
              TIME_MAPS={TIME_MAPS}
            />
          )}

          {activeTab === "CHAT" && canAccessChat && (
            <GatheringChatTab
              chatMessages={chatMessages}
              myId={myId}
              chatInput={chatInput}
              setChatInput={setChatInput}
              handleSendMessage={handleSendMessage}
              isChatMessageSendPending={isChatMessageSendPending}
              chatEndRef={chatEndRef}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

///////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FBFBF9",
    paddingHorizontal: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#78716C",
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#78716C",
    textAlign: "center",
  },
  dashboardButton: {
    backgroundColor: "#FF7A59",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  dashboardButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#292524",
    maxWidth: "65%",
  },
  iconButton: {
    padding: 4,
  },
  tabHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E7E5E4",
    backgroundColor: "#FFFFFF",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: "#FF7A59",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#78716C",
  },
  activeTabText: {
    color: "#FF7A59",
    fontWeight: "900",
  },
  contentContainer: {
    flex: 1,
  },
});
