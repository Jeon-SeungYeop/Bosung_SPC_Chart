import React, { createContext, useContext } from "react";

// API URL 값을 저장하는 Context
const ApiUrlContext = createContext();

// Context Provider
export const ApiUrlProvider = ({ children }) => {
  const apiUrl = "http://localhost:8800/"; // API 고정 주소 설정  



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