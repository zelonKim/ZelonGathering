import { getUserProfile } from "@/app/api/profile/getUserProfile";
import { CATEGORY_ITEMS } from "@/constants/categoryItems";
import { DAY_ITEMS } from "@/constants/dayItems";
import { DISTRICT_ITEMS } from "@/constants/districtItems";
import { TIME_ITEMS } from "@/constants/timeItems";
import { UserProfile } from "@/types/UserProfile";
import { formatLabels } from "@/utils/formatLabels";
import { AntDesign, Feather, Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileInfoPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const userId = id as string;

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<UserProfile>({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF7A59" />
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>프로필 정보를 불러올 수 없습니다.</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={styles.backBtnError}
        >
          <Text style={styles.backBtnErrorText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  ///////////////////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={20} color="#292524" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 정보</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            {profile.profileImg ? (
              <Image
                source={{ uri: profile.profileImg }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={{ fontSize: 36 }}>🍑</Text>
            )}
          </View>

          <Text style={styles.nicknameText}>{profile.nickname}</Text>

          <View style={styles.tagRow}>
            {profile.age && (
              <View style={styles.ageBadge}>
                <Text style={styles.ageBadgeText}>{profile.age}세</Text>
              </View>
            )}
            {profile.mbti && (
              <View style={styles.mbtiBadge}>
                <Text style={styles.mbtiBadgeText}>
                  {profile.mbti.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.mannerBadge}>
            <Feather name="smile" size={16} color="#FF7A59" />
            <Text style={styles.mannerLabel}>매너온도</Text>
            <Text style={styles.mannerValue}>
              {profile.mannerTemperature ?? 36.5}°C
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="sparkles" size={16} color="#FF7A59" />
            <Text style={styles.sectionTitle}>모임 취향 & 선호</Text>
          </View>

          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Feather
                name="tag"
                size={16}
                color="#FF7A59"
                style={styles.iconMargin}
              />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>관심 카테고리</Text>
                <Text style={styles.gridValue}>
                  {formatLabels(profile.preferCategory, CATEGORY_ITEMS)}
                </Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <Feather
                name="map-pin"
                size={16}
                color="#FF7A59"
                style={styles.iconMargin}
              />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>선호 지역</Text>
                <Text style={styles.gridValue}>
                  {formatLabels(profile.preferDistrict, DISTRICT_ITEMS)}
                </Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <Feather
                name="calendar"
                size={16}
                color="#FF7A59"
                style={styles.iconMargin}
              />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>선호 요일</Text>
                <Text style={styles.gridValue}>
                  {formatLabels(profile.preferDay, DAY_ITEMS)}
                </Text>
              </View>
            </View>

            <View style={styles.gridItem}>
              <Feather
                name="clock"
                size={16}
                color="#FF7A59"
                style={styles.iconMargin}
              />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>선호 시간대</Text>
                <Text style={styles.gridValue}>
                  {formatLabels(profile.preferTime, TIME_ITEMS)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.likeDislikeRow}>
            <View style={styles.heartIconWrapper}>
              <AntDesign name="heart" size={14} color="#F43F5E" />
            </View>
            <View style={styles.likeDislikeTextGroup}>
              <Text style={styles.likeDislikeLabel}>좋아해요</Text>
              <Text style={styles.likeDislikeValue}>
                {profile.favorite || "등록된 내용이 없습니다."}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.likeDislikeRow}>
            <View style={styles.thumbsDownIconWrapper}>
              <Feather name="thumbs-down" size={14} color="#78716C" />
            </View>
            <View style={styles.likeDislikeTextGroup}>
              <Text style={styles.likeDislikeLabel}>싫어해요</Text>
              <Text style={styles.likeDislikeValue}>
                {profile.hate || "등록된 내용이 없습니다."}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    padding: 24,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#78716C",
  },
  backBtnError: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#E7E5E4",
    borderRadius: 12,
  },
  backBtnErrorText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#292524",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E7E5E4",
  },
  backButton: {
    padding: 6,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#292524",
  },
  headerRightSpace: {
    width: 32,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    padding: 24,
    alignItems: "center",
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: "#F5F5F4",
    borderWidth: 1,
    borderColor: "#FB923C",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  nicknameText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#292524",
  },
  tagRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  ageBadge: {
    backgroundColor: "#F5F5F4",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ageBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#78716C",
  },
  mbtiBadge: {
    backgroundColor: "#FFEDD5",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  mbtiBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF7A59",
  },
  mannerBadge: {
    marginTop: 16,
    backgroundColor: "#FBFBF9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mannerLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#78716C",
  },
  mannerValue: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FF7A59",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    padding: 20,
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#292524",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridItem: {
    width: "48.5%",
    backgroundColor: "#FBFBF9",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconMargin: {
    marginTop: 2,
    marginRight: 6,
  },
  gridTextContainer: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#78716C",
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#292524",
    lineHeight: 18,
  },
  likeDislikeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  heartIconWrapper: {
    padding: 8,
    backgroundColor: "#FFE4E6",
    borderRadius: 12,
  },
  thumbsDownIconWrapper: {
    padding: 8,
    backgroundColor: "#F5F5F4",
    borderRadius: 12,
  },
  likeDislikeTextGroup: {
    flex: 1,
  },
  likeDislikeLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#78716C",
  },
  likeDislikeValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#292524",
    marginTop: 2,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#E7E5E4",
    marginVertical: 4,
  },
});
