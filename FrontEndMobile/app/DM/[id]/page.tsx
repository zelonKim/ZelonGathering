import { getPrivateMessages } from "@/app/api/chat/getPrivateMessages";
import { client } from "@/app/api/client";
import { getMyProfile } from "@/app/api/profile/getMyProfile";
import { ChatMessage } from "@/types/ChatMessage";
import { PrivateChatRoomDetail } from "@/types/PrivateChatRoomDetail";
import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { io, Socket } from "socket.io-client";

export default function PrivateChatPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const roomId = id as string;
  const queryClient = useQueryClient();

  const [chatInput, setChatInput] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const socketRef = useRef<Socket | null>(null);

  const { data: myProfile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: getMyProfile,
  });

  const myId = myProfile?.id;

  ///////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!roomId || !myId) return;

    const socket = io(`${process.env.EXPO_PUBLIC_API_URL}`, {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ 웹소켓 연결 성공! Socket ID:", socket.id);
      socket.emit("join_room", { roomId });
    });

    socket.on("connect_error", (err) => {
      console.error("❌ 웹소켓 연결 실패:", err.message);
    });

    socket.on("new_private_message", (newMessage: ChatMessage) => {
      console.log("📩 새 메시지 수신:", newMessage);
      queryClient.setQueryData<ChatMessage[]>(
        ["privateMessages", roomId],
        (old = []) => {
          if (old.some((msg) => msg.id === newMessage.id)) return old;
          return [...old, newMessage];
        },
      );
    });

    return () => {
      socket.emit("leave_room", { roomId });
      socket.disconnect();
    };
  }, [roomId, myId, queryClient]);

  ///////////////////////////////////////////////////////////////////////////////////

  const {
    data: roomData,
    isLoading: isRoomLoading,
    isError,
  } = useQuery<PrivateChatRoomDetail>({
    queryKey: ["privateChatRoom", roomId],
    queryFn: async () => {
      const { data } = await client.get(`/chats/private/room/${roomId}`);
      return data;
    },
    enabled: !!roomId,
  });

  const partnerUser = roomData
    ? roomData.userAId === myId
      ? roomData.userB
      : roomData.userA
    : null;

  ///////////////////////////////////////////////////////////////////////////////////

  const { data: chatMessages = [], isLoading: isMessagesLoading } = useQuery<
    ChatMessage[]
  >({
    queryKey: ["privateMessages", roomId],
    queryFn: () => getPrivateMessages(roomId, 500),
    enabled: !!roomId,
  });

  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  ///////////////////////////////////////////////////////////////////////////////////

  const handleSendMessage = () => {
    if (!chatInput.trim() || !socketRef.current || !myId) return;

    socketRef.current.emit("send_private_message", {
      roomId,
      senderId: myId,
      dto: { message: chatInput },
    });

    setChatInput("");
  };

  ///////////////////////////////////////////////////////////////////////////////////

  if (isRoomLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color="#FF7A59" />
        <Text style={styles.loadingText}>채팅방을 불러오는 중...</Text>
      </View>
    );
  }

  if (isError || !partnerUser) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>채팅방을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  ///////////////////////////////////////////////////////////////////////////////////

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === myId;

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowPartner,
        ]}
      >
        {!isMe && (
          <View style={styles.partnerAvatarSmall}>
            {partnerUser.profileImg ? (
              <Image
                source={{ uri: partnerUser.profileImg }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={{ fontSize: 12 }}>🍑</Text>
            )}
          </View>
        )}

        <View
          style={[
            styles.messageContent,
            isMe ? styles.alignEnd : styles.alignStart,
          ]}
        >
          {!isMe && (
            <Text style={styles.partnerNameText}>{partnerUser.nickname}</Text>
          )}
          <View
            style={[
              styles.messageBubble,
              isMe ? styles.bubbleMe : styles.bubblePartner,
            ]}
          >
            <Text style={isMe ? styles.bubbleTextMe : styles.bubbleTextPartner}>
              {item.message}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  ///////////////////////////////////////////////////////////////////////////////////

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/chats?tab=DM")}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={20} color="#44403C" />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <View style={styles.partnerAvatarHeader}>
              {partnerUser.profileImg ? (
                <Image
                  source={{ uri: partnerUser.profileImg }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={{ fontSize: 16 }}>🍑</Text>
              )}
            </View>
            <View>
              <Text style={styles.partnerNickname}>{partnerUser.nickname}</Text>
              <Text style={styles.mannerText}>
                매너온도 {partnerUser.mannerTemperature ?? 36.5}°C
              </Text>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {isMessagesLoading ? (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>대화 내역을 불러오는 중...</Text>
          </View>
        ) : chatMessages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              💬 아직 주고 받은 대화가 없습니다.{"\n"}첫 메시지를 보내보세요!
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        <View style={styles.inputContainer}>
          <TextInput
            value={chatInput}
            onChangeText={setChatInput}
            placeholder="메시지를 입력하세요"
            placeholderTextColor="#A8A29E"
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSendMessage}
            disabled={!chatInput.trim()}
            style={[
              styles.sendButton,
              chatInput.trim()
                ? styles.sendButtonActive
                : styles.sendButtonDisabled,
            ]}
          >
            <Feather name="send" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

///////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F4",
  },
  keyboardView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 8,
  },
  loadingText: {
    fontSize: 15,
    color: "#A8A29E",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#A8A29E",
    textAlign: "center",
    lineHeight: 22,
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E7E5E4",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F5F5F4",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  partnerAvatarHeader: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F5F5F4",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FB923C",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  partnerNickname: {
    fontSize: 15,
    fontWeight: "700",
    color: "#292524",
  },
  mannerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F97316",
  },
  messageListContent: {
    padding: 16,
    gap: 16,
  },
  messageRow: {
    flexDirection: "row",
    gap: 8,
    maxWidth: "85%",
  },
  messageRowMe: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  messageRowPartner: {
    alignSelf: "flex-start",
  },
  partnerAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#E7E5E4",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D6D3D1",
  },
  messageContent: {
    flexShrink: 1,
  },
  alignStart: {
    alignItems: "flex-start",
  },
  alignEnd: {
    alignItems: "flex-end",
  },
  partnerNameText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#A8A29E",
    marginBottom: 4,
    paddingLeft: 4,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    elevation: 1,
  },
  bubbleMe: {
    backgroundColor: "#FF7A59",
    borderTopRightRadius: 2,
  },
  bubblePartner: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7E5E4",
    borderTopLeftRadius: 2,
  },
  bubbleTextMe: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 20,
  },
  bubbleTextPartner: {
    fontSize: 14,
    fontWeight: "600",
    color: "#292524",
    lineHeight: 20,
  },
  inputContainer: {
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E7E5E4",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F4",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: "600",
    color: "#292524",
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: "#FF7A59",
  },
  sendButtonDisabled: {
    backgroundColor: "#E7E5E4",
  },
});
