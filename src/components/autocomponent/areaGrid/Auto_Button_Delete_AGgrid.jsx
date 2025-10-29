import Icon from "@/components/ui/Icon";
import React, { useState, useEffect } from "react";
import Auto_MessageModal from "../common/Auto_MessageModal";
import { CommonFunction } from "@/components/autocomponent";

function Auto_Button_Delete_AGgrid({
  gridRef, // gridRef를 props로 받음
  text = "삭제",
  type = "button",
  className = "btn-dark shadow-base2 font-normal btn-sm ",
  icon = "heroicons-outline:minus-sm",
  iconPosition = "left",
  iconClass = "text-lg",
  gridData,  // 그리드 상 현재 데이터
  setAddData,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isModifyAllowed, setIsModifyAllowed] = useState(true);

  useEffect(() => {
    const authlist = CommonFunction.getMenuPerAuth();
    // 수정 권한이 없으면 사용불가
    if (authlist[0] === "N") {
      setIsModifyAllowed(false);
    } else {
      setIsModifyAllowed(true);
    }
  }, []);

  const onClick = () => {
    const api = gridRef.current.api;
    const selectedRows = api.getSelectedRows(); // checkbox를 통해 선택한 rows
    const focusedCell = api.getFocusedCell();

    // 선택한 데이터가 없을 때 모달 열기
    if (selectedRows.length === 0 && !focusedCell) {
      setMessage("선택된 데이터가 없습니다.");
      setIsModalOpen(true);
      return;
    }

    let rowsToDelete = [];
    let focusRowIndex = null;

    if (selectedRows.length > 0) {
      // 선택된 행이 있는 경우
      rowsToDelete = selectedRows;
      // 선택된 행 중 마지막 행의 인덱스를 기준으로 포커스 설정
      const lastSelectedRow = selectedRows[selectedRows.length - 1];

      if (lastSelectedRow) {
        const rowNode = api.getRowNode(lastSelectedRow.id);
        if (rowNode) {
          focusRowIndex = rowNode.rowIndex;
        }
      }
    } else if (focusedCell) {
      // 선택된 행이 없고 포커스된 셀만 있는 경우
      const rowNode = api.getDisplayedRowAtIndex(focusedCell.rowIndex);
      if (rowNode && rowNode.data) {
        rowsToDelete = [rowNode.data];
        focusRowIndex = focusedCell.rowIndex;
      }
    }

    // rowstatus 변경
    rowsToDelete.forEach((row) => {
      if (
        row.rowstatus !== "C" &&
        (row.rowstatus === null ||
          row.rowstatus === "" ||
          row.rowstatus === undefined ||
          row.rowstatus === "U")
      ) {
        row.rowstatus = "D";
      }
      if (row.rowstatus === "C") {
        // 삭제할 데이터가 "C" 상태일 경우 setAddData로 해당 행 삭제
        setAddData((prevData) => {
          const indexToDelete = prevData.findIndex((data) => JSON.stringify(data) === JSON.stringify(row));
          if (indexToDelete !== -1) {
            const newData = [...prevData];
            newData.splice(indexToDelete, 1); // 첫 번째로 일치하는 항목만 삭제(내용이 똑같은 행이 많을 경우)
            return newData;
          }
          return prevData;
        });
      }
    });

    

    // 삭제 후 남은 행 수 확인 (삭제 전)
    const rowCountBeforeDelete = api.getDisplayedRowCount();
    // 삭제할 행 수
    const deletedRowCount = rowsToDelete.length;

    // AG Grid API를 통해 트랜잭션으로 바로 행 삭제
    api.applyTransaction({ remove: rowsToDelete });

    // 삭제 후 포커스 처리
    const rowCount = api.getDisplayedRowCount(); // 남은 행 수 확인
    if (rowCount === 0) {
      // 그리드에 남은 데이터가 없으면 포커스 삭제
      api.clearFocusedCell();
    } else {
      // 삭제된 행의 다음 행으로 포커스 이동
      let focusIndex = focusRowIndex - (deletedRowCount - 1); // 삭제된 행 수를 고려해 조정
      if (focusIndex >= rowCount) {
        // 다음 행이 없으면 마지막 행으로
        focusIndex = rowCount - 1;
      } else if (focusIndex < 0) {
        // 인덱스가 음수가 되면 첫 번째 행으로
        focusIndex = 0;
      }

      // 포커스 이동 및 편집 모드 시작
      api.ensureIndexVisible(focusIndex, "middle");
      api.setFocusedCell(focusIndex, "plantcode");
      api.startEditingCell({
        rowIndex: focusIndex,
        colKey: "plantcode",
      });
    }
  };


  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* 삭제 여부 메시지 모달 */}
      {isModalOpen && (
        <Auto_MessageModal
          activeModal={isModalOpen} // 열림 닫힘 여부 status
          onClose={handleCancel} // 닫힘 버튼 클릭 액션
          title="데이터 삭제" // title
          message={message} // 메시지
          answertype="OK" // 확인 버튼
          headericon={"failed"}
        />
      )}

      <span title={!isModifyAllowed ? "수정 권한이 없습니다" : ""}>
        <button
          type={type}
          onClick={onClick}
          disabled={!isModifyAllowed}
          className={`btn ${className} group 
    bg-[#F1F5F9] text-[#141412] 
    dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg 
    ${!isModifyAllowed ? "opacity-50 cursor-not-allowed" : ""}`} // 비활성화 시 스타일
        >
          <span className="flex items-center">
            {icon && (
              <span
                className={`transition-transform duration-300 ease-in-out group-hover:scale-150
                ${iconPosition === "right" ? "order-1 ltr:ml-2 rtl:mr-2" : ""}
                ${text && iconPosition === "left" ? "ltr:mr-2 rtl:ml-2" : ""} ${iconClass}`}
              >
                <Icon icon={icon} />
              </span>
            )}
            <span>{text}</span>
          </span>
        </button>
      </span>
    </>
  );
}

export default Auto_Button_Delete_AGgrid;