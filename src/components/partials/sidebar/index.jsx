import React, { useRef, useEffect, useState } from "react";
import SidebarLogo from "./Logo";
import Navmenu from "./Navmenu";
import { menuItems } from "@/context/_data";
import useMenuStore from "@/services/store/useMenuStore";
import SimpleBar from "simplebar-react";
import useSidebar from "@/services/hooks/useSidebar";
import useSemiDark from "@/services/hooks/useSemiDark";
import useSkin from "@/services/hooks/useSkin";
import svgRabitImage from "@/components/assets/images/svg/rabit.svg";

const Sidebar = () => {
  const scrollableNodeRef = useRef(null);
  const [scroll, setScroll] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [collapsed, setMenuCollapsed] = useSidebar();
  const [menuHover, setMenuHover] = useState(false);
  const [isSemiDark] = useSemiDark();
  const [skin] = useSkin();

  // 메뉴 목록
  const menuItems = useMenuStore((state) => state.menuItems);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollableNodeRef.current && scrollableNodeRef.current.scrollTop > 0) {
        setScroll(true);
      } else {
        setScroll(false);
      }
    };

    if (scrollableNodeRef.current) {
      scrollableNodeRef.current.addEventListener("scroll", handleScroll);
    }

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(isCurrentlyFullscreen);
      setMenuCollapsed(isCurrentlyFullscreen); // 풀스크린이면 collapsed true, 아니면 false
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      if (scrollableNodeRef.current) {
        scrollableNodeRef.current.removeEventListener("scroll", handleScroll);
      }
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [scrollableNodeRef, setMenuCollapsed]); // setMenuCollapsed를 의존성 배열에 추가

  if (isFullscreen) {
    return null;
  }

  return (
    <div className={isSemiDark ? "dark" : ""}>
      <div
        className={`sidebar-wrapper bg-white dark:bg-slate-800     ${
          collapsed ? "w-[72px] close_sidebar" : "w-[248px]"
        }
      ${menuHover ? "sidebar-hovered" : ""}
      ${
        skin === "bordered"
          ? "border-r border-slate-200 dark:border-slate-700"
          : "shadow-base"
      }
      `}
        onMouseEnter={() => {
          setMenuHover(true);
        }}
        onMouseLeave={() => {
          setMenuHover(false);
        }}
      >
        <SidebarLogo menuHover={menuHover} />
        <div
          className={`h-[60px]   absolute top-[80px] nav-shadow z-[1] w-full transition-all duration-200 pointer-events-none ${
            scroll ? " opacity-100" : " opacity-0"
          }`}
        ></div>

        <SimpleBar
          className="sidebar-menu px-4 h-[calc(100%-80px)]"
          scrollableNodeProps={{ ref: scrollableNodeRef }}
        >
          {/* 매뉴 리스트  */}
          <Navmenu menus={menuItems} />
        </SimpleBar>
      </div>
    </div>
  );
};

export default Sidebar;