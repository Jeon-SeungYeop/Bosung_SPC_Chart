import Icon from "@/components/ui/Icon";
import React, { useState, useEffect } from "react";
import { useApiUrl } from "@/context/APIContext"
import axios from "axios";
import Auto_MessageModal from "@/components/autocomponent/common/Auto_MessageModal";

function Auto_Button_Edit({
  text = "수정완료",
  type = "button", 
  className=" btn-dark shadow-base2 font-normal btn-sm ", 
  icon="heroicons:document-check" , 
  iconPosition = "left",
  iconClass = "text-lg",  
  setGridMessage, // 그리드 에 표현 할 메세지
  modifiedData, // 수정 할 grid 행 데이터
  modifyAddress, // 수정 Backend 주소
  setExcuteSuccesAndSearch, //재조회 시그널 
}) {

  const apiUrl = useApiUrl();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 수정 모달 Open 여부 확인
  const onClick = () => { 
    if (!modifiedData || modifiedData.length === 0) 
      {
        // 그리드 에 메세지 전달.
        setGridMessage("수정 내역이 없습니다.");
        setTimeout(() => {
          setGridMessage("");
        }, 3000);
        return;
      }
    setIsModalOpen(true);
  };


   // 수정 모달 로 던져 즐 Back 함수
   const handleConfirm = async () => {
    try { 

      const url = `${apiUrl}${modifyAddress}?userid=${JSON.parse(localStorage.getItem("userid"))}` // 로그인 ID 쿼리 파라매터로 전달.   
      const response = await axios.post(
        url, 
        JSON.stringify(modifiedData),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const { jhedher } = response.data;
      setGridMessage(jhedher?.db_msg); // 그리드 에 데이터베이스 메세지 전달
      setExcuteSuccesAndSearch(prev => !prev); // 재조회

      setTimeout(() => {
        setGridMessage("");
      }, 3000);
    } catch (error) {
      console.error("error occur", error);
    }
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };



  return (
    <> 
    {/* 수정 여부 메세지 모달 */}
    {isModalOpen && (
        <Auto_MessageModal
          activeModal={isModalOpen} // 열림 닫힘 여부 status
          onClose={handleCancel} // 닫힘 버튼 클릭 액션
          onSubmit={handleConfirm} // 예 버튼 클릭 시 실행 할 함수
          title="데이터 수정" // title
          message={"변경 내역을 수정 하시겠습니까?"} // 메시지
        />
      )}

        <button
        type={type}
        onClick={onClick}  // 수정 Modal Open
        className={`btn ${className} group 
          bg-[#F1F5F9] text-[#141412]  dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg
        `}
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
        </button> 
    </>
  );
}

export default Auto_Button_Edit;
