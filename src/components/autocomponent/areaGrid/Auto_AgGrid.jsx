import { React, useState, useMemo, useEffect, useCallback } from "react";
import { CommonFunction } from "@/components/autocomponent";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css"; // 기본 테마
import useDarkMode from "@/services/hooks/useDarkMode";
import { AllCommunityModule, ModuleRegistry, colorSchemeDarkBlue, themeQuartz, colorSchemeLight } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);



function Auto_AgGrid({
  gridType = "recipient",
  primaryKeys, // 그리드 PrimaryKey 컬럼.
  gridData = [], // 그리드 에 표현 할 데이터 
  gridRef, // 삭제 를 위한 참조 행 정보 
  columnDefs = [], // 그리드 컬럼 정보  
  originalDataRef,// U 업데이트위한 useRef
  dropdownData, // 드롭다운 데이터  
  onRowClicked, // 그리드 를 선택했을 경우 실행 메서드(recipient에 사용)
  afterMainGridDoubleClick, // 더블 클릭 시 데이터 전달   
  selectedRowindex,
  setDeleteData, // 메인 그리드 내용 변경 시 서브 그리드의 삭제 이력 데이터 없애기  ( C,U,P 상태 는 그리드가 재 랜더링 되면서 초기화 된다.) (ProcessPerEquipment 화면 참조)
  onSelectionChanged,   // 그리드를 선택했을 경우 실행 메서드(sender 에 사용)
  noneSelectionSearch = false,  // image box가 있을 경우 사용되는 rowselection하지 않고 이미지 검색하기 위한 값
  height,
}) {

  const [focusedRowIndex, setFocusedRowIndex] = useState(null); // 포커스된 행 인덱스 상태 추가
  const [isDark] = useDarkMode(); // 다크 모드 감지
  const lightTheme = themeQuartz.withParams({
    backgroundColor: "#ffffff",   // grid data background 부분
    foregroundColor: "#181d26",   // grid data font color
    headerTextColor: "#3c1d1f",    // header font color
    headerBackgroundColor: "#fafafb",   // header background color
    oddRowBackgroundColor: "#ffffff",     // 짝수 행 background color
    headerColumnResizeHandleColor: "#d9d9db",   // header 리사이즈 바 color
    borderColor: "#ddddde",    // border color
    columnBorder: { color: '#ddddde' },  // column 구분선 color
    checkboxUncheckedBackgroundColor: '#ffffff', // 선택 버튼 배경 color
  });
  const darkTheme = themeQuartz.withParams({
    backgroundColor: "#1e293b",   // grid data background 부분
    foregroundColor: "text-slate-300",   // grid data font color
    headerTextColor: "text-slate-300",    // header font color
    headerBackgroundColor: "#2a3340",   // header background color
    oddRowBackgroundColor: "rgb(0, 0, 0, 0.03)",     // 짝수 행 background color
    headerColumnResizeHandleColor: "#c4cae5",   // header 리사이즈 바 color
    borderColor: "#3b4157",    // border color
    columnBorder: { color: '#3b4157' },  // column 구분선 color
    checkboxUncheckedBackgroundColor: '#4f93ae', // 선택 버튼 unchecked 배경 color
    checkboxIndeterminateBackgroundColor: '#4f93ae',  // 선택 버튼 값 null 배경 color
  });
  const defaultColDef = useMemo(() => ({ flex: 1 }), []); // AgGridReact에서 각 컬럼의 기본 속성(defaultColDef) 설정 (   flex: 1  = 컬럼 너비를 자동으로 늘리고 줄이게)
  const rowSelection = useMemo(() => ({ mode: "multiRow", enableClickSelection: false }), []); // mode: "multiRow"  = 행을 여러 개 선택할 수 있는 체크박스 행 " 설정
  const isrowcountMessage = "조회 된 데이터 가 없습니다.";
  const image_rowSelection = useMemo(() => ({ mode: 'multiRow', checkboxes: true, enableClickSelection: false, }), []);   // image grid용 rowselection(선택체크박스, 다중선택 가능)
  const leftgrid_rowSelection = useMemo(() => ({ mode: 'singleRow', checkboxes: false, enableClickSelection: true, }), []);

  const [gridApi, setGridApi] = useState(null);
  const [isOkChangeMainGridRow, setisOkChangeMainGridRow] = useState(true); // subgird 에서 수정 한 행이 존재 할 경우 다른 행으로 이동 할 것인지 확인 ( 다중 그리드 일 경우 메인 그리드 만 적용 ) 

  const onGridReady = (params) => {
    setGridApi(params.api);
  };


  const handleRowClick = (params) => { 
    if (setDeleteData) {
      // 다중 그리드 구성 시 메인 그리드 클릭 시 서브 그리드의 삭제 대상 리스트 초기화 
      setDeleteData([]);
    }
    // 클릭 허용 시 원래 이벤트 실행
    onSelectionChanged?.(params);
  };

  // 키보드 내비게이션 커스터마이징(그리드1에서 키보드 조작으로 행 이동 시 조회되기 위한 부분)
  const navigateToNextCell = useCallback((params) => {
    const suggestedNextCell = params.nextCellPosition;
    const KEY_UP = 38;
    const KEY_DOWN = 40;

    if (!suggestedNextCell) return null;

    const keyCode = params.event.keyCode;
    if (keyCode === KEY_UP || keyCode === KEY_DOWN) {
      if(!noneSelectionSearch){  // 기본 그리드1에서 사용되는 키보드 이벤트
        const gridApi = params.api;
        gridApi.forEachNode((node, index) => {
          if (index === suggestedNextCell.rowIndex) {
            node.setSelected(true);
          }
        });
        return suggestedNextCell;
      } else {  // imagebox 사용하는 그리드1에서 사용되는 키보드 이벤트
        const gridApi = params.api;
        const rowIndex = suggestedNextCell.rowIndex;
        const rowNode = gridApi.getDisplayedRowAtIndex(rowIndex);

        if (rowNode) {
          gridApi.dispatchEvent({ type: 'selectionChanged' });
        }
        return suggestedNextCell;
      }
    }
      
    
    return suggestedNextCell;
  }, []);


  useEffect(() => {
    if (!gridApi || !gridData.length) return;
    const rowNode = gridApi.getDisplayedRowAtIndex(selectedRowindex);
    if (!rowNode) return;

    // 1. 선택 해제 → 선택
    gridApi.forEachNode((node) => node.setSelected(false));
    rowNode.setSelected(true);
    
    // 2. 스크롤 및 포커스
    gridApi.ensureIndexVisible(selectedRowindex, 'middle');
    gridApi.setFocusedCell(selectedRowindex, columnDefs[0]?.field || '');
 
  }, [selectedRowindex, gridData, gridApi, columnDefs]);




  // 화면 배율에 맞게 그리드 높이를 자동 조절 
  const [gridHeight, setGridHeight] = useState(window.innerHeight - 500);

  useEffect(() => {
    const handleResize = () => setGridHeight(window.innerHeight - 500);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 화면 비율에 따라 스크롤 너비 값 계산
  const calculateScrollbarWidth = () => {
    const base = 16;
    const ratio = window.devicePixelRatio || 1;
    return Math.floor(base / ratio);
  };
  const [scrollbarWidth, setScrollbarWidth] = useState(calculateScrollbarWidth());
  useEffect(() => {
    const handleResizeOrZoom = () => {
      setScrollbarWidth(calculateScrollbarWidth());
    };
    window.addEventListener("resize", handleResizeOrZoom);
    return () => window.removeEventListener("resize", handleResizeOrZoom);
  }, []);
  
  // Ctrl + C로 클립보드에 해당 셀 데이터 복사
  const handleCellKeyDown = useCallback((params) => {
    const e = params.event;
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
      navigator.clipboard.writeText(params.value ?? '');
      e.preventDefault();
    }
  }, []);


  return (


    <div className="w-full" style={{ minHeight: '90px', height: height ? `${height}px` : `${gridHeight}px` }}>
      { // 그리드 데이터 연동 시 상위 그리드 인경우 (하위 그리드 데이터 연계 메서드 내용을 가지고 있을 경우)
        gridType === "sender" && (
          <AgGridReact
            key={scrollbarWidth}  // key의 값이 바뀔 때 마다 ag grid 재랜더링(화면 비율에 따라 스크롤바 너비를 맞추기 위해)
            ref={gridRef}
            theme={isDark ? darkTheme : lightTheme}
            gridOptions={{ overlayNoRowsTemplate: isrowcountMessage, scrollbarWidth: scrollbarWidth, }}
            rowData={gridData}
            rowSelection= {noneSelectionSearch ? image_rowSelection : leftgrid_rowSelection}    // 키보드로 행 이동시 조회되게하기 위해 multiple에서 single로 교체
            columnDefs={columnDefs} //  그리드 컬럼 정의 
            defaultColDef={defaultColDef} // 그리드 넓이 조정 시 자동 배율 조절
            getRowStyle={(params) => CommonFunction.getRowStyle({ ...params, focusedRowIndex, isDark })}
            onCellFocused={(params) => { CommonFunction.onCellFocused(params, setFocusedRowIndex) }}/// 셀에 포커스될 때 핸들러 호출
             stopEditingWhenCellsLoseFocus={true}
            onGridReady={onGridReady}
            onRowDoubleClicked={afterMainGridDoubleClick} // 더블 클릭 시 선택 행 데이터 전달 메서드 (부모에서 전달 받음). 
            onSelectionChanged={handleRowClick} // 키보드, 마우스 선택 변경 이벤트
            navigateToNextCell={navigateToNextCell} // 키보드 내비게이션
            singleClickEdit={true}          // 원클릭으로 edit 상태
            onCellValueChanged={CommonFunction.onCellValueChanged(primaryKeys, originalDataRef, dropdownData)}      // cell 값 변경시 실행되는 함수
            onRowClicked={handleRowClick}
            onCellKeyDown={handleCellKeyDown}
            enableCellSpan={true} // cellspan 사용여부
          />
        )}
      {// 일반 그리드 또는 하위 그리드 인경우 
        gridType === "recipient" && (
          <AgGridReact
            key={scrollbarWidth}  // key의 값이 바뀔 때 마다 ag grid 재랜더링(화면 비율에 따라 스크롤바 너비를 맞추기 위해)
            theme={isDark ? darkTheme : lightTheme}
            gridOptions={{ overlayNoRowsTemplate: isrowcountMessage, scrollbarWidth: scrollbarWidth, }}   // no rows to show 대신 수정할 부분 
            rowData={gridData} // 그리드 매칭 데이터 
            rowSelection={rowSelection}  // 선택 체크박스 관련
            columnDefs={columnDefs} //  그리드 컬럼 정의 
            defaultColDef={defaultColDef} // 그리드 넓이 조정 시 자동 배율 조절
            getRowStyle={(params) => CommonFunction.getRowStyle({ ...params, focusedRowIndex, isDark })} // 행 스타일을 동적으로 적용
            onCellFocused={(params) => CommonFunction.onCellFocused(params, setFocusedRowIndex)}// 셀에 포커스될 때 핸들러 호출 
            onRowClicked={onRowClicked}  
            stopEditingWhenCellsLoseFocus={true}
            ref={gridRef} // 삭제 를 위한 참조 행 정보 
            singleClickEdit={true}          // 원클릭으로 edit 상태
            onCellValueChanged={CommonFunction.onCellValueChanged(primaryKeys, originalDataRef, dropdownData)}      // cell 값 변경시 실행되는 함수
            onCellKeyDown={handleCellKeyDown}
          />
        )
      }
    </div>


  );
}

export default Auto_AgGrid;
