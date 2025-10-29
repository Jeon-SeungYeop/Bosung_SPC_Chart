import Icon from "@/components/ui/Icon"; 
import React, { useState, useMemo } from "react";


function Auto_Button_Add({
  text = "추가",
  type = "button", 
  className=" btn-dark shadow-base2 font-normal btn-sm ", 
  icon="heroicons-outline:plus-sm", 
  iconPosition = "left",
  iconClass = "text-lg", 
  setExcuteSuccesAndSearch, // 등록 후 재조회
  AddModale,
  row = null,    // 그리드 2개 사용시 데이터 추가할 경우 가져갈 선택 데이터
}) { 

  // modal
  const [isModalOpen, setModalOpen] = useState(false);
  const handleToggleModal = () => {
    setModalOpen(!isModalOpen);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  return (
    <> 
        <button
        type={type}
        onClick={handleToggleModal} // 클릭할 때 Open 할 모달 창 
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
       <AddModale activeModal={isModalOpen} onClose={handleCloseModal} setExcuteSuccesAndSearch  = {setExcuteSuccesAndSearch} row={row} />
    </>
  );
}

export default Auto_Button_Add;
