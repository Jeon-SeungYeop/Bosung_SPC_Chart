import { logOut } from "@/services/store/api/auth/authSlice";
import axios from "axios";

export const logoutThunk = (apiUrl) => async (dispatch) => {
    const url = `${apiUrl}sys/logout`;

    const requestData = {
        userid: JSON.parse(localStorage.getItem("userid")),
        plantcode: JSON.parse(localStorage.getItem("plantcode")),
        token: localStorage.getItem("token")
    };

    try {
        await axios.post(url, requestData, {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true, // 쿠키로 refresh token 보낼 경우 필요
        });
    } catch (e) {
        console.warn("서버 로그아웃 실패:", e);
    }

    dispatch(logOut()); // 상태 정리
};
