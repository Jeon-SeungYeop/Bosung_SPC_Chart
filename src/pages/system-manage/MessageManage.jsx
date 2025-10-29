import {
  Auto_GridCellButtonRenderer, CommonFunction, Auto_POPWorkerMaster, Auto_Label_Text_Set,
  Auto_Radio_Useflag, TitleBar, Auto_SearchDropDown, DropDownItemGetter,
  Auto_AgGrid,Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid,
  Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Button_Column_State
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import { AllCommunityModule, ModuleRegistry,} from "ag-grid-community"; 

ModuleRegistry.registerModules([AllCommunityModule]);

const MessageManage = () => {
  //////////////////////////////////////////////////////////////////////// AG 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const apiUrl = useApiUrl();
  const gridRef = useRef(); // 
  const [gridData, setGridData] = useState([]); // 그리드 매핑 데이터 
  const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
  const originalDataRef = useRef(new Map()); // U 업데이트위한 useRef
  const [addData, setAddData] = useState([]); // 추가 대상 리스트
  //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const primaryKeys = ["plantcode", "msgcode", "languige"]; // 그리드 의 기본 키
  const [ enterSearch, setEnterSearch ] = useState(false);  // 엔터 키로 검색하기 위한 변수

  // 검색 조건 
  const [searchParams, setSearchParams] = useState({
    plantcode: "",
    msgcode: "",
    message: "",
    languige: "",
    msgtype: "",
  });
  // 검색조건 변경 즉시 반영  (setSearchParams 이후 선언 할것)
  const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
  // 조회 조건 및 조회 정보 
  const searchinfo = useMemo(
    () => ({
      address: "sys/messagemanage-r",
      params: {
        plantcode: searchParams.plantcode?.value ?? "",
        msgcode: searchParams.msgcode ?? "",
        message: searchParams.message ?? "",
        languige: searchParams.languige?.value ?? "",
        msgtype: searchParams.msgtype?.value ?? "",
      },
    }),
    [searchParams]
  );

  // 드롭다운 데이터 상태
  const [dropdownData, setDropdownData] = useState({
    plantcode: { items: [], mappings: {} },
    msgtype: { items: [], mappings: {} },
    languige: { items: [], mappings: {} },
  });
  // 드롭다운 데이터 로드
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [plantcodeAll, plantcodeRequired, msgtypeAll, languigeRequired, languigeAll ] =
          await Promise.all([
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode" }),  // 조회부 콤보박스  
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }),  // 그리드 콤보박스 ( 필수 선택 )
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "MESSAGETYPE" }),
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "lang", param4: "X" }),  // 그리드 콤보박스 ( 필수 선택 )
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "lang" }),
          ]);

        // 컬럼의 대소문자 name 과 동일하게 구성할것 !!!! plantcode , deptcode , workparty
        // items : 조회부 콤보박스 
        // mappings : 그리드 콤보박스 
        setDropdownData({
          plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired) },
          msgtype: { items: msgtypeAll, mappings: CommonFunction.convertData(msgtypeAll) },
          languige: { items: languigeAll, mappings: CommonFunction.convertData(languigeRequired) },
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
        minWidth: 150,
      },
      // {
      //   headerName: "작업자ID",
      //   field: "workerid",
      //   // 그리드 셀 에  팝업 을 활성화시키는 버튼을 세팅 
      //   cellRenderer: (params) => (<Auto_GridCellButtonRenderer value={params.value} data={params.data} isDark={isDark} setisPopupOpen={setIsWorkerPopupOpen} />),
      // },
      { field: "msgcode",  headerName: "메시지코드",editable:false, minWidth: 100,}, // 신규 추가 일 경우 만 수정가능 
      { 
        field: "languige", 
        headerName: "언어", 
        editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P") ,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropdownData.languige.mappings) }, // 드롭다운 콤보박스 세팅.
        // 드롭다운 세팅
        valueParser: (params) => params.newValue, // 실제 처리 값은 ValueMember
        valueFormatter: (params) => dropdownData.languige.mappings[params.value], // 드롭다운의 Display member 로 보이기. 
        minWidth: 110,
      },
      {
        field: "msgtype",
        headerName: "메시지타입",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropdownData.msgtype.mappings) },
        editable: true,
        // 드롭다운 세팅
        valueParser: (params) => params.newValue,
        valueFormatter: (params) => dropdownData.msgtype.mappings[params.value],
        minWidth: 130,
      },
      { field: "message", headerName: "메시지", editable: true, minWidth: 400, },
      { field: "rowstatus", headerName: "상태", hide: true },
    ],
    [dropdownData]
  );

  return (
    <div className="space-y-5">
      <TitleBar title="시스템 메시지 관리" />
      {/* 조회부 */}
      <Card noborder>
        <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-y-6">
          <div className="flex flex-col gap-y-1">
            <div className="flex flex-wrap gap-x-24 items-end gap-y-1">
              <Auto_SearchDropDown
                label="사업장"
                id="plantcode" // 로그인 사용자 사업장 기본 선택
                onChange={(item) => updateSearchParams("plantcode", item)}
                inputWidth="217px"
                horizontal
                labelSpacing="mr-3"
                dropDownData={dropdownData.plantcode.items}
              />
              <Auto_Label_Text_Set
                label="메시지코드"
                value={searchParams.msgcode}
                onChange={(e) => updateSearchParams("msgcode", e.target.value)}
                labelSpacing={'mr-1'}
                setEnterSearch={setEnterSearch}
              />
              <Auto_Label_Text_Set
                label="메시지"
                value={searchParams.message}
                onChange={(e) => updateSearchParams("message", e.target.value)}
                labelSpacing={'mr-1'}
                setEnterSearch={setEnterSearch}
              />
            </div>
            <div className="flex flex-wrap gap-x-24 items-center gap-y-1">
              <Auto_SearchDropDown
                label="언어"
                onChange={(item) => updateSearchParams("languige", item)}
                inputWidth="217px"
                horizontal
                labelSpacing="mr-3"
                dropDownData={dropdownData.languige.items}
              />
              <Auto_SearchDropDown
                label="메시지타입"
                onChange={(item) => updateSearchParams("msgtype", item)}
                inputWidth="217px"
                horizontal
                labelSpacing="mr-3"
                dropDownData={dropdownData.msgtype.items}
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
                title={"시스템 메시지 관리"}
              />
              <Auto_Button_Column_State
                columnDefs={columnDefs}
                gridRef={gridRef}
              />
            </div>
            <div className="flex space-x-2">
              <Auto_Button_Add_AGgrid
               // setExcuteSuccesAndSearch={setExcuteSuccesAndSearch}
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
                modifyAddress="sys/messagemanage-cud"
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

export default MessageManage;
