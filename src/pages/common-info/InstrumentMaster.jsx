import {
  Auto_GridCellButtonRenderer, CommonFunction, Auto_POPWorkerMaster, Auto_Label_Text_Set,
  Auto_Radio_Useflag, TitleBar, Auto_SearchDropDown, DropDownItemGetter,
  Auto_AgGrid, Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid,
  Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_InputDate_AGgrid, Auto_Grid_Checkbox_AGgrid, Auto_Button_Column_State
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import { AllCommunityModule, ModuleRegistry, colorSchemeDarkBlue, themeQuartz, colorSchemeLight } from "ag-grid-community";

import useDarkmode from "@/services/hooks/useDarkMode";
ModuleRegistry.registerModules([AllCommunityModule]);

const InstrumentMaster = () => {
  //////////////////////////////////////////////////////////////////////// AG 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const apiUrl = useApiUrl();
  const gridRef = useRef(); // 
  const [gridData, setGridData] = useState([]); // 그리드 매핑 데이터 
  const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
  const originalDataRef = useRef(new Map()); // U 업데이트위한 useRef
  const [addData, setAddData] = useState([]); // 추가 대상 리스트
  //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const primaryKeys = ["plantcode", "instrumentid"]; // 그리드 의 기본 키
  const [ enterSearch, setEnterSearch ] = useState(false);  // 엔터 키로 검색하기 위한 변수

  // 검색 조건 
  const [searchParams, setSearchParams] = useState({
    plantcode: "",
    instrumentid: "",
    instrumentname: "",
    useflag: "",
  });
  // 검색조건 변경 즉시 반영  (setSearchParams 이후 선언 할것)
  const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
  // 조회 조건 및 조회 정보 
  const searchinfo = useMemo(
    () => ({
      address: "baseinfo/measureequipmentmanster-r",
      params: {
        plantcode: searchParams.plantcode?.value ?? "",
        instrumentid: searchParams.instrumentid ?? "",
        instrumentname: searchParams.instrumentname ?? "",
        useflag: searchParams.useflag ?? "",
      },
    }),
    [searchParams]
  );

  // 드롭다운 데이터 상태
  const [dropdownData, setDropdownData] = useState({
    plantcode: { items: [], mappings: {} },
    managegrade: { items: [], mappings: {} },
  });


  // 드롭다운 데이터 로드
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [plantcodeAll, plantcodeRequired, managegrade] =
          await Promise.all([
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode" }),  // 조회부 콤보박스  
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }),  // 그리드 콤보박스 ( 필수 선택 )
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "INSMANGRADE", }),  // 그리드 콤보박스 ( 필수 선택 )
          ]);

        // 컬럼의 대소문자 name 과 동일하게 구성할것 !!!! plantcode , deptcode , workparty
        // items : 조회부 콤보박스 
        // mappings : 그리드 콤보박스 
        setDropdownData({
          plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired) },
          managegrade: { items: managegrade, mappings: CommonFunction.convertData(managegrade) },
        });
      } catch (error) {
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
        editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"), // 신규 추가 일 경우 만 수정가능. 
      },
      // {
      //   headerName: "작업자ID",
      //   field: "workerid",
      //   // 그리드 셀 에  팝업 을 활성화시키는 버튼을 세팅 
      //   cellRenderer: (params) => (<Auto_GridCellButtonRenderer value={params.value} data={params.data} isDark={isDark} setisPopupOpen={setIsWorkerPopupOpen} />),
      // },
      { field: "instrumentid", headerName: "계량기ID", editable: false }, // 신규 추가 일 경우 만 수정가능 
      { field: "instrumentName", headerName: "계량기명", editable: true },
      { field: "calibrationcycle", headerName: "검교정주기", editable: true, cellDataType: "number" ,cellClass: 'text-right'},
      {
        field: "purchasedate",
        headerName: "구입일",
        editable: false,
        cellRenderer: (params) => (<Auto_Grid_InputDate_AGgrid value={params.value} onValueChange={(newValue) => params.setValue(newValue)} />),
      },
      { field: "spec", headerName: "사양", editable: true },
      {
        field: "managegrade",
        headerName: "관리등급",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropdownData.managegrade.mappings) }, // 드롭다운 콤보박스 세팅.
        // 드롭다운 세팅
        valueParser: (params) => params.newValue, // 실제 처리 값은 ValueMember
        valueFormatter: (params) => dropdownData.managegrade.mappings[params.value], // 드롭다운의 Display member 로 보이기. 
        editable: true,
      },
      { field: "manageemp", headerName: "관리자", editable: true },
      { field: "ipaddress", headerName: "IP주소", editable: true },
      { field: "remark", headerName: "비고", editable: true },
      { field: "devicename", headerName: "디바이스", editable: true },
      { 
        field: "useflag", 
        headerName: "사용여부", 
        editable: false, 
        cellRenderer: (params) => (<Auto_Grid_Checkbox_AGgrid value={params.value} onValueChange={(newValue) => params.setValue(newValue)} />),
      },
      { field: "rowstatus", headerName: "상태", hide: true },
    ],
    [dropdownData]
  );

  return (
    <div className="space-y-5">
      <TitleBar title="계량기 관리" />
      {/* 조회부 */}
      <Card noborder>
        <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-y-6">
          <div className="flex flex-col gap-y-1">
            <div className="flex flex-wrap gap-x-24 items-center gap-y-1">
              <Auto_SearchDropDown
                label="사업장"
                id="plantcode" // 로그인 사용자 사업장 기본 선택
                onChange={(item) => updateSearchParams("plantcode", item)}
                inputWidth="217px"
                horizontal
                dropDownData={dropdownData.plantcode.items}
                labelSpacing={'-mr-3'}
              />
              <Auto_Label_Text_Set
                label="계량기ID"
                value={searchParams.instrumentid}
                onChange={(e) => updateSearchParams("instrumentid", e.target.value)}
                labelSpacing={'-mr-5'}
                setEnterSearch={setEnterSearch}
              />
              <Auto_Label_Text_Set
                label="계량기명"
                value={searchParams.instrumentname}
                onChange={(e) => updateSearchParams("instrumentname", e.target.value)}
                labelSpacing={'-mr-5'}
                setEnterSearch={setEnterSearch}
              />
              <Auto_Radio_Useflag
                useValue={searchParams.useflag}
                setUseValue={(value) => updateSearchParams("useflag", value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-end h-full">
            <Auto_Button_Search_AGgrid
              searchinfo={searchinfo}
              setGridData={setGridData}
              excuteSuccesAndSearch={excuteSuccesAndSearch}
              originalDataRef={originalDataRef} // 변경 데이터 참조용 원본 데이터 복사 Map
              primaryKeys={primaryKeys} // 복사 세트를 만들 Key 정보 
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
          <div className="flex justify-between mb-5">
            <div className="flex space-x-2 ">
              <Auto_Button_Import_Excel
                columnDefs={columnDefs}
                setGridData={setGridData}
              />
              <Auto_Button_Export_Excel
                columnDefs={columnDefs}
                gridData={gridData}
                title={"계량기 관리"}
              />
              <Auto_Button_Column_State
                columnDefs={columnDefs}
                gridRef={gridRef}
              />
            </div>
            <div className="flex space-x-2">
              <Auto_Button_Add_AGgrid
                columnDefs={columnDefs}
                gridRef={gridRef}
                setAddData={setAddData}
              />
              <Auto_Button_Delete_AGgrid
                gridRef={gridRef}
                gridData={gridData}
                setAddData={setAddData}
              />
              <Auto_Button_Save_AGgrid
                modifiedData={[...gridData, ...addData]}
                modifyAddress="baseinfo/instrumentmaster-cud"
                setExcuteSuccesAndSearch={setExcuteSuccesAndSearch}
                gridRef={gridRef}
              />
            </div>
          </div>
          <Auto_AgGrid
            gridType="recipient" // 데이터를 전달받아 처리하는 그리드
            primaryKeys={primaryKeys}
            gridData={gridData}
            gridRef={gridRef}
            columnDefs={columnDefs}
            originalDataRef={originalDataRef}
            dropdownData={dropdownData}
          />
        </Card>
      )}
    </div>
  )
};

export default InstrumentMaster;