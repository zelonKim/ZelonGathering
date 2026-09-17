import { getMyNotifications } from "@/app/api/notification/getMyNotifications";
import { useDeleteNotification } from "@/hooks/useDeleteNotification";
import { NotificationItem } from "@/types/NotificationItem";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MatchingPage() {
  const {
    mutate: deleteNotiMutation,
    isPending: isDeleteNotiPending,
    variables: deleteNotiId,
  } = useDeleteNotification();

  const deletingId = isDeleteNotiPending ? deleteNotiId : null;

  ///////////////////////////////////////////////////////////////////////////////////

  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useQuery<NotificationItem[]>({
    queryKey: ["myNotifications"],
    queryFn: getMyNotifications,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF7A59" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-circle" size={40} color="#78716C" />
        <Text style={styles.errorText}>매칭 데이터를 불러오지 못했습니다.</Text>
      </View>
    );
  }

  ///////////////////////////////////////////////////////////////////////////////////

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.brandTitle}>AI Matching</Text>
      <Text style={styles.headerSubtitle}>🤖 AI가 찾아낸 취향 저격 소모임</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>아직 들어온 매칭 알림이 없습니다!</Text>
      <Text style={[styles.emptyText, { marginTop: 8 }]}>
        매칭 알림을 받고 싶다면, 소모임 취향 프로필을 작성해주세요 ✏️
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const isCurrentItemDeleting = deletingId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.matchBadge}>
            <FontAwesome5 name="sparkles" size={12} color="#F43F5E" />
            <Text style={styles.matchBadgeText}>매칭률 {item.matchRate}%</Text>
          </View>
          <Text style={styles.timeText}>
            {formatDistanceToNow(new Date(item.createdAt), {
              addSuffix: true,
              locale: ko,
            })}
          </Text>
        </View>

        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.aiMessageBox}>
          <Text style={styles.aiMessageText}>
            <Text style={styles.aiMessageLabel}>AI의 한마디: </Text>
            {item.message}
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => deleteNotiMutation(item.id)}
            disabled={isDeleteNotiPending}
            style={[styles.button, styles.skipButton]}
          >
            {isCurrentItemDeleting ? (
              <ActivityIndicator size="small" color="#78716C" />
            ) : (
              <Text style={styles.skipButtonText}>넘기기</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/gatherings/${item.linkId}`)}
            disabled={isDeleteNotiPending}
            style={[styles.button, styles.joinButton]}
          >
            <Text style={styles.joinButtonText}>참여하러 가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  ///////////////////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

///////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFBF9",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FBFBF9",
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#78716C",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    paddingVertical: 16,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FF7A59",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#292524",
    marginTop: 4,
  },
  emptyContainer: {
    paddingVertical: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#78716C",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  matchBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFEBEB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#F43F5E",
  },
  timeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#78716C",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#292524",
    lineHeight: 24,
    marginBottom: 8,
  },
  aiMessageBox: {
    backgroundColor: "#F8F6F4",
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  aiMessageText: {
    fontSize: 14,
    color: "#292524",
    lineHeight: 20,
  },
  aiMessageLabel: {
    color: "#F43F5E",
    fontWeight: "800",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButton: {
    flex: 1,
    backgroundColor: "#F2F0EC",
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#78716C",
  },
  joinButton: {
    flex: 2,
    backgroundColor: "#FF7A59",
    elevation: 2,
    shadowColor: "#FF7A59",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
