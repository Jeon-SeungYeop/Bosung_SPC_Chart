import React from "react";
import useDarkMode from "@/services/hooks/useDarkMode";

/**
 * 공통 그리드 셀 버튼 렌더러 (팝업 호출 용 셀 버튼 - WorkerMaster.jsx 참조)
 * 
 * @param {string} value - 셀에 표시할 값
 * @param {object} data - 현재 row 데이터
 * @param {function} onButtonClick - 버튼 클릭 시 호출할 함수
 * @param {boolean} isDark - 다크모드 여부
 * @param {string} visibleStatus - 버튼을 보여줄 rowstatus 값 (기본값: 'C')
 */
const Auto_GridCellButtonRenderer = ({
  title = "P",
  value,
  data,  
  //visibleStatus = 'C',
  setisPopupOpen, // 팝업 오픈 여부 세팅
}) => {
  const [isDark] = useDarkMode(); // 다크 모드 감지

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        paddingRight: '4px',
        boxSizing: 'border-box',
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </span>

        <button
          onClick={() => {setisPopupOpen(true)}}
          style={{
            marginLeft: '8px',
            marginTop: '4px',
            padding: '2px 6px',
            fontSize: '12px',
            lineHeight: '1',
            border: isDark ? '1px solid #fff' : '1px solid #3b82f6',
            borderRadius: '3px',
            background: isDark ? '' : '#fff',
            color: isDark ? '#fff' : '#3b82f6',
            cursor: 'pointer',
          }}
        >
         {title}
        </button>
    </div>
  );
};

export default Auto_GridCellButtonRenderer;
