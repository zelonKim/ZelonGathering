import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabsLayout() {
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF7A59", // 활성화된 탭 색상 (Zelon 포인트 컬러)
        tabBarInactiveTintColor: "#8E8E93", // 비활성화된 탭 색상
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E5EA",

          height: Platform.OS === "ios" ? 88 : 68, // 안드로이드 기본 높이를 64에서 74로 확장

          paddingBottom: Platform.OS === "ios" ? 10 : 16, // 안드로이드 하단 여백을 주어 아이콘을 위로 밀어 올림
          paddingTop: 10,
        },
        
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
      }}
    >
      {/* 4. 프로필 탭 */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "프로필",

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 3. 채팅 탭 */}
      <Tabs.Screen
        name="chats"
        options={{
          title: "채팅",

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              size={24}
              color={color}
            />
          ),
          tabBarBadge: 3,
        }}
      />

      {/* 2. AI 매칭 탭 */}
      <Tabs.Screen
        name="matching"
        options={{
          title: "AI 매칭",

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "sparkles" : "sparkles-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      {/* 1. 홈 탭 */}
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",

          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
