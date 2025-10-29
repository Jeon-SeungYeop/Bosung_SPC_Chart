import Icon from "@/components/ui/Icon";
import { React, useCallback, useState, useEffect } from "react";
import Auto_MessageModal from "@/components/autocomponent/common/Auto_MessageModal";
import { CommonFunction } from "@/components/autocomponent";

function Auto_Button_Add_AGgrid({
  text = "추가",
  type = "button",
  className = " btn-dark shadow-base2 font-normal btn-sm ",
  icon = "heroicons-outline:plus-sm",
  iconPosition = "left",
  iconClass = "text-lg",
  columnDefs,
  //setExcuteSuccesAndSearch, // AG Grid 의 추가 에는 필요 없으므로 주석 처리함. 2025-05-12
  gridRef,
  defaultPlantCode = JSON.parse(localStorage.getItem("plantcode")), // 사용자 로그인 공장 정보로 추가 공장 설정
  grid1KeyData, // 그리드1(메인 그리드) 에서 선택한 행의 정보  grid1KeyData 가 없을 경우 행 추가 Event  를 막는다. 
  setAddData,
}) {
  // 버튼 외부에서 권한 상태를 저장할 상태를 선언
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
  
  // 상위 header에서 children 컬럼 값 추출
  function getLeafColumns(cols) {
    return cols.flatMap(col =>
      col.children
        ? getLeafColumns(col.children)
        : [col]
    );
  }
  const [isModalOpen, setIsModalOpen] = useState(false);   // 저장 확인 예, 아니오 modal state

  const handleToggleAdd = useCallback(() => {
    // 하위 컬럼으로 추출
    const leafCols = getLeafColumns(columnDefs);

    // newRow 생성
    const newRow = leafCols.reduce((acc, column) => {
      const field = column.field;
      // grid1KeyData에서 동일한 필드명이 있는 경우 해당 값을 기본값으로 설정
      if (grid1KeyData?.current && field in grid1KeyData.current) {
        acc[field] = grid1KeyData.current[field];
      }
      else if (field === "plantcode") {
        // 이미 값이 있으면 덮어쓰지 않음
        if (!acc[field]) {
          acc[field] = defaultPlantCode;
        }
      }
      else if (field === "rowstatus") {
        acc[field] = "C"; // 상태값 C
      }
      // cellRenderer가 Auto_Grid_Checkbox_AGgrid를 사용하는 경우
      else if (
        typeof column.cellRenderer === "function" &&
        column.cellRenderer.toString().includes("Auto_Grid_Checkbox_AGgrid")
      ) {
        acc[field] = "Y"; // 체크박스 렌더러의 기본값을 false로 설정
      }
      else if (column.cellEditor === "agSelectCellEditor") {
        const firstOption = column.cellEditorParams?.values?.[0]; // 드롭다운의 첫 번째 옵션
        acc[field] = firstOption || "";
      }
      // defaultValue 값이 있는 경우
      else if (column.defaultValue !== undefined) {
        acc[field] = column.defaultValue;
      }
      else {
        acc[field] = column.cellDataType === "number" ? 0 : ""; // 나머지는 기본값
      }
    return acc;
  }, {});

  // AG Grid API를 통해 트랜잭션으로 바로 행 추가
  const api = gridRef.current.api;
  const focusedCell = api.getFocusedCell();
  const focusedRowIndex = focusedCell ? focusedCell.rowIndex : -1;
  const insertIndex = focusedRowIndex >= 0 ? focusedRowIndex + 1 : undefined;

  // applyTransaction으로 행을 추가하면 즉시 add된 rowNode를 반환받는다.
  const transaction = insertIndex != null
    ? { add: [newRow], addIndex: insertIndex }
    : { add: [newRow] };
  const result = api.applyTransaction(transaction);

  setAddData((prevData) => [...prevData, newRow]);

  // 반환받은 rowNode에서 새로운 행의 실제 인덱스를 가져온 뒤 곧바로 포커스/편집 시작
  if (result.add && result.add.length > 0) {
    const newNode = result.add[0];
    const newRowIndex = newNode.rowIndex;

    // 새로 추가된 행에 포커스 주기
    api.ensureIndexVisible(newRowIndex, "middle"); // 해당 행을 보이도록 함
    api.setFocusedCell(newRowIndex, "plantcode");
    api.startEditingCell({
      rowIndex: newRowIndex,
      colKey: "plantcode",
    });
  }
}, [gridRef, columnDefs, defaultPlantCode, grid1KeyData]);

  return (
    <div>
      <span title={!isModifyAllowed ? "수정 권한이 없습니다" : ""}>
        <button
          type={type}
          disabled={!isModifyAllowed}
          onClick={() => {
            // grid1KeyData가 전달되었고, current?.plantcode가 없는 경우
            if (grid1KeyData?.current && !grid1KeyData.current.plantcode) {
              setIsModalOpen(true); // 모달 열기
              return; // handleToggleAdd() 실행 방지
            }

            // 위 조건에 해당하지 않으면 항상 실행
            handleToggleAdd(); // 원하는 함수 실행

          }}
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
      </span>

      {/* 🔽 모달은 버튼 바깥에서 조건부 렌더링 */}
      {isModalOpen && (
        <Auto_MessageModal
          activeModal={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="데이터 선택"
          message="추가 항목을 선택 후 진행하세요"
          answertype="OK"
          headericon="failed"
        />
      )}
    </div>
  );
}

export default Auto_Button_Add_AGgrid;