import { create } from 'zustand';

// Zustand를 사용한 북마크 스토어 생성
const useBookmarkStore = create((set) => ({
  // 북마크 목록 저장
  bookmarks: [],
  
  // 북마크 설정 기능
  setBookmarks: (bookmarks) => set({ bookmarks }),
}));

export default useBookmarkStore;