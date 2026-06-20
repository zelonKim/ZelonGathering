import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF7A59",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E5EA",

          // 🌟 [안드로이드 탭바 높이 및 여백 정밀 고정]
          // 안드로이드는 시스템 바가 높이를 먹기 때문에 패딩보다 높이 자체를 안정적으로 확보하는 게 좋습니다.
          height: Platform.OS === "ios" ? 82 : 63,

          // 🌟 안드로이드 패딩 값을 0이나 4 정도로 대폭 줄여서 시스템 내비게이션 바와 충돌 시 탭바가 내려가는 현상을 방지합니다.
          paddingBottom: Platform.OS === "ios" ? 10 : 4,
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

      {/* 2. 채팅 탭 */}
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

      {/* 3. AI 매칭 탭 */}
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
    </Tabs>
  );
}
