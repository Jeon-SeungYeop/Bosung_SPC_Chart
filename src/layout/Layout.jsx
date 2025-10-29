import React, { useEffect, useState, useRef, useMemo, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Box, Tab, Tabs, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Header from '@/components/partials/header';
import Sidebar from '@/components/partials/sidebar';
import Footer from '@/components/partials/footer';
import MobileMenu from '@/components/partials/sidebar/MobileMenu';
import MobileFooter from '@/components/partials/footer/MobileFooter';
import Breadcrumb from '@/components/autocomponent/common/Breadcrumb';
import Loading from '@/components/Loading';
import useWidth from '@/services/hooks/useWidth';
import useSidebar from '@/services/hooks/useSidebar';
import useContentWidth from '@/services/hooks/useContentWidth';
import useMenulayout from '@/services/hooks/useMenulayout';
import useMenuHidden from '@/services/hooks/useMenuHidden';
import useMobileMenu from '@/services/hooks/useMobileMenu';
import useDarkMode from "@/services/hooks/useDarkMode";
import Icon from "@/components/ui/Icon";
import useMenuStore from '@/services/store/useMenuStore';   // 메뉴 목록
import { availablePaths } from "@/context/_data";

// 메인화면 기본 OPEN 화면 
//import Dashboard from '@/pages/DashBoard/Dashboard2';  
import IntegratedDashboard from '@/pages/DashBoard/IntegratedDashboard';

// 탭 콘텐츠를 메모이제이션하는 컴포넌트
const TabContent = React.memo(({ Component, isActive, tabKey }) => {
  const [hasBeenActive, setHasBeenActive] = useState(isActive);
  
  useEffect(() => {
    if (isActive && !hasBeenActive) {
      setHasBeenActive(true);
    }
  }, [isActive, hasBeenActive]);

  // 차트 리사이즈를 위한 이벤트 트리거
  useEffect(() => {
    if (isActive && hasBeenActive) {
      // 탭이 활성화될 때 차트 리사이즈 이벤트 발생
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
  }, [isActive, hasBeenActive]);

  return (
    <div 
      style={{ 
        display: isActive ? 'block' : 'none',
        width: '100%',
        height: '100%'
      }}
    >
      {/* 한 번이라도 활성화된 탭만 렌더링 (차트 초기화 문제 해결) */}
      {hasBeenActive && <Component key={tabKey} />}
    </div>
  );
});

const Layout = () => {
  const { width, breakpoints } = useWidth();
  const [collapsed] = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuth, user } = useSelector((state) => state.auth || { isAuth: true, user: {} });
  const token = localStorage.getItem("token");
  const [contentWidth] = useContentWidth();
  const [menuType] = useMenulayout();
  const [menuHidden] = useMenuHidden();
  const [mobileMenu, setMobileMenu] = useMobileMenu();
  const nodeRef = useRef(null);
  const [isDark] = useDarkMode();

  // 탭 화면 구성을 위한 매뉴 리스트 import 
  // 2025-06-01 
  // import 구문 과 함께 
  // src -> component -> autoconponent -> common -> _data.js 로 이동함 . 
  // App.jsx에 정의된 유효한 경로 목록 및 컴포넌트 매핑 
  // import Dashboard from '@/pages/DashBoard/Dashboard2'; 
  // import CommonCodeGroup from '@/pages/common-info/CommonCodeGroup';
  // import CommonCodeGroupPerDesc from '@/pages/common-info/CommonCodeGroupPerDesc';
  // import EquipmentMaster from '@/pages/common-info/EquipmentMaster';

  // const availablePaths = [
  //   { label: '종합현황', path: '/dashboard2', component: Dashboard }, 
  //   { label: '공통코드 그룹 등록', path: '/CommonCodeGroup', component: CommonCodeGroup },
  //   { label: '공통코드 그룹 별 상세등록', path: '/CommonCodeGroupPerDesc', component: CommonCodeGroupPerDesc },
  //    .......................

  // 탭 상태 관리
  const [tabs, setTabs] = useState([{ 
    label: '종합현황', 
    path: '/IntegratedDashboard', 
    component: IntegratedDashboard,
    key: `IntegratedDashboard-${Date.now()}` // 고유 키 추가
  }]);
  const [value, setValue] = useState(0);
  const [isTabChanging, setIsTabChanging] = useState(false);

  // URL 경로에 따라 활성 탭 동기화 및 탭 추가
  useEffect(() => {
    const currentPath = location.pathname;
    const matchedPath = availablePaths.find((p) => p.path === currentPath);

    if (matchedPath) {
      // 현재 경로가 availablePaths에 있는 경우
      const currentTabIndex = tabs.findIndex((tab) => tab.path === currentPath);
      if (currentTabIndex === -1) {
        // 탭이 없으면 새 탭 추가
        const newTab = {
          ...matchedPath,
          key: `${matchedPath.path.replace('/', '')}-${Date.now()}` // 고유 키 추가
        };
        const newTabs = [...tabs, newTab];
        setTabs(newTabs);
        setValue(newTabs.length - 1); // 새 탭을 활성 탭으로 설정
      } else {
        // 이미 탭이 있으면 해당 탭을 활성 탭으로 설정
        setValue(currentTabIndex);
      }

    // 클릭한 매뉴의 프로그램 명을 storage 에 저장  
    localStorage.setItem("menupath",    currentPath); 

    } else {
      // 유효하지 않은 경로면 첫 번째 탭(/dashboard2)으로 리다이렉트
      setValue(0);
      navigate(tabs[0].path);
    }
  }, [location.pathname, tabs, availablePaths]);

  // 새로고침 및 페이지 진입 시 인증 확인 
  const { setMenuItems } = useMenuStore();
  useEffect(() => {
    if (!isAuth || !user || !token || token === "null") {
      navigate('/login');
      localStorage.clear();
    }
    else {
      const storedMenus = JSON.parse(localStorage.getItem("menuitems"));
      if ( storedMenus && storedMenus.length > 0 ) {
        setMenuItems(storedMenus);
      }
    }
  }, [isAuth, navigate, user, token]);


  // 탭 선택 핸들러 (차트 리렌더링 최적화)
  const handleChange = (event, newValue) => {
    setIsTabChanging(true);
    setValue(newValue);
    navigate(tabs[newValue].path); // 탭 클릭 시 해당 경로로 이동
    
    // 탭 변경 완료 후 차트 리사이즈 트리거
    setTimeout(() => {
      setIsTabChanging(false);
      window.dispatchEvent(new Event('resize'));
    }, 150);
  };

  // 탭 삭제
  const removeTab = (indexToRemove) => {
    const newTabs = tabs.filter((_, i) => i !== indexToRemove);
    setTabs(newTabs);
    if (value === indexToRemove) {
      const newIndex = Math.max(0, indexToRemove - 1);
      setValue(newIndex);
      navigate(newTabs.length > 0 ? newTabs[newIndex].path : '/IntegratedDashboard');
    } else if (value > indexToRemove) {
      setValue(value - 1);
    }
  };

  // 전체 삭제 핸들러
  const handleCloseAllTabs = () => {
    const defaultTab = { 
      label: '종합현황', 
      path: '/IntegratedDashboard', 
      component: IntegratedDashboard,
      key: `IntegratedDashboard-${Date.now()}`
    };
    setTabs([defaultTab]); // 기본 탭으로 초기화
    setValue(0);
    navigate('/IntegratedDashboard'); // 기본 경로로 이동
  };

  // 헤더 클래스 스위칭
  const switchHeaderClass = () => {
    if (Boolean(document.fullscreenElement)) {
      return 'ltr:ml-0 rtl:mr-0';
    } else if (menuType === 'horizontal' || menuHidden) {
      return 'ltr:ml-0 rtl:mr-0';
    } else if (collapsed) {
      return 'ltr:ml-[72px] rtl:mr-[72px]';
    } else {
      return 'ltr:ml-[248px] rtl:mr-[248px]';
    }
  };

  // 탭 콘텐츠를 메모이제이션
  const memoizedTabs = useMemo(() => {
    return tabs.map((tab, index) => ({
      ...tab,
      content: (
        <TabContent
          key={tab.key}
          Component={tab.component}
          isActive={value === index}
          tabKey={tab.key}
        />
      ),
    }));
  }, [tabs, value]);

  return (
    <>
      <ToastContainer />
      <Header className={width > breakpoints.xl ? switchHeaderClass() : ''} />
      {menuType === 'vertical' && width > breakpoints.xl && !menuHidden && (
        <Sidebar />
      )}
      <MobileMenu
        className={`${
          width < breakpoints.xl && mobileMenu
            ? 'left-0 visible opacity-100 z-[9999]'
            : 'left-[-300px] invisible opacity-0 z-[-999]'
        }`}
      />
      {/* mobile menu overlay */}
      {width < breakpoints.xl && mobileMenu && (
        <div
          className="overlay bg-slate-900/50 backdrop-filter backdrop-blur-sm opacity-100 fixed inset-0 z-[999]"
          onClick={() => setMobileMenu(false)}
        ></div>
      )}
      <div className={`content-wrapper transition-all duration-150 ${width > 1280 ? switchHeaderClass() : ''}`}>
        <div className="page-content page-min-height pt-[5px]">
          <div className={contentWidth === 'boxed' ? 'container mx-auto' : 'container-fluid'}>
            {/* 탭 헤더 부분 */}
            <Box sx={{ width: '100%', }}>
              <Box sx={{ borderBottom: 1, borderColor: isDark ? "#a7aabd" : "#d4d7db",}} className="flex items-center mb-3 place-content-between">
                <Tabs
                  value={value}
                  onChange={handleChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    minHeight: '32px',
                    height: '32px',
                    '& .MuiTabs-indicator': { 
                      backgroundColor: isDark ? '#f1fbff' : '#009ef7',
                      height: '2px',
                      bottom: 0,
                    },
                    '& .MuiTab-root': {
                      minHeight: '32px',
                      height: '32px',
                      paddingTop: '4px',
                      paddingBottom: '4px',
                      fontSize: '13px',
                    },
                    '& .MuiTab-root.Mui-selected': { 
                      color: isDark ? '#f1f1e6' : '#009ef7',
                    },
                  }}
                >
                  {tabs.map((tab, index) => (
                    <Tab
                      key={tab.key}
                      label={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}
                        >
                          <span
                            style={{
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              width: 'calc(100% - 14px)',
                            }}
                          >
                            {tab.label}
                          </span>
                          <IconButton
                            component="span"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTab(index);
                            }}
                            sx={{
                              p: 0.2,
                              color: isDark ? '#f3f9ff' : '#181d26',
                            }}
                          >
                            <CloseIcon 
                              sx={{ 
                                fontSize: '14px', 
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': {
                                  transform: 'scale(1.5)',
                                }, }} 
                            />
                          </IconButton>
                        </Box>
                      }
                      sx={{
                        color: isDark ? '#d7e5e4' : '#181d26',
                        marginRight: 0.3,
                        width: '160px',
                        textAlign: 'start',
                        justifyContent: 'center',
                      }}
                    />
                  ))}
                </Tabs>
                  <button
                    type="button"
                    onClick={handleCloseAllTabs} // 전체 닫기 클릭 시 모든 탭 삭제
                    className={`btn btn-dark shadow-base2 font-normal btn-sm group bg-[#F1F5F9] text-[#141412]  dark:bg-[#475569] dark:text-[#DFF6FF] dark:shadow-lg h-[30px] mb-1/2`}>
                    <span className="flex items-center">
                      <span className={`transition-transform duration-300 ease-in-out group-hover:scale-150`}>
                        <Icon icon="heroicons-outline:x-mark" />
                      </span>
                      <span>전체 닫기</span>
                    </span>
                  </button>
              </Box>
            </Box>
            
            <Suspense fallback={<Loading />}>
              {/* 탭 컨텐츠 부분 - 상대적 위치 지정으로 차트 렌더링 문제 해결 */}
              <div style={{ position: 'relative', width: '100%', minHeight: '400px' }}>
                {memoizedTabs.map((tab, index) => (
                  <motion.div
                    key={tab.key} // 각 탭의 고유 키를 key로 사용
                    initial="pageInitial"
                    animate={value === index ? 'pageAnimate' : 'hidden'} // 활성 탭만 표시
                    variants={{
                      pageInitial: { opacity: 0, y: 20 },
                      pageAnimate: { opacity: 1, y: 0 },
                      pageExit: { opacity: 0, y: -20 },
                      hidden: { opacity: 0, position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none' },
                    }}
                    transition={{
                      type: 'tween',
                      ease: 'easeInOut',
                      duration: 0.3,
                      opacity: { duration: 0.2 },
                      y: { duration: 0.3 },
                    }}
                    style={{ 
                      position: value === index ? 'relative' : 'absolute',
                      width: '100%',
                      zIndex: value === index ? 1 : 0
                    }}
                  >
                    {tab.content}
                  </motion.div>
                ))}
              </div>
            </Suspense>
          </div>
        </div>
      </div>
      {width > breakpoints.md && (
        <Footer className={`fixed bottom-0 left-0 right-0 z-[998] ${width > breakpoints.xl ? switchHeaderClass() : ''}`} />
      )}
      <div id="overlay-root" className="fixed inset-0 z-[99999] pointer-events-none" />
    </>
  );
};

export default Layout;