import React, { useEffect } from "react";
import { Send } from "lucide-react";
import { PublicChatMessage } from "@/types/PublicChatMessage";
import { GatheringChatTabProps } from "@/types/GatheringChatTabProps";

export function GatheringChatTab({
  chatMessages,
  myId,
  chatInput,
  setChatInput,
  handleSendMessage,
  isChatMessageSendPending,
  chatEndRef,
}: GatheringChatTabProps) {
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatEndRef]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-[60vh] bg-orange-50">
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[calc(100vh-12rem)]">
        {chatMessages.length === 0 ? (
          <div className="text-center py-48 text-sm font-semibold text-stone-400 whitespace-pre-line leading-relaxed">
            실시간 채팅방이 개설되었습니다! {"\n"} 모임원들과 첫 대화를
            나눠보세요 💬
          </div>
        ) : (
          [...chatMessages].reverse().map((msg: PublicChatMessage) => {
            const isMe = msg.senderId === myId;
            return (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[85%] ${
                  isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-lg bg-stone-200 shrink-0 overflow-hidden flex items-center justify-center text-sm">
                    {msg.sender?.profileImg ? (
                      <img
                        src={msg.sender.profileImg}
                        alt="Sender"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      "🏃"
                    )}
                  </div>
                )}
                <div
                  className={`flex flex-col ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  {!isMe && (
                    <span className="text-[10px] font-bold text-stone-400 mb-1">
                      {msg.sender?.nickname || "멤버"}
                    </span>
                  )}
                  <div
                    className={`p-3 rounded-2xl text-sm font-semibold leading-relaxed ${
                      isMe
                        ? "bg-[#FF7A59] text-white rounded-tr-none"
                        : "bg-white text-[#292524] border border-[#E7E5E4] rounded-tl-none"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-5 bg-white border-t border-[#E7E5E4] flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력해주세요"
          className="flex-1 bg-[#F5F5F4] px-4 py-2.5 rounded-full text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF7A59]"
        />
        <button
          type="submit"
          disabled={!chatInput.trim() || isChatMessageSendPending}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition shrink-0 ${
            chatInput.trim()
              ? "bg-[#FF7A59] hover:bg-[#e06848]"
              : "bg-stone-200 cursor-not-allowed"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
