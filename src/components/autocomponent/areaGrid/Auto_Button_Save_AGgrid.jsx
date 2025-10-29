import Icon from "@/components/ui/Icon";
import React, { useState, useEffect } from "react";
import { useApiUrl } from "@/context/APIContext";
import axios from "axios";
import Auto_MessageModal from "@/components/autocomponent/common/Auto_MessageModal";
import { CommonFunction } from "@/components/autocomponent";

function Auto_Button_Save_AGgrid({
  text = "저장",
  type = "button",
  className = " btn-dark shadow-base2 font-normal btn-sm ",
  icon = "heroicons:document-check",
  iconPosition = "left",
  iconClass = "text-lg",
  setGridMessage, // 그리드에 표현 할 메세지
  modifiedData, // 수정 할 grid 행 데이터
  modifiedMainData, // 이중 그리드 작업 시 함께 저장할 데이터
  modifyAddress, // 수정 Backend 주소
  setExcuteSuccesAndSearch, // 재조회 시그널
  setAddData,   // 저장 완료 후 CUD 상태 데이터 초기화
  gridRef,      // 저장 완료 후 포커싱 삭제를 위한 ref
  grid1KeyData, // 추가하여 등록 할 컬럼 데이터 (등록 대상의 그리드 컬럼 에 추가적으로 포함시킬 컬럼 이 있다면 전달 ) ex :   const grid1KeyData = useRef({ plantcode: "", instrumentid: "" }); // 그리드1 에서 선택한 사업장 과 공정id
}) {

  const apiUrl = useApiUrl();
  const [isModalOpen, setIsModalOpen] = useState(false);   // 저장 확인 예, 아니오 modal state
  const [isModalOpen2, setIsModalOpen2] = useState(false);   // 조회 데이터가 없는 modal state
  const [isModalOpen3, setIsModalOpen3] = useState(false);   // 저장 완료 modal state
  const [isModalOpen4, setIsModalOpen4] = useState(false);   // 변경된 데이터가 없는 modal state
  const [isModalOpen5, setIsModalOpen5] = useState(false);   // 저장 실패 시 modalstate
  const [isModalOpen6, setIsModalOpen6] = useState(false);   // 저장 실패 시 modalstate

  // 사용자 별 버튼 권한 설정
  const [isModifyAllowed, setIsModifyAllowed] = useState(true);
  useEffect(() => {
    const authlist = CommonFunction.getMenuPerAuth();
    // 수정 권한 이 없으면 사용불가. 
    if (authlist[0] === "N") {
      setIsModifyAllowed(false);
    } else {
      setIsModifyAllowed(true);
    }
  }, []);



  const [message, setMessage] = useState("");   // 저장 실패시 백앤드에서 날아오는 메시지 저장용

  // 수정 모달 Open 여부 확인
  const onClick = () => {
    if ((!modifiedData || modifiedData.length === 0) && (!modifiedMainData || modifiedMainData.length === 0)) {
      // 조회 된 데이터 가 없을 경우 
      setIsModalOpen2(true);
    }
    else if ((modifiedData.filter(item => item.rowstatus !== "").length === 0)
            && (modifiedMainData.filter(item => item.rowstatus !== "").length === 0))
    {
      // 변경 할 데이터 가 없는경우. 
      setIsModalOpen4(true);
    }
    else {
      // 데이터가 있을 경우 예/아니오 모달 열기
      setIsModalOpen(true);
    }
  };

  // 수정 데이터의 useflag를 "Y"/"N"으로 변환
  // const transformUseflag = (data) => {
  //   return data.map(item => {
  //     const transformed = { ...item };

  //     if ('useflag' in item) {
  //       transformed.useflag = item.useflag ? "Y" : "N";
  //     }

  //     if ('manageauth' in item) {
  //       transformed.manageauth = item.manageauth ? "Y" : "N";
  //     }

  //     return transformed;
  //   });
  // };
  // 수정 데이터의 useflag를 "Y"/"N"으로 변환 ( boolean 컬럼 일 경우 유동적으로 Y, N 으로 바뀌는 로직으로 변경 )
  const transformUseflag = (data) => {
    return data.map(item => {
      const transformed = { ...item };

      for (const [key, value] of Object.entries(item)) {
        if (typeof value === "boolean") {
          transformed[key] = value ? "Y" : "N";
        }
      }

      return transformed;
    });
  };





  // 수정 모달 로 던져 즐 Back 함수
  const handleConfirm = async () => {
    try {

      // modifiedData 는 갱신 될 행과 기존의 행을 모두 받아온다. (delete 데이터는 별도로 합치며 , C, U P 데이터 는 그리드 에서 받아오므로 갱신 되지 않는 행 이 포함되어있어 "" 인 상태를 제외시킨다. )
      // rowstatus가 ""인 데이터 제외
      const concatData = modifiedData.concat(modifiedMainData? modifiedMainData : []);  // modifiedMainData가 있으면 병합
      const filteredData = concatData.filter(item => item.rowstatus !== "");

      // Boolean 컬럼의 값  변환 (true : Y , false : N )
      const transformedData = transformUseflag(filteredData);

      // 이중그리드 또는 컬럼을 추가하여 등록할 경우 전달받는 Key 컬럼 과 값 (Key,Value) 를 추가 하여 컬럼으로 생성 . 
      let enrichedData = transformedData;
      if (grid1KeyData?.current) {
        const extraDataMap = Object.entries(grid1KeyData.current).reduce((acc, [key, value]) => {
          acc[key] = value ?? ""; // null 또는 undefined이면 빈 문자열 처리
          return acc;
        }, {});

        enrichedData = transformedData.map(item => ({
          ...item,
          ...extraDataMap, // grid1KeyData의 값들을 병합
        }));
      }
      // 데이터 전달
      const accessToken = localStorage.getItem("token")
      const url = `${apiUrl}${modifyAddress}?userid=${JSON.parse(localStorage.getItem("userid"))}`; // 로그인 ID 쿼리 파라미터로 전달
      const response = await axios.post(
        url,
        JSON.stringify(enrichedData),
        {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        }
      )
      .catch(err => {
        if (err.response?.status === 403) {
          setIsModalOpen6(true);
          return;
        } else {
          console.error("다른 에러 발생", err);
        }
      });

      const { jhedher } = response.data;
      if (jhedher?.status !== "S") {
        console.warn("The server returned an error response.", jhedher); // 서버에서 오류 응답을 반환했습니다.
        setMessage(jhedher?.db_msg)
        setIsModalOpen5(true);
        return;
      }
      console.log(jhedher?.db_msg);
      setAddData([]); // 저장 후 수정 데이터 초기화
      setExcuteSuccesAndSearch(prev => !prev); // 재조회
      setIsModalOpen(false); // 저장 후 모달 닫기
      setIsModalOpen3(true); // 저장 완료 모달 열기
      // 저장 후 포커스 이동
      setTimeout(() => {
        const api = gridRef.current?.api;
        const focusedCell = api?.getFocusedCell();
        if (focusedCell) {
          api.ensureIndexVisible(focusedCell.rowIndex, 'top');
          api.setFocusedCell(focusedCell.rowIndex, focusedCell.column);
        }
      }, 300);
    } catch (error) {
      console.error("error occur", error);
    }
  };

  // 저장확인 Modal Cancel 함수
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  // 조회 데이터가 없는 경우 Modal Cancel 함수
  const handleCancel2 = () => {
    setIsModalOpen2(false);
  };
  // 저장완료 Modal Cancel
  const handleCancel3 = () => {
    setIsModalOpen3(false);
  };
  // 변경 데이터가 없는 경우  Modal Cancel
  const handleCancel4 = () => {
    setIsModalOpen4(false);
  };
  // 동일한 key가 있을 경우 Modal Cancel
  const handleCancel5 = () => {
    setIsModalOpen5(false);
  };
  // 접근 권한이 없는 경우 Modal Cancel
  const handleCancel6 = () => {
    setIsModalOpen6(false);
  };

  return (
    <>
      {/* 저장 여부 모달 (데이터가 있을 경우) */}
      {isModalOpen && (
        <Auto_MessageModal
          activeModal={isModalOpen} // 열림 닫힘 여부 status
          onClose={handleCancel} // 닫힘 버튼 클릭 액션
          onSubmit={handleConfirm} // 예 버튼 클릭 시 실행할 함수
          title="데이터 저장" // title
          message={"변경 내역을 저장 하시겠습니까?"} // 메시지
        />
      )}
      {/* 확인만 있는 모달 (조회 데이터가 없는 경우) */}
      {isModalOpen2 && (
        <Auto_MessageModal
          activeModal={isModalOpen2} // 열림 닫힘 여부 status
          onClose={handleCancel2} // 닫힘 버튼 클릭 액션
          title="저장 실패" // title 
          message={"조회된 데이터가 없습니다."} // 메시지
          answertype="OK"  // 확인 버튼 . 
          headericon={"failed"}
        />
      )}
      {/* 확인만 있는 모달 (저장완료 경우) */}
      {isModalOpen3 && (
        <Auto_MessageModal
          activeModal={isModalOpen3} // 열림 닫힘 여부 status
          onClose={handleCancel3} // 닫힘 버튼 클릭 액션
          title="저장 완료" // title 
          message={"저장이 완료되었습니다."} // 메시지
          answertype="OK"  // 확인 버튼 . 
          headericon={"success"}
        />
      )}
      {/* 확인만 있는 모달 (변경 데이터가 없는 경우) */}
      {isModalOpen4 && (
        <Auto_MessageModal
          activeModal={isModalOpen4} // 열림 닫힘 여부 status
          onClose={handleCancel4} // 닫힘 버튼 클릭 액션
          title="저장 실패" // title 
          message={"저장 할 내역이 없습니다."} // 메시지
          answertype="OK"  // 확인 버튼 . 
          headericon={"failed"}
        />
      )}
      {/* 확인만 있는 모달 (데이터 저장 실패 경우) */}
      {isModalOpen5 && (
        <Auto_MessageModal
          activeModal={isModalOpen5} // 열림 닫힘 여부 status
          onClose={handleCancel5} // 닫힘 버튼 클릭 액션
          title="저장 실패" // title 
          message={message} // 메시지
          answertype="OK"  // 확인 버튼 . 
          headericon={"failed"}
        />
      )}
      {/* 확인만 있는 모달 (접근 권한이 없는 경우) */}
      {isModalOpen6 && (
        <Auto_MessageModal
          activeModal={isModalOpen6} // 열림 닫힘 여부 status
          onClose={handleCancel6} // 닫힘 버튼 클릭 액션
          title="저장 실패" // title 
          message={"접근 권한이 없습니다."} // 메시지
          answertype="OK"  // 확인 버튼 . 
          headericon={"failed"}
        />
      )}

      <span title={!isModifyAllowed ? "수정 권한이 없습니다" : ""}>
        <button
          type={type}
          onClick={onClick} // 수정 Modal Open
          disabled={!isModifyAllowed}
          className={`btn ${className} group 
    bg-[#F1F5F9] text-[#141412] 
    dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg 
    ${!isModifyAllowed ? "opacity-50 cursor-not-allowed" : ""}`} // 비활성화 시 스타일
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
      </span >
    </>
  );
}

export default Auto_Button_Save_AGgrid;
