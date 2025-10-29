import React, { createContext, useContext } from "react";

// API URL 값을 저장하는 Context
const ApiUrlContext = createContext();

// Context Provider
export const ApiUrlProvider = ({ children }) => {
  //const apiUrl = "http://211.117.200.179:8800/"; // 임시 서버  
  const apiUrl = "http://localhost:8800/"; // API 고정 주소 설정  
  //const apiUrl = "http://192.168.219.134:8800/"; // 임시 Backend  
  //const apiUrl = "http://1.214.50.3:8800/"; // 사내 server  aaaaaa
  //const apiUrl = "http://192.168.219.80:8800/"; // 임시 Backend  



  return (
    <ApiUrlContext.Provider value={apiUrl}>
      {children}
    </ApiUrlContext.Provider>
  );
};

// Context를 사용하는 커스텀 Hookxport 
export const useApiUrl = () => {
  return useContext(ApiUrlContext);
}; 