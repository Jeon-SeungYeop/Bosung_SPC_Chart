import Icon from "@/components/ui/Icon"; 
import { CommonFunction, Auto_Button } from "@/components/autocomponent"; 
import React, { useEffect, useState, useRef } from "react";
import { useApiUrl } from "@/context/APIContext"; 


function Auto_Button_Search_AGgrid({
  text = "조회",
  type = "button",
  className = "btn-dark shadow-base2 font-normal rounded-[999px] px-6 py-2 transition-colors",
  icon = "heroicons-outline:search",
  iconPosition = "left",
  iconClass = "text-lg",
  setGridData, // 데이터 설정 함수 
  searchinfo, // 조회 조건
  excuteSuccesAndSearch, // Grid 에서 재조회 여부 를 전달 받아 재조회를 실행함 (삭제, 수정 후) 
  originalDataRef, // 변경 데이터 참조용 원본 데이터 복사 Map
  primaryKeys, // 그리드의 기본키  Set
  setAddData, // 조회 후 그리드 추가가 내역 리스트를 초기화 하기 위하여 전달 받음 (workerMaster 화면 참조)
  enterSearch, // enter 키를 눌렀을때 조회되게 하기 위한 변수
  setEnterSearch // enter 키를 눌렀을때 조회되게 하기 위한 변수
}) {
  const [loading, setLoading] = useState(false); // 로딩 서클 표시

  // setExcuteSuccesAndSearch 가 true 여부에 따른 재조회 (추가 , 삭제, 수정 시 )
  const isInitialRender = useRef(true);
 
  
  
 // 갱신 후  
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return; // 최초 렌더링 시에는 실행 안 함
    } 
      // 여기에 재조회 로직 실행
      onClickSearch(); 
  }, [excuteSuccesAndSearch]);  


  const apiUrl = useApiUrl(); // API URL 가져오기
  const onClickSearch = async () => {
    setLoading(true); // 로딩 서클 표시 시작  
  
    await CommonFunction.fetchAndSetGridData({ 
      apiUrl,
      searchinfo,
      setGridData,
      originalDataRef,
      primaryKeys,
      setAddData,
    });
    

    
    setLoading(false); // 완료 후 표시 종료
  }; 
  
  // 엔터 키로 서치 처리 부분
  useEffect(() => {
    if (enterSearch) {
      onClickSearch();
      setEnterSearch(false);
    }
  }, [enterSearch, setEnterSearch]); // enterSearch 값 변경 시에만 실행

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
                    ${iconPosition === "right" ? "order-1 ltr:ml-2 rtl:mr-2" : ""} 
                    ${text && iconPosition === "left" ? "ltr:mr-2 rtl:ml-2" : ""} 
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

export default Auto_Button_Search_AGgrid;
