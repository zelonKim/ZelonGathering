import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 🍑 ZelonGathering 피치 코랄 배색 상수
const COLORS = {
  primary: "#FF7A59", // 메인 피치 코랄
  primaryLight: "#FFEBE5", // 연한 피치 (치트키 배경용)
  background: "#FBFBF9", // 감성 웜 화이트 배경
  surface: "#FFFFFF", // 카드 화이트
  textMain: "#292524", // 세련된 차콜 먹색
  textSub: "#78716C", // 부가 설명 그레이
  border: "#E7E5E4", // 연한 테두리
  aiPurple: "#F43F5E", // AI만의 특별한 아우라를 위한 소프트 퍼플
  aiPurpleLight: "#FFEBEB", // AI 태그 배경
};

// 🤖 AI가 성진님에게 실시간으로 콕 집어 배달한 소모임 알림 데이터
const MOCK_AI_NOTIFICATIONS = [
  {
    id: "1",
    timeAgo: "방금 전",
    title: "한강 텐트 치고 노을 보면서 치맥 피크닉!",
    location: "뚝섬유원지 (350m 인근)",
    aiReason:
      "성진님이 최근 찜한 '아웃도어' 성향 및 근거리 유저 3명이 이미 참여 중이에요! ⚡",
    matchRate: "98%",
  },
  {
    id: "2",
    title: "성수 힙한 카페에서 수다 떨며 보드게임 한 판",
    location: "성수동 팝업거리 (1.2km 인근)",
    aiReason:
      "주말 오후 대화형 소셜을 선호하는 성진님 취향 저격! 케미 좋은 멤버들로 구성됨 🔮",
    matchRate: "89%",
  },
  {
    id: "3",
    title: "연남동 숨은 맛집 탐방하고 인생네컷 찍기",
    location: "홍대/연남 (4.8km 인근)",
    aiReason:
      "성진님이 좋아하는 핫플 탐방 코스! 선착순 단 1자리 남아서 긴급 배달 완료 ⏰",
    matchRate: "85%",
  },
];

export default function MatchingScreen() {
  return (
    <View style={styles.container}>
      {/* 1. 상단 트렌디 타이틀 바 */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>AI Matching</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          🤖 AI가 찾아낸 취향 저격 소모임
        </Text>
      </View>

      {/* 2. 매칭 알림 피드 리스트 */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_AI_NOTIFICATIONS.map((item) => (
          <View key={item.id} style={styles.matchCard}>
            {/* 카드 상단: AI 매칭률 & 시간 */}
            <View style={styles.cardHeader}>
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={12} color={COLORS.aiPurple} />
                <Text style={styles.aiBadgeText}>
                  취향 저격 {item.matchRate}
                </Text>
              </View>
              <Text style={styles.timeText}>{item.timeAgo}</Text>
            </View>

            {/* 카드 본문: 배달된 모임 정보 */}
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.locationText}>📍 {item.location}</Text>

            {/* ✨ 핵심: AI가 이 모임을 추천한 이유 (말풍선 감성) */}
            <View style={styles.aiReasonBox}>
              <Text style={styles.aiReasonText}>
                <Text style={styles.aiReasonHighlight}>AI 분석 결과: </Text>
                {item.aiReason}
              </Text>
            </View>

            {/* 카드 하단: 거절/수락 대신 2030 감성의 액션 버튼 */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.passButton} activeOpacity={0.7}>
                <Text style={styles.passButtonText}>넘기기</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.joinButton} activeOpacity={0.8}>
                <Text style={styles.joinButtonText}>참석하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {/* 하단 여백 가볍게 확보 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary, // 피치 코랄로 반짝이는 라이브 점
  },
  liveText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textMain,
    marginTop: 3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  matchCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24, // 홈 화면보다 조금 더 둥글고 폭신한 카드 감성
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.aiPurpleLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 12,
    color: COLORS.aiPurple,
    fontWeight: "700",
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textSub,
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textMain,
    lineHeight: 24,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textSub,
    fontWeight: "500",
    marginBottom: 14,
  },
  // 🤖 AI 추천 박스 스타일
  aiReasonBox: {
    backgroundColor: "#F8F6F4", // 차분한 뮤트 베이지/그레이 배경
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  aiReasonText: {
    fontSize: 13,
    color: COLORS.textMain,
    lineHeight: 19,
  },
  aiReasonHighlight: {
    color: COLORS.aiPurple,
    fontWeight: "700",
  },
  // 🔘 하단 트렌디 버튼 레이아웃
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  passButton: {
    flex: 1,
    backgroundColor: "#F2F0EC",
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  passButtonText: {
    fontSize: 14,
    color: COLORS.textSub,
    fontWeight: "600",
  },
  joinButton: {
    flex: 2, // '나도 갈래!' 버튼을 시각적으로 더 넓고 매력적이게 배분
    backgroundColor: COLORS.primary, // 🍑 피치 코랄로 쾅! 찔러넣기
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    // 쫀득한 버튼 그림자
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  joinButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
