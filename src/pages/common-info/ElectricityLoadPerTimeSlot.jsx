import {
  CommonFunction,
  Auto_AgGrid, TitleBar, Auto_SearchDropDown, DropDownItemGetter,
  Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid,
  Auto_Spliter, Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Button_Column_State
} from "@/components/autocomponent";
import Auto_MessageModal from "@/components/autocomponent/common/Auto_MessageModal";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import Icon from "@/components/ui/Icon";
import axios from "axios";

// 부하 구분 별 시간대
const ElectricityLoadPerTimeSlot = ({
  // 부하추가 버튼 관련
  text = "부하추가",
  type = "button",
  className = " btn-dark shadow-base2 font-normal btn-sm ",
  icon = "heroicons-outline:plus-sm",
  iconPosition = "left",
  iconClass = "text-lg",
}) => {
  //////////////////////////////////////////////////////////////////////// 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const apiUrl = useApiUrl(); // Backend 접속 정보 
  const gridRef = useRef(); // 삭제 를 위한 참조 행 정보 
  const gridSubRef = useRef(); // 삭제 를 위한 참조 Sub 행 정보 
  const [gridData, setGridData] = useState([]); // 그리드 매핑 데이터 
  const [gridSubData, setGridSubData] = useState([]); // 그리드 Sub 매핑 데이터 
  const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
  const originalDataRef = useRef(new Map()); // U 업데이트위한 useRef
  const [addData, setAddData] = useState([]); // 추가 대상 리스트
  const [addSubData, setAddSubData] = useState([]); // Sub 그리드 추가 대상 리스트
  //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////

  const primaryKeys_g1 = ["plantcode", "loadid"]; // 그리드 1의 기본 키 
  const primaryKeys_g2 = ["plantcode", "loadid", "seq"]; // 그리드 2의 기본 키 
  const [ enterSearch, setEnterSearch ] = useState(false);  // 엔터 키로 검색하기 위한 변수
  const [isModifyAllowed, setIsModifyAllowed] = useState(true);
  const [isAddedLoad, setIsAddedLoad] = useState(false);  // 부하 추가 직후 여부
  const addedLoadData = useRef({ plantcode: "", loadid: "" }); // 추가된 부하 정보

  // 모달 트리거
  const [isModalOpen, setIsModalOpen] = useState(false);   // 부하 추가 확인 예, 아니오 modal state
  const [isModalOpen2, setIsModalOpen2] = useState(false); // 수정 중 좌측 그리드 항목 클릭 확인 예, 아니오 modal state
  
  // 검색 조건 
  const [searchParams, setSearchParams] = useState({
    plantcode: "",
  });
  // 검색조건 변경 즉시 반영  (setSearchParams 이후 선언 할것)
  const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
  // 조회 조건 및 조회 정보 
  const searchinfo = useMemo(
    () => ({
      address: "baseinfo/electricityloadpertimeslot-lr",
      params: {
        plantcode: searchParams.plantcode?.value ?? "",
      },
    }),
    [searchParams]
  );


  // 드롭다운 데이터 상태
  const [dropdownData, setDropdownData] = useState({
    plantcode: { items: [], mappings: {} },
    timezone: { items: [], mappings: {} },
  });


  // 드롭다운 데이터 로드
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [plantcodeAll, plantcodeRequired, timezoneAll,] =
          await Promise.all([
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode" }),  // 조회부 콤보박스  
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }),  // 그리드 콤보박스 ( 필수 선택 ) 
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "timezone", param4: "X" }),  // 그리드 콤보박스 ( 필수 선택 ) 
          ]);

        // 컬럼의 대소문자 name 과 동일하게 구성할것 !!!! plantcode , deptcode , workparty
        // items : 조회부 콤보박스 
        // mappings : 그리드 콤보박스 
        setDropdownData((prev) => ({
            ...prev,
            plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired) },
            timezone: { items: timezoneAll, mappings: CommonFunction.convertData(timezoneAll) },
        }));
      } catch (error) {
        console.error("드롭다운 데이터 로드 실패:", error);
      }
    };

    loadDropdownData();
  }, [apiUrl]);




  // 그리드 컬럼 정의
  const columnDefs = useMemo(
    () => [
      {
        field: "plantcode",
        headerName: "사업장",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropdownData.plantcode.mappings) }, // 드롭다운 콤보박스 세팅.
        // 드롭다운 세팅
        valueParser: (params) => params.newValue, // 실제 처리 값은 ValueMember
        valueFormatter: (params) => dropdownData.plantcode.mappings[params.value], // 드롭다운의 Display member 로 보이기.  
        editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"), //신규 추가 일 경우 만 수정가능
        minWidth: 100,
      },
      { field: "loadid", headerName: "부하ID", editable: false, minWidth: 100,},
      { field: "seq", headerName: "Seq", editable: false, minWidth: 50, hide: true},
      {
        field: "makedate",
        headerName: "등록일시",
        editable: false,
        valueFormatter: params => {
          const val = params.value;
          if (!val) return "";
          // 'T' 제거하고 밀리초 제거
          return val.split(".")[0].replace("T", " ");
        },
        minWidth: 120,
      },
      { field: "maker", headerName: "등록자", editable: false, minWidth: 100, },
      { field: "rowstatus", headerName: "상태", hide: true,},
    ],
    [dropdownData]
  );


  // sub 그리드 컬럼 정의
  const columnDefsSub = useMemo(
    () => [
      { field: "plantcode", headerName: "사업장", hide: true },
      { field: "loadid", headerName: "부하ID", editable: false, hide: true },
      { field: "seq", headerName: "Seq", editable: false, hide: true },
      {
        field: "timezone",
        headerName: "구분",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropdownData.timezone.mappings) }, // 드롭다운 콤보박스 세팅.
        // 드롭다운 세팅
        valueParser: (params) => params.newValue, // 실제 처리 값은 ValueMember
        valueFormatter: (params) => dropdownData.timezone.mappings[params.value], // 드롭다운의 Display member 로 보이기.  
        editable: true,
        minWidth: 100,
      },
      {
        headerName: '봄',
        children: [
          { field: "spr_s", headerName: "Start", editable: true, cellDataType: "number", cellClass: 'text-center',
            valueFormatter: params => {
              const value = params.value;
              if (value == null || value === "") return "";
              return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            },
            minWidth : 50
          },
          { field: "spr_e", headerName: "End", editable: true, cellDataType: "number", cellClass: 'text-center',
            valueFormatter: params => {
              const value = params.value;
              if (value == null || value === "") return "";
              return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            },
            minWidth : 50
          },
        ]
      },
      {
        headerName: '여름',
        children: [
          { field: "sum_s", headerName: "Start", editable: true, cellDataType: "number", cellClass: 'text-center',
            valueFormatter: params => {
              const value = params.value;
              if (value == null || value === "") return "";
              return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            },
            minWidth : 50
          },
          { field: "sum_e", headerName: "End", editable: true, cellDataType: "number", cellClass: 'text-center',
            valueFormatter: params => {
              const value = params.value;
              if (value == null || value === "") return "";
              return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            },
            minWidth : 50
          },
        ]
      },
      {
        headerName: '가을',
        children: [
          { field: "aut_s", headerName: "Start", editable: true, cellDataType: "number", cellClass: 'text-center',
            valueFormatter: params => {
              const value = params.value;
              if (value == null || value === "") return "";
              return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            },
            minWidth : 50
          },
          { field: "aut_e", headerName: "End", editable: true, cellDataType: "number", cellClass: 'text-center',
            valueFormatter: params => {
              const value = params.value;
              if (value == null || value === "") return "";
              return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            },
            minWidth : 50
          },
        ]
      },
      {
        headerName: '겨울',
        children: [
          { field: "win_s", headerName: "Start", editable: true, cellDataType: "number", cellClass: 'text-center',
            valueFormatter: params => {
              const value = params.value;
              if (value == null || value === "") return "";
              return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            },
            minWidth : 50
          },
          { field: "win_e", headerName: "End", editable: true, cellDataType: "number", cellClass: 'text-center',
            valueFormatter: params => {
              const value = params.value;
              if (value == null || value === "") return "";
              return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            },
            minWidth : 50
          },
        ]
      },
      { field: "rowstatus", headerName: "상태", hide: true,},
    ],
    [dropdownData]
  );



  // 그리드 1 에서 선택 한 행의 정보 로 그리드 2 호출하기 . 
  const grid1KeyData = useRef({ plantcode: "", loadid: "" }); // 그리드1 에서 선택한 사업장 과 부하id


  const searchinfosub = useMemo(() => ({
    address: "baseinfo/electricityloadpertimeslot-rr",
    params: {
      plantcode: grid1KeyData.current.plantcode ?? "",
      loadid: grid1KeyData.current.loadid ?? "",
    },
  }), [searchParams]); // grid1KeyData는 ref라 의존성에 넣을 필요 없음

  const tmpSelectedData = useRef({ plantcode: "", loadid: "" }); // 그리드1 에서 선택한 사업장 과 부하id 임시 저장

  const afterMainGridSelect = async (event) => {
    const selectedRows = event.api.getSelectedRows();

    if (selectedRows.length === 0) return; // 선택된 게 없으면 리턴

    // 수정 중인 데이터가 있을 때 확인 모달 Open
    const filteredData = gridSubData.filter(item => item.rowstatus == "U" || item.rowstatus == "D");
    if (addSubData.length !== 0 || filteredData.length > 0) {
      tmpSelectedData.current.plantcode = selectedRows[0].plantcode;
      tmpSelectedData.current.loadid = selectedRows[0].loadid;
      setIsModalOpen2(true);
      return;
    }

    grid1KeyData.current.plantcode = selectedRows[0].plantcode;
    grid1KeyData.current.loadid = selectedRows[0].loadid;


    inquireSubGrid();

  };

  /////////////// 조회 / 저장 완료시 서브 그리드 재조회 ////////////////////////////////////////////////////////////////////////
  const isFirstRender = useRef(true); // 최초 1 회 변경(excuteSuccesAndSearch 가 세팅되는 화면 오픈 시점 ) 감지 무시 용 변수
  const [selectedRowindex, setSelectedRowindex] = useState(0); // 선택 처리 하고자 하는  index 
  let matchedIndex = 0;
  // 그리드 2 데이터 조회 메서드
  const inquireSubGrid = async () => {
    await CommonFunction.fetchAndSetGridData({
      apiUrl,
      searchinfo: {
        ...searchinfosub,
        params: {
          ...searchinfosub.params,
          plantcode: grid1KeyData.current.plantcode ?? "",
          loadid: grid1KeyData.current.loadid ?? "",
        },
      },
      setGridData: setGridSubData,
      originalDataRef,
      primaryKeys: primaryKeys_g2,
      setAddData: setAddSubData,
    });
  };


  // 그리드 데이터 로드 후 행 포커스 함수
  const rowFocusing = async () => {
    if (gridData.length > 0 && gridRef.current.api) {
      // 그리드 데이터가 로드되었을 때 첫 번째 행에 포커스만 주고 선택은 하지 않음
      var firstRowIndex = 0;

      // 부하 추가 직후라면 추가된 데이터로 포커스
      if (isAddedLoad && addedLoadData.current.plantcode != "") {
        firstRowIndex = gridData.length;  // 초기값은 마지막 데이터
        // 저장 후 grid1KeyData에 넣어놨던 데이터와 같은 행 찾기
        gridRef.current.api.forEachNode((node) => {
          if (node.data["plantcode"] === addedLoadData.current.plantcode
            && node.data["loadid"] === addedLoadData.current.loadid) {
            firstRowIndex = node.rowIndex;  // 또는 node.rowIndex
          }
        });
        setIsAddedLoad(false);
        addedLoadData.current.plantcode = "";
        addedLoadData.current.loadid = "";
      }
      gridRef.current.api.deselectAll(); // 모든 선택 해제
      gridRef.current.api.ensureIndexVisible(firstRowIndex, 'top');
      gridRef.current.api.setFocusedCell(firstRowIndex, "plantcode");
      grid1KeyData.current.plantcode = gridData[firstRowIndex].plantcode;
      grid1KeyData.current.loadid = gridData[firstRowIndex].loadid;
    }
  };

  useEffect(() => {

    // 순차 코드 실행을 위함
    const runSequential = async () => {

      // 그리드 데이터 로드 후 행 포커스 함수
      await rowFocusing();

    };
    runSequential ();
  }, [gridData, columnDefs]);


  // grid1KeyData.current 값을 기반으로 서브 그리드 재조회 
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // 첫 번째 실행은 무시
      return;
    }

    // 서브 그리드를 초기화
    setGridSubData([]);

    // gridData가 비어있으면 조회하지 않음
    if (gridData.length < 1) return;

    // grid1KeyData와 일치하는 행의 index 찾기 
    matchedIndex = gridData.findIndex(
      (item) =>
        item.plantcode === grid1KeyData.current.plantcode &&
        item.loadid === grid1KeyData.current.loadid
    );

    if (matchedIndex === -1) {
      // 일치하는 항목이 없을 경우 gridData[0]을 사용
      grid1KeyData.current.plantcode = gridData[0].plantcode;
      grid1KeyData.current.loadid = gridData[0].loadid;
      matchedIndex = 0;
    } 
    if (selectedRowindex !== matchedIndex) {
      setSelectedRowindex(matchedIndex);
    }

    // 조회 
    inquireSubGrid();
  }, [gridData, excuteSuccesAndSearch]);

  // 부하 추가 버튼 이벤트
  const onClickAddLoad = async () => {
    setIsModalOpen(true);
  };

  // 부하 추가 예 Modal Confirm 함수
  const handleConfirm = async () => {
    // 추가할 데이터
    const newData = { plantcode : searchParams.plantcode?.value ?? "",
                       loadid : "",
                       seq : "",
                       makedate : "",
                       maker : JSON.parse(localStorage.getItem("userid")),
                       rowstatus : "C"
    };
    
    const url = `${apiUrl}baseinfo/electricityloadpertimeslot-lc`;
    const response = await axios.post(
      url,
      JSON.stringify(newData),
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.data.jhedher.status == "S") {
      addedLoadData.current.plantcode = response.data.jbody.plantcode;
      addedLoadData.current.loadid = response.data.jbody.loadid;
      setIsAddedLoad(true); // 부하 추가 직후
      setExcuteSuccesAndSearch(prev => !prev);  // 재조회
    }
    setIsModalOpen(false);
  };

  // 부하 추가 아니오 Modal Cancel 함수
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // 수정 중 좌측 그리드 클릭 예 Modal Cofirm 함수
  const handleConfirm2 = async () => {
    grid1KeyData.current.plantcode = tmpSelectedData.current.plantcode;
    grid1KeyData.current.loadid = tmpSelectedData.current.loadid;

    // 우측 그리드 조회 
    inquireSubGrid();
  };

  // 수정 중 좌측 그리드 클릭 아니오 Modal Cancel 함수
  const handleCancel2 = () => {
    setIsModalOpen2(false);
  };

  return (
    <>
    {/* 부하 추가 시 확인 모달 */}
    {isModalOpen && (
      <Auto_MessageModal
        activeModal={isModalOpen} // 열림 닫힘 여부 status
        onClose={handleCancel} // 닫힘 버튼 클릭 액션
        onSubmit={handleConfirm} // 예 버튼 클릭 시 실행할 함수
        title="WARNING" // title
        message={"수정 중인 내용은 저장되지 않습니다.\n신규 부하를 추가하시겠습니까?"} // 메시지
        headericon="failed"
      />
    )}
    {/* 우측 그리드 수정 중 좌측 그리드 클릭 시 모달 */}
    {isModalOpen2 && (
      <Auto_MessageModal
        activeModal={isModalOpen2} // 열림 닫힘 여부 status
        onClose={handleCancel2} // 닫힘 버튼 클릭 액션
        onSubmit={handleConfirm2} // 예 버튼 클릭 시 실행할 함수
        title="WARNING" // title
        message={"수정 중인 내용은 저장되지 않습니다.\n부하 상세 내용을 조회하시겠습니까?"} // 메시지
        headericon="failed"
      />
    )}
    <div className="space-y-5">
      <TitleBar title="부하 구분 별 시간대" />
      <Card noborder>
        <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-y-6">
          <div className="flex flex-col gap-y-1">
            <div className="flex flex-wrap gap-x-24 items-end gap-y-2">
              <Auto_SearchDropDown
                label="사업장"
                id="plantcode" // 로그인 사용자 사업장 기본 선택
                onChange={(item) => updateSearchParams("plantcode", item)}
                inputWidth="200px"
                horizontal
                dropDownData={dropdownData.plantcode.items}
                labelSpacing={'-mr-6'}
              />
            </div>
          </div>
          <div className="flex items-center justify-end h-full">
            <Auto_Button_Search_AGgrid
              searchinfo={searchinfo}
              setGridData={setGridData}
              excuteSuccesAndSearch={excuteSuccesAndSearch}
              originalDataRef={originalDataRef} // 변경 데이터 참조용 원본 데이터 복사 Map
              primaryKeys={primaryKeys_g1} // 복사 세트를 만들 Key 정보 
              enterSearch={enterSearch}
              setEnterSearch={setEnterSearch}
              setAddData={setAddData}
            />
          </div>
        </div>
      </Card>

      {Object.values(dropdownData).some(({ items }) => items.length === 0) ? (
        <Loading />
      ) : (
        <Card noborder>
          
          {/* 스플리터와 Auto_Card_Grid 쌍 */}
          <Auto_Spliter
            // 왼쪽 그리드 
            leftContent={
              <>
                <div className="flex justify-end mb-5">
                  <div className="flex space-x-2 justify-end">
                    <span title={!isModifyAllowed ? "수정 권한이 없습니다" : ""}>
                    <button
                      type={type}
                      disabled={!isModifyAllowed}
                      onClick={onClickAddLoad}
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
                  </div>
                </div>
                <Auto_AgGrid
                  gridType="sender"
                  primaryKeys={primaryKeys_g1}
                  gridData={gridData}
                  gridRef={gridRef}
                  columnDefs={columnDefs}
                  selectedRowindex={selectedRowindex}
                  originalDataRef={originalDataRef}
                  dropdownData={dropdownData}
                  onSelectionChanged={afterMainGridSelect} // 그리드1 에서 선택한 컬럼 데이터 등록 및 그리드 2 조회하기 
                />
              </>
            }
            // 오른쪽 그리드
            rightContent={
              <>
                <div className="flex justify-between items-start mb-5">
                  {/* 왼쪽: Excel 버튼들 */}
                  <div className="flex space-x-2">
                    <Auto_Button_Import_Excel
                      columnDefs={columnDefsSub}
                      setGridData={setGridSubData}
                    />
                    <Auto_Button_Export_Excel
                      columnDefs={columnDefsSub}
                      gridData={gridSubData}
                      title={"부하 구분 별 시간대"}
                    />
                    <Auto_Button_Column_State
                      columnDefs={columnDefsSub}
                      gridRef={gridSubRef}
                    />
                  </div>

                  {/* 오른쪽: Add/Delete/Save 버튼들 */}
                  <div className="flex space-x-2 justify-end">
                    <Auto_Button_Add_AGgrid
                      columnDefs={columnDefsSub}
                      gridRef={gridSubRef}
                      grid1KeyData={grid1KeyData}
                      setAddData={setAddSubData}
                    />
                    <Auto_Button_Delete_AGgrid
                      gridRef={gridSubRef}
                      gridData={gridSubData}
                      setAddData={setAddSubData}
                    />
                    <Auto_Button_Save_AGgrid
                      gridRef={gridSubRef}
                      modifiedData={[...gridSubData, ...addSubData]} // 그리드 의 모든 데이터 와 삭제 된 데이터 를 전달 함. ( 그리드에는 기존 행 과 U,C,P 인 상태의 행이 있음 Auto_Button_Save_AGgrid 에서 상태가 있는 행들만 걸러냄. ) 
                      modifyAddress="baseinfo/electricityloadpertimeslot-cud"
                      setExcuteSuccesAndSearch={setExcuteSuccesAndSearch}
                      setAddData={setAddSubData}
                    />
                  </div>
                </div>
                <Auto_AgGrid
                  gridType="recipient" // 데이터를 전달받아 처리하는 그리드
                  primaryKeys={primaryKeys_g2}
                  gridData={gridSubData}
                  gridRef={gridSubRef}
                  columnDefs={columnDefsSub}
                  originalDataRef={originalDataRef}
                  dropdownData={dropdownData}
                  // onRowClicked={afterSubGridSelect}// 그리드 의 포커스 index 공유 하기 . (팝업을 사용할 경우)
                />
              </>
            }
          />
        </Card>
      )}
    </div>
    </>
  );
};

export default ElectricityLoadPerTimeSlot;