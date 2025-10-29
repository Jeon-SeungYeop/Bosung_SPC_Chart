import { jwtDecode } from 'jwt-decode';

export const getTokenRemainingTime = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000); // 초 단위
    let exp = decoded.exp;
    // exp가 밀리초면 초로 바꿔줌
    if (exp > 1e12) exp = Math.floor(exp / 1000);
    const remaining = exp - currentTime;
    return remaining > 0 ? remaining : 0;
  } catch (e) {
    return 0;
  }
};