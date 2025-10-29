// 사이드바에 표시되는 menuItems를 관리하기 위한 파일
import { create } from 'zustand';

const stored = localStorage.getItem("menuitems");

const useMenuStore = create((set) => ({
  menuItems: stored? JSON.parse(stored) : [],
  setMenuItems: (items) => {
    localStorage.setItem("menuitems", JSON.stringify(items));
    set({ menuItems: items });
  },
}));

export default useMenuStore;