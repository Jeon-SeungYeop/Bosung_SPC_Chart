import axios from "axios";

export const getAccessToken = async (apiUrl) => {
  try {
    const requestData = {
      userid: localStorage.getItem("userid"),
      plantcode: localStorage.getItem("plantcode"),
    };

    const url = `${apiUrl}sys/access-token-refresh`;
    const response = await axios.post(url, requestData, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // 쿠키로 refresh token 보낼 경우 필요
    });


    const { jhedher, jbody } = response.data;
    const newToken = jhedher.token;
    if (newToken) {
      localStorage.setItem("token", newToken);
      return newToken;
    } else {
      throw new Error("토큰 없음");
    }
  } catch (error) {
    console.error("토큰 재발급 실패:", error);
    return null;
  }
};