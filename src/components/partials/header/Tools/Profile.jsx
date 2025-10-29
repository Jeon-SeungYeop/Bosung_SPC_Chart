import React from "react";
import { useState, useEffect } from "react";
import Dropdown from "@/components/ui/Dropdown";
import Icon from "@/components/ui/Icon";
import { Menu, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// import { logOut } from "@/services/store/api/auth/authSlice";
import { logoutThunk } from "@/pages/auth/logout-thunk"
import { CommonFunction } from "@/components/autocomponent";
import { useApiUrl } from "@/context/APIContext"; //
import useUserStore from "@/services/store/userStore";

import UserAvatar from "@/components/assets/images/all-img/user.png";


const profileLabel = () => {
  
  const apiUrl = useApiUrl(); // URL
  // 프로필 아이콘 조회용
  const { setProfileIcon } = useUserStore.getState();
  const { profileIcon } = useUserStore();

  const plantcode = JSON.parse(localStorage.getItem("plantcode"));
  const userid = JSON.parse(localStorage.getItem("userid"));
  
  if (plantcode && userid) {
    useEffect(() => {
      // 프로필 이미지 조회
      const imgSearch = async () => {
        try {
          await CommonFunction.fetchAndSetImgSrc({
            apiUrl,
            searchinfo: {
              params: {
                plantcode: plantcode,
                getimagetype: "USERIMAGE",
                code: userid,
                seq: 1
              },
              address: "filemanage/getimage_r",
            },
            setImgSrc: setProfileIcon
          });
        } catch (e) {
          console.error('프로필 이미지 불러오기 실패', e);
        }
      };

      imgSearch();
    }, [plantcode, userid]);
  }
  
  return (
    <div className="flex items-center">
      <div className="flex-1 ltr:mr-[10px] rtl:ml-[10px]">
        <div className="lg:h-8 lg:w-8 h-7 w-7 rounded-full">
          <img
            src={profileIcon? profileIcon : ""}
            alt=""
            className="block w-full h-full object-cover rounded-full"
          />
        </div>
      </div>
      <div className="flex-none text-slate-600 dark:text-white text-sm font-normal items-center lg:flex hidden overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="overflow-hidden text-ellipsis whitespace-nowrap w-[85px] block">
          {JSON.parse(localStorage.getItem("username") || '"Guest"')}
        </span>
        <span className="text-base inline-block ltr:ml-[10px] rtl:mr-[10px]">
          <Icon icon="heroicons-outline:chevron-down"></Icon>
        </span>
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiUrl = useApiUrl();

  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.removeItem("user");
    dispatch(logoutThunk(apiUrl));
  };

  const ProfileMenu = [
    // {
    //   label: "Profile",
    //   icon: "heroicons-outline:user",

    //   action: () => {
    //     navigate("/profile");
    //   },
    // },
    // {
    //   label: "Chat",
    //   icon: "heroicons-outline:chat",
    //   action: () => {
    //     navigate("/chat");
    //   },
    // },
    // {
    //   label: "Email",
    //   icon: "heroicons-outline:mail",
    //   action: () => {
    //     navigate("/email");
    //   },
    // },
    // {
    //   label: "Todo",
    //   icon: "heroicons-outline:clipboard-check",
    //   action: () => {
    //     navigate("/todo");
    //   },
    // },
    // {
    //   label: "Settings",
    //   icon: "heroicons-outline:cog",
    //   action: () => {
    //     navigate("/settings");
    //   },
    // },
    // {
    //   label: "Price",
    //   icon: "heroicons-outline:credit-card",
    //   action: () => {
    //     navigate("/pricing");
    //   },
    // },
    // {
    //   label: "Faq",
    //   icon: "heroicons-outline:information-circle",
    //   action: () => {
    //     navigate("/faq");
    //   },
    // },
    {
      label: "Logout",
      icon: "heroicons-outline:login",
      action: () => {
        dispatch(handleLogout);
      },
    },
  ];

  return (
    <Dropdown label={profileLabel()} classMenuItems="w-[180px] top-[58px]">
      {ProfileMenu.map((item, index) => (
        <Menu.Item key={index}>
          {({ active }) => (
            <div
              onClick={() => item.action()}
              className={`${
                active
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-600 dark:text-slate-300 dark:bg-opacity-50"
                  : "text-slate-600 dark:text-slate-300"
              } block     ${
                item.hasDivider
                  ? "border-t border-slate-100 dark:border-slate-700"
                  : ""
              }`}
            >
              <div className={`block cursor-pointer px-4 py-2`}>
                <div className="flex items-center">
                  <span className="block text-xl ltr:mr-3 rtl:ml-3">
                    <Icon icon={item.icon} />
                  </span>
                  <span className="block text-sm">{item.label}</span>
                </div>
              </div>
            </div>
          )}
        </Menu.Item>
      ))}
    </Dropdown>
  );
};

export default Profile;
