import React, { useState, useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { menuItems } from "@/context/_data";
import Icon from "@/components/ui/Icon";

// 로그인 시 매뉴 리스트를 구성함. 
const Breadcrumb = () => {
  const location = useLocation();
  const locationName = location.pathname.replace("/", "");

  const [isHide, setIsHide] = useState(null);
  const [groupTitle, setGroupTitle] = useState("");

  useEffect(() => { 
    // data.jsx 의  menuItems 를 호출하여 매뉴 리스트 작성 
    // 1. 데이터베이스 에서 사용자 관련 menuItems 의 Jason 을 전달받아 구성. 
    console.log("매뉴 구성시작 ", menuItems);
    const currentMenuItem = menuItems.find(
      (item) => item.link === locationName
    );

    const currentChild = menuItems.find((item) =>
      item.child?.find((child) => child.childlink === locationName)
    );

    if (currentMenuItem) {
      setIsHide(currentMenuItem.isHide);
    } else if (currentChild) {
      setIsHide(currentChild?.isHide || false);
      setGroupTitle(currentChild?.title);
    }
  }, [location, locationName]);

  return (
    <>
      {!isHide ? (
        <div className="md:mb-6 mb-4 flex space-x-3 rtl:space-x-reverse">
          <ul className="breadcrumbs">
            <li className="text-primary-500">
              <NavLink to="/IntegratedDashboard" className="text-lg">
                <Icon icon="heroicons-outline:home" />
              </NavLink>
              <span className="breadcrumbs-icon rtl:transform rtl:rotate-180">
                <Icon icon="heroicons:chevron-right" />
              </span>
            </li>
            {groupTitle && (
              <li className="text-primary-500">
                <button type="button" className="capitalize">
                  {groupTitle}
                </button>
                <span className="breadcrumbs-icon rtl:transform rtl:rotate-180">
                  <Icon icon="heroicons:chevron-right" />
                </span>
              </li>
            )}
            <li className="capitalize text-slate-500 dark:text-slate-400">
              {locationName}
            </li>
          </ul>
        </div>
      ) : null}
    </>
  );
};

export default Breadcrumb;
