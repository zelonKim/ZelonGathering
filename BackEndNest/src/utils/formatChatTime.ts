export const formatChatTime = (date: Date) => {
    const now = new Date();
    const chatDate = new Date(date);

    if (now.toDateString() === chatDate.toDateString()) {
      return chatDate.toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    const diffTime = now.getTime() - chatDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return '어제';

    return `${chatDate.getMonth() + 1}월 ${chatDate.getDate()}일`;
  }