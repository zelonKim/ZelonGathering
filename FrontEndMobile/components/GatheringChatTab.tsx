import { GatheringChatTabProps } from "@/types/GatheringChatTabProps";
import { PublicChatMessage } from "@/types/PublicChatMessage";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
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

export function GatheringChatTab({
  chatMessages,
  myId,
  chatInput,
  setChatInput,
  handleSendMessage,
  isChatMessageSendPending,
}: GatheringChatTabProps) {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  const renderChatItem = ({ item: msg }: { item: PublicChatMessage }) => {
    const isMe = msg.senderId === myId;

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowOther,
        ]}
      >
        {!isMe && (
          <View style={styles.avatar}>
            {msg.sender?.profileImg ? (
              <Image
                source={{ uri: msg.sender.profileImg }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={{ fontSize: 14 }}>🏃</Text>
            )}
          </View>
        )}

        <View
          style={[
            styles.messageContentWrapper,
            isMe ? styles.alignEnd : styles.alignStart,
          ]}
        >
          {!isMe && (
            <Text style={styles.senderNickname}>
              {msg.sender?.nickname || "멤버"}
            </Text>
          )}
          <View
            style={[
              styles.messageBubble,
              isMe ? styles.bubbleMe : styles.bubbleOther,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isMe ? styles.textMe : styles.textOther,
              ]}
            >
              {msg.message}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const isSendDisabled = !chatInput.trim() || isChatMessageSendPending;

  ///////////////////////////////////////////////////////////////////////////////////

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.chatListContainer}>
        {chatMessages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {
                "실시간 채팅방이 개설되었습니다!\n모임원들과 첫 대화를 나눠보세요 💬"
              }
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderChatItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          value={chatInput}
          onChangeText={setChatInput}
          placeholder="메시지를 입력해주세요"
          placeholderTextColor="#A8A29E"
          style={styles.textInput}
          returnKeyType="send"
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSendMessage}
          disabled={isSendDisabled}
          style={[
            styles.sendButton,
            isSendDisabled
              ? styles.sendButtonDisabled
              : styles.sendButtonActive,
          ]}
        >
          <Feather name="send" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

/////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7ED",
  },
  chatListContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A8A29E",
    textAlign: "center",
    lineHeight: 22,
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
  messageRowOther: {
    alignSelf: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#E7E5E4",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  messageContentWrapper: {
    flexDirection: "column",
  },
  alignStart: {
    alignItems: "flex-start",
  },
  alignEnd: {
    alignItems: "flex-end",
  },
  senderNickname: {
    fontSize: 10,
    fontWeight: "700",
    color: "#A8A29E",
    marginBottom: 4,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  bubbleMe: {
    backgroundColor: "#FF7A59",
    borderTopRightRadius: 0,
  },
  bubbleOther: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E5E4",
    borderWidth: 1,
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  textMe: {
    color: "#FFFFFF",
  },
  textOther: {
    color: "#292524",
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E7E5E4",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textInput: {
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
