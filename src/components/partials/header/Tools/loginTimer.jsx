import React, { useEffect, useState, useRef } from 'react';
import { getTokenRemainingTime } from '../utils/tokenUtils';
import { useNavigate } from 'react-router-dom';
import Button from "@/components/ui/Button";
import { getAccessToken } from "../utils/token-refresh"
import { useApiUrl } from "@/context/APIContext";
import { toast } from "react-toastify";
import Icon from "@/components/ui/Icon"
import { useDispatch } from "react-redux";
// import { logOut } from "@/services/store/api/auth/authSlice";
import { logoutThunk } from "@/pages/auth/logout-thunk";

const LoginTimer = () => {
  const apiUrl = useApiUrl(); // URL
  const dispatch = useDispatch();
  const alerted = useRef(false); // 1회만 팝업 띄우기 위한 플래그

  const [remainingTime, setRemainingTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      const time = getTokenRemainingTime(token);
      setRemainingTime(time);

      // 남은 시간이 60초 이하이고, 아직 알림을 띄운 적이 없다면
      if (time <= 300 && !alerted.current) {
        toast.warn("5분 후 로그인이 만료됩니다. 로그인 연장을 해주세요.", {
          position: "top-center",
        });
        alerted.current = true; // 다시 안 뜨게 막기
      }

      // 시간이 만료되면 로그인화면으로 이동
      if (time <= 0) {
        // navigate('/login');
        // localStorage.clear();
        dispatch(logoutThunk(apiUrl));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleExtendLogin = async () => {
    const newToken = await getAccessToken(apiUrl);
    if (newToken) {
      // 토큰이 갱신되었을 경우 플래그 초기화
      alerted.current = false;
    }
    else {
      toast.error("사용자 인증에 실패하였습니다. 다시 로그인 해주세요.", {
        position: "top-center",
        autoClose: 5000,    // 5초 후 자동 닫힘
      });

      // 5초 후 로그아웃
      setTimeout(() => {
        dispatch(logoutThunk(apiUrl));
      }, 5000);
    }
  };
  
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return (
    <div className="flex items-center gap-2 p-3 max-w-sm border rounded-lg bg-slate-100 dark:bg-slate-700 border-none">
      <Icon icon="heroicons-outline:clock"/>
      <span style={{ fontSize: '16px' }}>
        남은 시간:{" "}
        {minutes > 0 // 모니터링 / 관리자 / 시스템 사용자 의 경우 로그인 시간을 1달로 만들어 무한대 처럼 보이게 함. 
          ? `${minutes > 60 ? "∞" : minutes}분`
          : `${minutes}분 ${seconds}초`}
      </span>
      <Button
        type="button"
        text="로그인 연장"
        className="btn btn-primary btn-sm ml-auto dark:!bg-slate-600 dark:!text-white"
        onClick={handleExtendLogin}
      />
    </div>
  );
};

export default LoginTimer;
