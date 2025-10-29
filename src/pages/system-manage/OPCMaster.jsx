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
import { AllCommunityModule, ModuleRegistry, } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const OPCMaster = () => {
  //////////////////////////////////////////////////////////////////////// AG 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const apiUrl = useApiUrl();
  const gridRef = useRef(); // 
  const [gridData, setGridData] = useState([]); // 그리드 매핑 데이터 
  const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
  const originalDataRef = useRef(new Map()); // U 업데이트위한 useRef
  const [addData, setAddData] = useState([]); // 추가 대상 리스트
  //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////

  const primaryKeys = ["plantcode", "deviceid"]; // 그리드 의 기본 키  
  const [ enterSearch, setEnterSearch ] = useState(false);  // 엔터 키로 검색하기 위한 변수

  // 검색 조건 
  const [searchParams, setSearchParams] = useState({
    plantcode: "",
    deviceid: "",
    devicename: "",
    tagid: "",
    tagname: "",
    useflag: "",
  });
  // 검색조건 변경 즉시 반영  (setSearchParams 이후 선언 할것)
  const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
  // 조회 조건 및 조회 정보 
  const searchinfo = useMemo(
    () => ({
      address: "sys/opcmaster-r",
      params: {
        plantcode: searchParams.plantcode?.value ?? "",
        deviceid: searchParams.deviceid ?? "",
        devicename: searchParams.devicename ?? "",
        tagid: searchParams.tagid ?? "",
        tagname: searchParams.tagname ?? "",
        useflag: searchParams.useflag ?? "",
      },
    }),
    [searchParams]
  );

  // 드롭다운 데이터 상태
  const [dropdownData, setDropdownData] = useState({
    plantcode: { items: [], mappings: {} },
  });


  // 드롭다운 데이터 로드
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [plantcodeAll, plantcodeRequired, deptcodeAll, workpartyAll] =
          await Promise.all([
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode" }),  // 조회부 콤보박스  
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }),  // 그리드 콤보박스 ( 필수 선택 )
          ]);

        // 컬럼의 대소문자 name 과 동일하게 구성할것 !!!! plantcode , deptcode , workparty
        // items : 조회부 콤보박스 
        // mappings : 그리드 콤보박스 
        setDropdownData({
          plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired) },
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
      { field: "deviceid",
        headerName: "DEVICE ID",
        editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"), // 신규 추가 일 경우 만 수정가능.
        minWidth: 130,
      },
      { field: "devicename", headerName: "DEVICE 명", editable: true, minWidth: 130, },
      { field: "tagid",
        headerName: "Tag ID",
        editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"), // 신규 추가 일 경우 만 수정가능.
        minWidth: 130,
      },
      { field: "tagname", headerName: "Tag 명", editable: true, minWidth: 130, },
      { field: "endpointurl", headerName: "IP", editable: true, minWidth: 150, },
      { field: "port",
        headerName: "PORT",
        editable: true,
        cellDataType: "number",
        valueParser: params => parseInt(params.newValue),    // integer
        minWidth: 110,
      },
      { field: "remark", headerName: "비고", editable: true, minWidth: 130, },
      { 
        field: "useflag", 
        headerName: "사용여부", 
        editable: false, 
        cellRenderer: (params) => (<Auto_Grid_Checkbox_AGgrid value={params.value} onValueChange={(newValue) => params.setValue(newValue)} />),
        minWidth: 90,
      },

      { field: "nodeid", headerName: "태그nodeid", editable: true, hide: true },
      { field: "datatype", headerName: "데이터타입", editable: true, hide: true },
      { field: "accesstype", headerName: "권한", editable: true, hide: true },
      { field: "unit", headerName: "단위", editable: true, hide: true },
      { field: "rowstatus", headerName: "상태", hide: true },
    ],
    [dropdownData]
  );



  return (
    <div className="space-y-5">
      <TitleBar title="OPC 마스터" />
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
                labelSpacing={'mr-3'}
              />
              <Auto_Label_Text_Set
                label="DEVICE ID"
                value={searchParams.deviceid}
                onChange={(e) => updateSearchParams("deviceid", e.target.value)}
                labelSpacing={'mr-1'}
                setEnterSearch={setEnterSearch}
              />
              <Auto_Label_Text_Set
                label="DEVICE 명"
                value={searchParams.devicename}
                onChange={(e) => updateSearchParams("devicename", e.target.value)}
                labelSpacing={'mr-1'}
                setEnterSearch={setEnterSearch}
              />
            </div>
            <div className="flex flex-wrap gap-x-24 items-center gap-y-1">
              <Auto_Label_Text_Set
                label="Tag ID"
                value={searchParams.tagid}
                onChange={(e) => updateSearchParams("tagid", e.target.value)}
                labelSpacing={'mr-1'}
                setEnterSearch={setEnterSearch}
              />
              <Auto_Label_Text_Set
                label="Tag 명"
                value={searchParams.tagname}
                onChange={(e) => updateSearchParams("tagname", e.target.value)}
                labelSpacing={'mr-1'}
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
                title={"OPC 마스터"}
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
                modifyAddress="sys/opcmaster-cud"
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
  );
};

export default OPCMaster;