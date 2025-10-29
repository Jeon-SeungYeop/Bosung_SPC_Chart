import Auto_MessageModal from "@/components/autocomponent/common/Auto_MessageModal";
import Icon from "@/components/ui/Icon";
import { useApiUrl } from "@/context/APIContext";
import axios from "axios";
import { useState } from "react";

function Auto_Button_Delete({
  text = "삭제",
  type = "button", 
  className = " btn-dark shadow-base2 font-normal btn-sm ", 
  icon = "heroicons-outline:minus-sm", 
  iconPosition = "left",
  iconClass = "text-lg", 
  deleteinfo, // 삭제 를 위해 전달 받은 데이터
  setGridMessage, // 그리드 에 표현 할 메세지
  setExcuteSuccesAndSearch, // 재조회를 위한 성공여부
}) {
  const apiUrl = useApiUrl();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 삭제 모달 Open 
  const onClick = () => { 
    if (!deleteinfo?.deleteCheckItems || deleteinfo.deleteCheckItems.length === 0) 
      {
        setGridMessage("삭제 할 행을 선택 하세요");
        setTimeout(() => {
          setGridMessage("");
        }, 3000);
        return;
      }
    setIsModalOpen(true);
  };

  // 삭제 모달 로 던져 즐 Back 함수
  const handleConfirm = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}${deleteinfo.address}`,
        JSON.stringify(deleteinfo.deleteCheckItems),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      
      console.log(deleteinfo.deleteCheckItems);


      const { jhedher } = response.data;
      
      console.log(jhedher?.db_msg);

      setGridMessage(jhedher?.db_msg); // 그리드에 데이터베이스 메세지 전달
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
      {/* 삭제 여부 메세지 모달 */}
      {isModalOpen && (
        <Auto_MessageModal
          activeModal={isModalOpen} // 열림 닫힘 여부 status
          onClose={handleCancel} // 닫힘 버튼 클릭 액션
          onSubmit={handleConfirm} // 예 버튼 클릭 시 실행 할 함수
          title="데이터 삭제" // title 
          message={"선택하신 데이터를 삭제 하시겠습니까?"} // 메시지
        />
      )}

      <button
        type={type}
        onClick={onClick}
        className={`btn ${className} group 
          bg-[#F1F5F9] text-[#141412]  dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg
        `}
      >
        <span className="flex items-center">
          {icon && (
            <span
              className={`transition-transform duration-300 ease-in-out group-hover:scale-150
                    ${
                      iconPosition === "right"
                        ? "order-1 ltr:ml-2 rtl:mr-2"
                        : ""
                    }
                    ${
                      text && iconPosition === "left" ? "ltr:mr-2 rtl:ml-2" : ""
                    }
                    ${iconClass}`}
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

export default Auto_Button_Delete;
