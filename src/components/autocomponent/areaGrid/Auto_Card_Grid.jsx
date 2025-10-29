import Card from "../../ui/Card";
import React, { useMemo, useState, useEffect, useRef } from "react";
import Auto_Button_Add from "./Auto_Button_Add";
import Auto_Button_Delete from "./Auto_Button_Delete";
import Auto_Button_Edit from "./Auto_Button_Edit";
import { IndeterminateCheckbox, GirdCells } from "@/components/autocomponent";

import { Icon } from "@iconify/react";
import {
  useGlobalFilter,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";

// 그리드 컴퍼넌트
const Auto_Card_Grid = ({
  gridInfo, // 그리드 설명  
  excuteButtonVisible = true, // 추가 / 삭제 / 수정완료 버튼 표시 여부 
  cardheight = "700px", // 카드 높이 기본 픽셀
  cardwidth,  // 카드 ( grid border 기본 width ) 
  pagerowcount = 15, // 한페이지 기본 행 사이즈  ( 만약 무한대의 값 을 준다면 그리드 카드 내에 세로 스크롤 이 생기면서 무한 그리드 처리 됨. )

  isselection = 1,  // column 리사이징 시작 인덱스(0이면 선택 column 리사이징 가능, )

  checkColumnShow = false, // 삭제를 위한 체크컬럼 표시 여부 기본 false
  deleteAddress, // 삭제 Backend 주소
  modifyAddress, // 수정 Backend 주소
  gridData, // 그리드에 표현할 Data 배열 []
  AddButtonModal, // 추가 버튼 클릭 시 Open 할 Modal
  primarykey = [], // 삭제, 수정 을 위한 기본 키 컬럼
  setExcuteSuccesAndSearch, // 갱신(삭제,수정,추가) 이후 재조회 하라는 시그널 발생 
  gridColumns, // 그리드 세팅 내용
  isSearchFlag, // 재조회 되었음을 전달. ( 삭제 리스트 , 수정 리스트 초기화 ) 
  error, // error시 붉은 테두리

  msgTooltip,   // error시 출력될 msg의 테두리 표시
  validate,     //  validate시 테두리 설정 


  /// 다중 그리드 속성 
  isrightalign = false, // 우측 배치 ( true : 우측 배치 )
  isselectgrid = false, // True : 그리드 행을 클릭 시 setSelectRow(선택한 항목저장) 를 실행하지 않는다. 
  setSelectRow, // 그리드 선택 행의 정보 및 하위 그리드(Two 그리드 이상) 에 조회 시그널 을 전달 할 state
  beforerowdata, // 기준 그리드 에서 이전 선택한 행의 정보,  재조회 시 찾아서 해당 row 를 재선택

  selectrow = null, // // 그리드 2개 사용시 데이터 추가할 경우 가져갈 선택항 행의 데이터
}) => {
  const [gridMessage, setGridMessage] = useState("");
  const [deleteCheckItems, setDeleteCheckItems] = useState([]); // 삭제 체크박스 체크 데이터 관리 state
  const [modifiedData, setModifiedData] = useState([]); // 수정된 데이터만 갱신 데이터로 전달하기 위한 LIST
  const tableRef = useRef(null); // 테이블 요소에 대한 참조 
 

  // 클릭 행 고정 
  const [fixedSelectedRow, setFixedSelectedRow] = useState(null);


  // 삭제 정보
  const [deleteinfo, setDeleteinfo] = useState({
    address: deleteAddress,
    deleteCheckItems: [],
  });


  // 선택 행의 변경이 있을 경우. 
  useEffect(() => {  
    setFixedSelectedRow(selectrow);
  }, [selectrow]); 

  // 삭제 체크박스의 수정 내역이 있을 경우.
  useEffect(() => {
    setDeleteinfo((prev) => ({
      ...prev,
      deleteCheckItems: deleteCheckItems,
    }));
  }, [deleteCheckItems]);

  // 재조회 되었을 경우 삭제 리스트 초기화, 수정 리스트 초기화 
  useEffect(() => {
    // 다중 그리드 일 경우 선택 한 행의 정보가 없을 경우 
    if (setSelectRow) {
      setSelectRow([]); // 2 그리드 이상인 경우 기준 그리드(정보를 전달해 주는 그리드) 에서 선택 한 행의 정보 를 삭제 
    }
    setDeleteCheckItems([]); // 삭제 체크 정보 초기화
    setModifiedData([]); // 수정 행 정보 초기화  
  }, [isSearchFlag]);

  // 그리드 셋팅 (checkbox, textbox, dropdown)
  const columns = useMemo(() => {
    return gridColumns.map((column) => {
      // 수정 하는 textbox 표시
      column.Cell = (row) => (
        <GirdCells
          gridcolumn={column}
          row={row}
          gridData={gridData}  // 원본 내용과 비교하여 수정 되었을경우만 등록 하기 위하여 전달
          primarykey={primarykey} // 수정 시 중복 행 의 수정 내역 누적을 막기 위한 기 등록 행의 비교 기준
          setModifiedData={setModifiedData}
        />
      );
      return column;
    });
  }, [gridColumns, gridData, primarykey, setModifiedData]);

  // 표시될 데이터 Table 셋팅
  const tableInstance = useTable(
    {
      columns,
      data: gridData,
      initialState: {
        pageSize: pagerowcount, //  
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      if (
        checkColumnShow &&
        hooks.visibleColumns.push((columns) => [
          {
            id: "selection",
            Header: ({ getToggleAllRowsSelectedProps }) => (
              <div className=" ">선택</div>
            ),
            Cell: ({ row }) => (
              <div className="w-[1px]">
                <IndeterminateCheckbox
                  setDeleteCheckItems={setDeleteCheckItems}
                  primarykey={primarykey}
                  gridColumns={gridColumns}
                  gridData={gridData}
                  {...row.getToggleRowSelectedProps()}
                />
              </div>
            ),
            width: "80px",
          },
          ...columns,
        ])
      );
    }
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state,
    gotoPage,
    pageCount,
    setPageSize,
    setGlobalFilter,
    prepareRow,
  } = tableInstance;

  const { globalFilter, pageIndex, pageSize } = state;


  // column resizing 부분
  useEffect(() => {
    const table = tableRef.current;
    if (table) {
      resizableGrid(table);
    }

    function resizableGrid(table) {
      var row = table.getElementsByTagName("tr")[0],
        cols = row ? row.children : undefined;
      if (!cols) return;

      table.style.tableLayout = "fixed";
      for (let i = isselection; i < cols.length; i++) {   // i=1로 선택 column 사이즈 변경 불가
        const div = createDiv();
        cols[i].appendChild(div);
        cols[i].style.position = "relative";
        setListeners(div, i);
      }

      function createDiv() {
        const div = document.createElement("div");
        div.style.top = 0;
        div.style.right = 0;
        div.style.width = "5px";
        div.style.position = "absolute";
        div.style.cursor = "col-resize";
        div.style.userSelect = "none";
        div.style.height = "100%"; // 부모 높이에 맞춤
        return div;
      }

      function setListeners(div, index) {
        let pageX, currentColumn, nextColumn, currentColumnWidth;

        div.addEventListener("mousedown", function (e) {
          pageX = e.pageX;
          currentColumn = cols[index];
          nextColumn = cols[index + 1];
          currentColumnWidth = currentColumn.offsetWidth;
        });

        document.addEventListener("mousemove", function (e) {
          if (currentColumn) {
            const diffX = e.pageX - pageX;
            currentColumn.style.width = `${currentColumnWidth + diffX}px`;
          }
        });

        document.addEventListener("mouseup", function (e) {
          currentColumn = undefined;
          nextColumn = undefined;
          pageX = undefined;
        });
      }
    }
  }, [gridData]); // GridData가 변경되면 재 실행 
 


 

  return (
    <Card className={`card ${cardwidth ? `w-[${cardwidth}]` : ""}   ${isrightalign ? '' : " ml-auto"}  ${error ? "border-2 border-danger-500" : ""} ${validate ? "is-valid" : ""}`}>

      <div className={`card `}>
        <div className="md:flex justify-between items-center pb-3 dark:border-slate-800 h-[60px]">
          {/* 왼쪽  그리드 설명 */}
          <div className="flex space-x-2">
            <div>{gridInfo}</div>
          </div>

          {/* 오른쪽 (예: 버튼들) */}
          <div className="flex space-x-2">
            {excuteButtonVisible === true && (
              <>
                <Auto_Button_Add
                  navigate="/invoice-add"
                  AddModale={AddButtonModal}
                  setExcuteSuccesAndSearch={setExcuteSuccesAndSearch}
                  row={selectrow} // 그리드 선택한 행의 정보를 가져가는 경우 
                />
                <Auto_Button_Delete
                  deleteinfo={deleteinfo}
                  setGridMessage={setGridMessage}
                  setExcuteSuccesAndSearch={setExcuteSuccesAndSearch}
                />
                <Auto_Button_Edit
                  setGridMessage={setGridMessage}
                  modifiedData={modifiedData}
                  modifyAddress={modifyAddress}
                  setExcuteSuccesAndSearch={setExcuteSuccesAndSearch}
                />
              </>
            )}
          </div>
        </div>

        {/* 그리드 카드 크기 고정 및 그리드 행의 수가 카드 크기 초과 시 세로 스크롤 생성  */}
        <div className="-mx-6 overflow-x-auto" style={{ height: cardheight }}>
          <div className="inline-block align-middle ">
            <div className="">
              <table
                ref={tableRef} // 참조 추가
                className="table-fixed border-collapse w-full "
                {...getTableProps()}
              >
                <thead className="bg-slate-100 dark:bg-[#2f4a73] border-b border-slate-300 dark:border-slate-600 font-bold text-2xl ">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column, colIdx) => (
                        column.visible == null ? // visible 컬럼 표시
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            className={`table-th text-[1rem] border-r   border-slate-300 dark:border-slate-600   last:border-none 
                          ${colIdx === 0 ? "rounded-tl-xl" : ""}
                          ${colIdx === headerGroup.headers.length - 1 ? "rounded-tr-xl" : ""} 
                        `}
                            style={{
                              textAlign: "center",
                              width: column.width,
                            }}
                          >
                            {column.render("Header")}
                            <span>
                              {column.isSorted ? (column.isSortedDesc ? "↑" : "↓") : ""}
                            </span>
                          </th> : null
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody
                  {...getTableBodyProps()}>
                  {page.map((row) => {


                    prepareRow(row);


                    // 모든 row 를 검색해서 선택한 행의 정보 (fixedSelectedRow) 와 같은 Row 라면 isSelected 를 활성화 하여 선택 효과를 준다. 
                    const isSelectedrow = primarykey.every(
                      (key) => row.original[key] === fixedSelectedRow?.[key]
                    ); 
                    
                    return (
                      <tr
                        {...row.getRowProps()}
                        {...primarykey.reduce((attrs, key) => {
                          attrs[`data-${key}`] = row.original[key];
                          return attrs;
                        }, {})} // <tr> 태그에 다음과 같이 반영 : <tr data-plantcode="1000" data-groupid="ADM" data-menuid="M001">

                        className={` hover:bg-slate-200 dark:hover:bg-slate-700 border-b border-slate-200 dark:border-slate-700
                                    ${isSelectedrow && fixedSelectedRow && JSON.stringify(fixedSelectedRow) === JSON.stringify(row.original) ? "bg-slate-200 dark:bg-slate-700" : ""} `}

                        style={{ height: "40px" }}
                        onClick={() => {
                          if (isselectgrid === true) { // 선택한 행의 정보 를 전달 할 경우 (하위 그리드 연동시)
                            beforerowdata.current = row.original; // 선택 한 행의 정보 를 저장 (재조회 하여도 변경되지 않음)
                            setSelectRow(row.original); // 행 클릭 시 외부로 전달
                          }
                          setFixedSelectedRow(row.original);// 클릭한 행의 고정
                        }}
                      >
                        {row.cells.map((cell) => (
                          cell.column.visible == false ? null :    // visible column 표시 x
                            <td
                              {...cell.getCellProps({
                                style: {
                                  padding: "4px 8px",
                                  textAlign: cell.column.textAlign || "center",
                                },
                              })}
                              className="border-r  border-slate-200 dark:border-slate-700 "
                            >
                              {cell.render("Cell")}
                            </td>
                        ))}
                      </tr>
                    );
                  })}
                  {/* 여백용 마지막 빈 줄 */}
                  <tr>
                    <td colSpan={columns.length}>
                      <div className="h-4"></div> {/* 원하는 간격 만큼 높이 조절 */}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          {/* 그리드 결과 메세지 */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span>{gridMessage}</span>
          </div>
          <ul className="flex items-center space-x-3 rtl:space-x-reverse">
            <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={`group transition-transform duration-300 ${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
              >
                <Icon
                  icon="heroicons-outline:chevron-left"
                  className="transition-transform duration-300 group-hover:scale-150"
                />
              </button>
            </li>
            {pageOptions.map((page, pageIdx) => (
              <li key={pageIdx}>
                <button
                  aria-current="page"
                  className={`${pageIdx === pageIndex
                    ? "bg-slate-900 dark:bg-slate-600 dark:text-slate-200 text-white font-medium bg-[#9EC3FC]"
                    : "bg-slate-100 dark:bg-slate-700 dark:text-slate-400 text-slate-900 font-normal"
                    } text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150 transform hover:scale-150`}
                  onClick={(event) => {
                    event.preventDefault(); // 기본 스크롤 동작 방지, Modal 창에서 다음 페이지 index 버튼 누를시 화면 이동 방지
                    gotoPage(pageIdx);
                  }}
                >
                  {page + 1}
                </button>
              </li>
            ))}
            <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180 ">
              <button
                className={`group transition-transform duration-300 ${!canNextPage ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                onClick={() => nextPage()}
                disabled={!canNextPage}
              >
                <Icon
                  icon="heroicons-outline:chevron-right"
                  className="transition-transform duration-300 group-hover:scale-150"
                />
              </button>
            </li>
          </ul>
        </div>
        {/* 벨리데이션 성공 / 실패 메세지*/}
        {error && (
          <div className={`mt-2 ml-[5rem] ${msgTooltip ? "inline-block bg-danger-500 text-white text-[10px] px-2 py-1 rounded" : "text-danger-500 block text-sm"} `}>
            {error.message}
          </div>
        )
        }
        {validate && (
          <div className={`mt-2 ml-20 ${msgTooltip ? "inline-block bg-success-500 text-white text-[10px] px-2 py-1 rounded" : "text-success-500 block text-sm"}`}>
            {validate}
          </div>
        )}

      </div>
    </Card>
  );
};

export default Auto_Card_Grid;