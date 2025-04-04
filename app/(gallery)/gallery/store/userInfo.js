import { create } from 'zustand';

const useUserInfoStore = create((set) => ({
  userInfo: {},
  
  setUserInfo: (info) => set({ userInfo: info })
}));

export default useUserInfoStore;
