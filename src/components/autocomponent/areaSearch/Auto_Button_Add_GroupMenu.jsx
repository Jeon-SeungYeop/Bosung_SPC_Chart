import Icon from "@/components/ui/Icon"; 
import { Auto_Button } from "@/components/autocomponent"; 
import React, { useState } from "react";
import { useApiUrl } from "@/context/APIContext"; 
import axios from "axios";
import Auto_MessageModal from "@/components/autocomponent/common/Auto_MessageModal";

function Auto_Button_Add_GroupMenu({
  text = "복사하기",
  type = "button",
  className = "btn-dark shadow-base2 font-normal rounded-[999px] px-6 py-2 transition-colors",
  icon = "heroicons-outline:plus-sm",
  iconPosition = "left",
  iconClass = "text-lg",
  setGridData, // 데이터 설정 함수 
  searchinfo, // 복사 조건
  setAddData, // 복사 후 그리드 추가 내역 리스트를 초기화 하기 위하여 전달 받음 (workerMaster 화면 참조)
  setExcuteSuccesAndSearch,
}) {
  const [loading, setLoading] = useState(false); // 로딩 서클 표시
  const [isModalOpen, setIsModalOpen] = useState(false);   // 저장 확인 예, 아니오 modal state
  const [isModalOpen2, setIsModalOpen2] = useState(false);   // 저장 확인 예 modal state
  const apiUrl = useApiUrl(); // API URL 가져오기
  
  const onClickButton = async () => {
    setIsModalOpen(true)
  }
  const onClickCopy = async () => {
    setLoading(true); // 로딩 서클 표시 시작  

    try {
        if (!searchinfo.address) {
            console.error("API address is not set.");
            return;
        }
        
        const url = `${apiUrl}${searchinfo.address}`;
        const response = await axios.get(url, { params: searchinfo.params });

        if (!response?.data) {
            console.error("No server response data.");
            return;
        }
        const { jhedher, jbody } = response.data;

        if (jhedher?.status !== "S") {
            console.warn("The server returned an error response.", jhedher);
            return;
        }
        if (setAddData) {
            setAddData([]);
        }
    } catch(error) {
        console.error("Data lookup error : ", error);
    }

    
    setLoading(false); // 완료 후 표시 종료
    setIsModalOpen2(true);
    setExcuteSuccesAndSearch(true);
  }; 
  

  return (
    <>
      {isModalOpen && (
        <Auto_MessageModal
          activeModal={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="데이터 복사"
          message="관리자의 데이터를 복사하시겠습니까?"
          answertype="YESNO"
          headericon="failed"
          onSubmit={onClickCopy}
        />
      )}
      {isModalOpen2 && (
        <Auto_MessageModal
          activeModal={isModalOpen2}
          onClose={() => setIsModalOpen2(false)}
          title="데이터 복사"
          message="정상적으로 복사되었습니다."
          answertype="OK"
          headericon="success"
        />
      )}
      <Auto_Button
        type={type}
        onClick={onClickButton}
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

export default Auto_Button_Add_GroupMenu;
