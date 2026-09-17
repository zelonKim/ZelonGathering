import { CHAT_CATEGORY_COLOR } from "@/constants/chatCategoryColor";
import { ChatRoomListItem } from "@/types/ChatRoomListItem";
import { PrivateChatRoomListItem } from "@/types/PrivateChatRoomListItem";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMyChats } from "../api/chat/getMyChats";
import { getMyPrivateChats } from "../api/chat/getMyPrivateChatRooms";
import { getMyProfile } from "../api/profile/getMyProfile";

export default function ChatsScreen() {
  const [activeTab, setActiveTab] = useState<"Gathering" | "DM">("Gathering");

  const { data: myProfile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: getMyProfile,
  });
  const myId = myProfile?.id;

  const {
    data: gatheringChats = [],
    isLoading: isGatheringLoading,
    isError: isGatheringError,
  } = useQuery<ChatRoomListItem[]>({
    queryKey: ["myChats"],
    queryFn: getMyChats,
    refetchInterval: 5000,
  });

  const {
    data: privateChats = [],
    isLoading: isPrivateLoading,
    isError: isPrivateError,
  } = useQuery<PrivateChatRoomListItem[]>({
    queryKey: ["myPrivateChats"],
    queryFn: getMyPrivateChats,
    refetchInterval: 5000,
  });

  const isLoading = isGatheringLoading || isPrivateLoading;
  const isError = isGatheringError || isPrivateError;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF7A59" />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Feather name="alert-circle" size={48} color="#78716C" />
        <Text style={styles.errorText}>채팅 목록을 가져오지 못했습니다.</Text>
      </SafeAreaView>
    );
  }

  ///////////////////////////////////////////////////////////////

  const renderGatheringItem = ({ item }: { item: ChatRoomListItem }) => {
    const categoryKey = item.category?.toUpperCase();
    const theme = CHAT_CATEGORY_COLOR[categoryKey];

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          router.push(`/gatherings/${item.id}?tab=CHAT`)
        }}
        style={styles.chatCard}
      >
        <View
          style={[styles.iconBox, { backgroundColor: theme?.bg || "#E7E5E4" }]}
        >
          <Text style={{ fontSize: 22 }}>{theme?.icon || "💬"}</Text>
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.chatTime}>{item.lastMessageTime || ""}</Text>
          </View>
          <Text
            style={[
              styles.chatMessage,
              item.unreadCount > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage ||
              "아직 주고받은 대화가 없습니다. 첫 인사를 건네보세요!"}
          </Text>
        </View>

        {item.unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  ///////////////////////////////////////////////////////////////

  const renderDMItem = ({ item }: { item: PrivateChatRoomListItem }) => {
    const partner = item.userAId === myId ? item.userB : item.userA;
    const lastMsg = item.messages[0];

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          router.push(`/DM/${item.id}`);
        }}
        style={styles.chatCard}
      >
        <View style={styles.avatarBox}>
          {partner?.profileImg ? (
            <Image
              source={{ uri: partner.profileImg }}
              style={styles.avatarImage}
            />
          ) : (
            <Ionicons name="person" size={24} color="#78716C" />
          )}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle} numberOfLines={1}>
              {partner?.nickname}
            </Text>
            <Text style={styles.chatTime}>
              {lastMsg?.createdAt
                ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </Text>
          </View>
          <Text style={styles.chatMessage} numberOfLines={1}>
            {lastMsg?.message || "대화를 시작해 보세요!"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  ///////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chatting</Text>
        <Text style={styles.headerSubtitle}>👋 우리들의 실시간 대화</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab("Gathering")}
            style={[
              styles.tabButton,
              activeTab === "Gathering" && styles.activeTabButton,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Gathering" && styles.activeTabText,
              ]}
            >
              💬 소모임 채팅
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab("DM")}
            style={[
              styles.tabButton,
              activeTab === "DM" && styles.activeTabButton,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "DM" && styles.activeTabText,
              ]}
            >
              👤 DM
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === "Gathering" ? (
        <FlatList
          data={gatheringChats}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGatheringItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                현재 참여 중인 소모임 채팅방이 없습니다.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={privateChats}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDMItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                진행 중인 1:1 대화가 없습니다.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFBF9",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#FBFBF9",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#78716C",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FF7A59",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E7E5E4",
    marginTop: 16,
  },
  tabButton: {
    flex: 1,
    paddingBottom: 10,
    alignItems: "center",
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF7A59",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#78716C",
  },
  activeTabText: {
    color: "#FF7A59",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#F5F5F4",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  chatContent: {
    flex: 1,
    marginHorizontal: 14,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#292524",
    maxWidth: "75%",
  },
  chatTime: {
    fontSize: 12,
    fontWeight: "500",
    color: "#78716C",
  },
  chatMessage: {
    fontSize: 14,
    color: "#78716C",
  },
  unreadMessage: {
    color: "#292524",
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "#FF7A59",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#78716C",
    textAlign: "center",
    lineHeight: 22,
  },
});
