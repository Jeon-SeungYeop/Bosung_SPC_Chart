// 프로필 아이콘 관련 store
import { create } from 'zustand';

const useUserStore = create((set) => ({
  currentUserId: localStorage.getItem("userid"),
  profileIcon: '',
  setProfileIcon: (icon) => set({ profileIcon: icon }),
  setCurrentUserId: (id) => set({ currentUserId: id }),
}));

export default useUserStore;