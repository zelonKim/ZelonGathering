import { useState, useEffect } from "react";

const detailTexts = {
  ko: {
    loadingText: "소모임방에 입장하는 중입니다 🍑",
    errorTitle: "존재하지 않거나 이미 폐쇄된 소모임방입니다.",
    backButton: "대시보드로 돌아가기",
    tabInfo: "소모임 정보",
    tabChat: "소모임 채팅방",
    chatAlertTitle: "입장 불가",
    chatAlertDesc:
      "정회원 소모임으로 채팅방에 입장할 수 없습니다.\n* 소모임에 참석한 멤버만 채팅방에 입장할 수 있습니다.",
    chatWelcome:
      "실시간 채팅방이 개설되었습니다!\n 모임원들과 첫 대화를\n나눠보세요 💬",
    chatPlaceholder: "메시지를 입력해주세요",
    memberBadge: "멤버",
    hostBadge: "내가 만든 모임",
    kickedBadge: "참여 불가",
    joinedBadge: "참여 완료",
    joinButton: "참여하기 🚀",
    recruitmentStatus: "모집 현황",
    peopleUnit: "명",
    aboutTitle: "모임 소개",
    noDescription: "등록된 소개글이 없습니다.",
    activeMembersTitle: "참여 중인 멤버",
    defaultParticipantName: "참여자",
    hostLeaderBadge: "👑 방장",
    mannerTemperature: "매너 온도",
    viewProfile: "프로필 보기",
    sendDm: "DM 보내기",
    categories: {
      ALL: "전체",
      STUDY: "스터디",
      SPORTS: "스포츠",
      ART: "아트",
      FOOD: "푸드",
      BOOK: "독서",
      GAME: "게임",
      TALK: "토크",
      TOUR: "투어",
    },
    confirmJoin: "정말로 이 소모임에 참여하시겠습니까?",
    confirmDelete:
      "정말로 이 소모임을 삭제하시겠습니까?\n\n⚠️ 삭제 후 복구는 불가능합니다.",
    confirmLeave: "정말로 소모임 참여를 취소하고 나가시겠습니까?",
    confirmKick: (nickname: string) =>
      `정말로 '${nickname}' 멤버를 강퇴 하시겠습니까?`,
  },
  en: {
    loadingText: "Entering the gathering room 🍑",
    errorTitle: "This gathering does not exist or has been closed.",
    backButton: "Back to Dashboard",
    tabInfo: "Gathering Info",
    tabChat: "Gathering Chat",
    chatAlertTitle: "Access Denied",
    chatAlertDesc:
      "You cannot enter the chat room unless you are an official member.\n* Only participating members can enter.",
    chatWelcome:
      "The live chat room is open!\nStart your first conversation\nwith members 💬",
    chatPlaceholder: "Type a message...",
    memberBadge: "Member",
    hostBadge: "Hosted by Me",
    kickedBadge: "Unavailable",
    joinedBadge: "Joined",
    joinButton: "Join Gathering 🚀",
    recruitmentStatus: "Recruitment",
    peopleUnit: "",
    aboutTitle: "About Gathering",
    noDescription: "No description provided.",
    activeMembersTitle: "Members",
    defaultParticipantName: "Participant",
    hostLeaderBadge: "👑 Host",
    mannerTemperature: "Manner Temp",
    viewProfile: "View Profile",
    sendDm: "Send DM",
    categories: {
      ALL: "All",
      STUDY: "Study",
      SPORTS: "Sports",
      ART: "Art",
      FOOD: "Food",
      BOOK: "Reading",
      GAME: "Gaming",
      TALK: "Talk",
      TOUR: "Tour",
    },
    confirmJoin: "Are you sure you want to join this gathering?",
    confirmDelete:
      "Are you sure you want to delete this gathering?\n\n⚠️ Deletion cannot be undone.",
    confirmLeave: "Are you sure you want to leave this gathering?",
    confirmKick: (nickname: string) =>
      `Are you sure you want to kick '${nickname}'?`,
  },
};

export function useGatheringDetailLanguage() {
  const [locale, setLocale] = useState<"ko" | "en">("ko");

  useEffect(() => {
    const browserLang = navigator.language || navigator.languages[0];
    if (browserLang.toLowerCase().startsWith("ko")) {
      setLocale("ko");
    } else {
      setLocale("en");
    }
  }, []);

  return { t: detailTexts[locale], locale };
}
