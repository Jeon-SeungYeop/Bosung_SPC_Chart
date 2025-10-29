import Icon from "@/components/ui/Icon";
import { React, useCallback, useState, useEffect, useRef } from "react";
import { CommonFunction } from "@/components/autocomponent";

function Auto_Button_Column_State({
  text = "",
  type = "button",
  className = " btn-dark shadow-base2 font-normal btn-sm ",
  icon = "heroicons-outline:ellipsis-vertical",
  iconPosition = "left",
  iconClass = "text-lg",
  columnDefs,
  gridRef,
}) {
  // 버튼 외부에서 권한 상태를 저장할 상태를 선언
  const [isModifyAllowed, setIsModifyAllowed] = useState(true);
  // 팝업 표시 상태
  const [showPopup, setShowPopup] = useState(false);
  // 컬럼 상태 저장
  const [columnState, setColumnState] = useState([]);
  const wrapperRef = useRef(null);

  // 권한 체크
  useEffect(() => {
    const authlist = CommonFunction.getMenuPerAuth();
    setIsModifyAllowed(authlist[0] !== "N");
  }, []);

  // 컬럼 상태 초기화 및 이벤트 리스너 설정
  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      const updateState = () => {
        const state = gridRef.current.api.getColumnState();
        setColumnState([...state]);
      };

      // 초기 상태 설정
      updateState();

      // 컬럼 상태 변경 이벤트 리스너 등록
      const events = ['columnVisible', 'columnPinned', 'columnMoved', 'gridColumnsChanged'];
      events.forEach(event => gridRef.current.api.addEventListener(event, updateState));

      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        events.forEach(event => gridRef.current.api.removeEventListener(event, updateState));
      };
    }
  }, [gridRef]);

  // 컬럼 리셋 함수
  const resetState = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.resetColumnState();
      const state = gridRef.current.api.getColumnState();
      setColumnState([...state]);
    }
  }, [gridRef]);

  // 팝업 토글 및 상태 갱신
  const openCheckbox = useCallback((e) => {
    e.stopPropagation();
    if (gridRef.current && gridRef.current.api) {
      const state = gridRef.current.api.getColumnState();
      setColumnState([...state]);
    }
    setShowPopup(prev => !prev);
  }, [gridRef]);

  // 외부 클릭 시 팝업 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 체크박스 변경 핸들러
  const handleCheckboxChange = useCallback(
    (colId) => {
      if (gridRef.current && gridRef.current.api) {
        const updatedState = columnState.map((col) =>
          col.colId === colId ? { ...col, hide: !col.hide } : col
        );
        setColumnState([...updatedState]);
        gridRef.current.api.applyColumnState({ state: updatedState });
      }
    },
    [columnState, gridRef]
  );

  // 제외할 컬럼 목록
  const excludedColumns = ["rowstatus", "ag-Grid-SelectionColumn"];
  const filteredColumnState = columnState.filter(
    (col) => !excludedColumns.includes(col.colId)
  );

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <span title={!isModifyAllowed ? "수정 권한이 없습니다" : ""}>
        <button
          type={type}
          disabled={!isModifyAllowed}
          onClick={openCheckbox}
          className={`btn ${className} group bg-[#F1F5F9] text-[#141412] dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg ${
            !isModifyAllowed ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <span className="flex items-center">
            {icon && (
              <span
                className={`transition-transform duration-300 ease-in-out group-hover:scale-150 ${
                  iconPosition === "right" ? "order-1 ltr:ml-2 rtl:mr-2" : ""
                } ${
                  text && iconPosition === "left" ? "ltr:mr-2 rtl:ml-2" : ""
                } ${iconClass}`}
              >
                <Icon icon={icon} />
              </span>
            )}
            <span>{text}</span>
          </span>
        </button>
      </span>
      {showPopup && (
        <div className="absolute top-full bg-white dark:bg-gray-800 shadow-lg p-4 z-10 min-w-[200px] z-[999] border border-black dark:border-white">
          <div className="flex flex-col gap-2 ">
            <button
              onClick={resetState}
              className="w-full text-left bg-gray-100 dark:bg-gray-700 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              컬럼 상태 리셋
            </button>
            {filteredColumnState.map((col) => (
              <label key={col.colId} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!col.hide}
                  onChange={() => handleCheckboxChange(col.colId)}
                  disabled={!isModifyAllowed}
                  className="h-4 w-4 cursor-pointer"
                />
                <span>
                  {columnDefs.find((def) => def.field === col.colId)?.headerName || col.colId}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Auto_Button_Column_State;
