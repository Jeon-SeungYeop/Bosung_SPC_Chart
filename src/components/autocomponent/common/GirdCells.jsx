import React from "react";
import Auto_GridDropDown from "../areaGrid/Auto_GridDropDown";

// GirdCells 함수 정의 
const GirdCells = ({ gridcolumn, 
                     row,  
                     primarykey = [], 
                     setModifiedData, 
                     gridData = [] ,  
                    }) => {
  // 수정된 셀의 데이터를 상태에 반영
  // gridData 에서 받아온 원본 데이터 와 비교해 실제 수정 이 이루어진 내용  만 setModifiedData 를 통해 modifiedData 에 수정 내역 대상으로 등록함.
  const handleChange = (value) => {
    const rowIndex = row?.row?.index;
    const columnId = row?.column?.id;
    const originalRow = row?.row?.original;
  
    if (rowIndex === undefined || columnId === undefined) return;
  
    // 수정이 일어난 행의 Key
    const rowKey = primarykey.map((key) => originalRow?.[key]).join("__");
    if (!rowKey) return;
  
    // 원본 gridData 에서 해당 row 찾기
    const originalData = gridData.find(
      (item) => primarykey.map((key) => item[key]).join("__") === rowKey
    );
   
  
    // 🔍 원본 데이터와 수정된 값이 같으면 등록 안함
    if (originalData?.[columnId] === value) { 
      return;
    }
  
    // setModifiedData 갱신
    setModifiedData((prev) => {
      const rowKey = primarykey.map((key) => originalRow?.[key]).join("__");
    
      // 기존에 수정된 데이터가 있으면 가져오고, 없으면 originalRow 사용
      const existing = prev.find(
        (item) => primarykey.map((key) => item[key]).join("__") === rowKey
      ) || originalRow;
    
      // 원본과 비교하여 실제 변경이 없다면 무시
      if (originalData?.[columnId] === value) {
        return prev;
      }
    
      // 기존 항목을 제외하고, 수정된 값으로 병합
      const filtered = prev.filter(
        (item) => primarykey.map((key) => item[key]).join("__") !== rowKey
      );
    
      const updatedRow = {
        ...existing,
        [columnId]: value,
      };
    
      return [...filtered, updatedRow];
    });
  };
  
   
  if (!gridcolumn?.hasOwnProperty("celltype")) {
    return <span>{row?.cell?.value}</span>; // 또는 기본 fallback 처리
  } 
  // 텍스트 필드 처리
  if (gridcolumn.celltype === "text") {
    return (
      <input
        //<<<<<<< HEAD
        type="text"
        defaultValue={row?.cell?.value || ""}
        key={row?.cell?.value}
        onBlur={(e) => handleChange(e.target.value)}
        className={`form-control border-0 bg-[#F1F5F9]  h-[30px]  text-slate-500 dark:text-slate-300 dark:bg-[#263451] dark:border-gray-700 `}
      /> 
    );
  }
  // 패스워드 필드 처리
  if (gridcolumn.celltype === "password") {
    return (
      <input 
        type="password"
        defaultValue={row?.cell?.value || ""}
        key={row?.cell?.value}
        onBlur={(e) => handleChange(e.target.value)}
        className={`form-control border-0 bg-[#F1F5F9]  h-[30px]  text-slate-500 dark:text-slate-300 dark:bg-[#263451] dark:border-gray-700 `}
      /> 
    );
  }

  // 체크박스 처리
  if (gridcolumn.celltype === "checkbox") { 
    return (
      <input
        type="checkbox"
        defaultChecked={row?.cell?.value === "Y"}
        key={row?.cell?.value}
        onChange={(e) => handleChange(e.target.checked ? "Y" : "N")}
        className="table-checkbox"
      />
    );
  }
  if (gridcolumn.celltype === "dropdown") {   
    return (
      <Auto_GridDropDown
      value={row?.row?.original[gridcolumn.accessor]}
      dropDownData={gridcolumn.dropDownData}
      inputWidth="100%"
      onChange={(selectedOption) => {
        handleChange(selectedOption.value);
      }}
    />
    );
  } 


  return <span>{row?.cell?.value}</span>;
};

export default GirdCells;
