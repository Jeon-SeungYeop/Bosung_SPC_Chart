import Icon from "@/components/ui/Icon";
import Auto_Button from "@/components/autocomponent/common/Auto_Button";
import { useApiUrl } from "@/context/APIContext";
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";

function Auto_Button_Search({
  text = "조회",
  type = "button",
  className = "btn-dark shadow-base2 font-normal rounded-[999px] px-6 py-2 transition-colors",
  icon = "heroicons-outline:search",
  iconPosition = "left",
  iconClass = "text-lg",
  setGridData, // 데이터 설정 함수
  searchinfo, // 조회 조건
  excuteSuccesAndSearch, // Grid 에서 재조회 여부 를 전달 받아 재조회를 실행함 (삭제, 수정 후)
  setIsSearchFlag, // 재조회 되었음을 Grid Area 에 전달하여 삭제, 수정 List 삭제
}) {
  const [loading, setLoading] = useState(false); // 로딩 서클 표시
  const apiUrl = useApiUrl(); // API URL 가져오기

  // setExcuteSuccesAndSearch 가 true 여부에 따른 재조회 (추가 , 삭제, 수정 시 )
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return; // 최초 렌더링 시에는 실행 안 함
    } 
      // 여기에 재조회 로직 실행
      onClickSearch(); 
  }, [excuteSuccesAndSearch]);



  const onClickSearch = async () => {
    setLoading(true); // 로딩 서클 표시 시작
    if (!searchinfo.address) {
      console.error("API address is not set."); // API 주소(address)가 설정되지 않았습니다.
      return;
    }

    try {
      const url = `${apiUrl}${searchinfo.address}`;

      const response = await axios.get(url, { params: searchinfo.params });

      if (!response?.data) {
        console.error("No server response data."); // 서버 응답 데이터가 없습니다.
        return;
      }

      const { jhedher, jbody } = response.data;

      // 서버 응답 상태 체크
      if (jhedher?.status !== "S") {
        console.warn("The server returned an error response.", jhedher); // 서버에서 오류 응답을 반환했습니다.
        return;
      }
      setGridData && setGridData(jbody); // 데이터 설정
      setIsSearchFlag(prev => !prev); // 재조회 되었음을 그리드 에 전달. 
    } catch (error) {
      console.error("Data lookup error:", error); // 데이터 조회 오류
    } finally {
      setLoading(false); // 완료 후 표시 종료
    }
  };

  return (
    <>
      <Auto_Button
        type={type}
        onClick={onClickSearch}
        className={`btn ${className} group
            ${loading ? " pointer-events-none" : ""}  
            bg-[#F1F5F9] text-[#141412]  dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg
          `}
        isLoading={loading}
        disabled={loading}
      >
        <span className="flex items-center">
          {icon && (
            <span
              className={`
                    transition-transform duration-300 ease-in-out group-hover:scale-150
                    ${
                      iconPosition === "right"
                        ? "order-1 ltr:ml-2 rtl:mr-2"
                        : ""
                    } 
                    ${
                      text && iconPosition === "left" ? "ltr:mr-2 rtl:ml-2" : ""
                    } 
                    ${iconClass}
                  `}
            >
              <Icon icon={icon} />
            </span>
          )}
          <span>{text}</span>
        </span>
      </Auto_Button>
    </>
  );
}

export default Auto_Button_Search;
