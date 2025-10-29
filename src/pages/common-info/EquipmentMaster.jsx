import {
  Auto_GridCellButtonRenderer, CommonFunction, Auto_POPWorkerMaster, Auto_Label_Text_Set,
  Auto_Radio_Useflag, TitleBar, Auto_SearchDropDown, DropDownItemGetter,
  Auto_AgGrid, Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid,
  Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_InputDate_AGgrid, Auto_Spliter, Auto_Grid_Checkbox_AGgrid,
  Auto_Button_Column_State
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import { AllCommunityModule, ModuleRegistry, colorSchemeDarkBlue, themeQuartz, colorSchemeLight } from "ag-grid-community";
import useDarkmode from "@/services/hooks/useDarkMode";
import Auto_Image_Box from "@/components/autocomponent/common/Auto_Image_Box";
ModuleRegistry.registerModules([AllCommunityModule]);


const EquipmentMaster = () => {
  //////////////////////////////////////////////////////////////////////// AG 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const apiUrl = useApiUrl();
  const gridRef = useRef(); // 
  const [gridData, setGridData] = useState([]); // 그리드 매핑 데이터 
  const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
  const originalDataRef = useRef(new Map()); // U 업데이트위한 useRef
  const [addData, setAddData] = useState([]); // 추가 대상 리스트
  //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const primaryKeys = ["plantcode", "equipmentid"]; // 그리드 의 기본 키
  const [ enterSearch, setEnterSearch ] = useState(false);  // 엔터 키로 검색하기 위한 변수

  // 검색 조건 
  const [searchParams, setSearchParams] = useState({
    plantcode: "",
    equipmentid: "",
    equipmentname: "",
    sitecode: "",
    factorycode: "",
    useflag: "",
  });
  // 검색조건 변경 즉시 반영  (setSearchParams 이후 선언 할것)
  const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
  // 조회 조건 및 조회 정보 
  const searchinfo = useMemo(
    () => ({
      address: "baseinfo/equipmentmaster-r",
      params: {
        plantcode: searchParams.plantcode?.value ?? "",
        equipmentid: searchParams.equipmentid ?? "",
        equipmentname: searchParams.equipmentname ?? "",
        sitecode: searchParams.sitecode?.value ?? "",
        factorycode: searchParams.factorycode?.value ?? "",
        useflag: searchParams.useflag ?? "",
      },
    }),
    [searchParams]
  );
  // 드롭다운 데이터 상태
  const [dropdownData, setDropdownData] = useState({
    plantcode: { items: [], mappings: {} },
    equipmentgrad: { items: [], mappings: {} },
    equipmenttype: { items: [], mappings: {} },
    instrumentlinked: { items: [], mappings: {} },
    managedepart: { items: [], mappings: {} },
    sitecode: { items: [], mappings: {} },
    factorycode: { items: [], mappings: {} },
    processcode: { items: [], mappings: {} },
  });
  // 드롭다운 데이터 로드
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [plantcodeAll, plantcodeRequired, equipgrade, equiptype, instrumentlinked, managedepart, sitecode, sitecodeAll, factoryCodeRequired, factorycodeAll,ProcessCodeRequired, ProcesscodeAll] =
          await Promise.all([
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode" }),  // 조회부 콤보박스  
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }),  // 그리드 콤보박스 ( 필수 선택 )
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "EquipmentGrade", param4: "X" }),
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "EquipmentType", param4: "X" }),
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "YESNO", param4: "X" }),
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "DEPTCODE", param4: "X" }),
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "sitecode", param4: "X" }),  // 그리드 콤보박스 ( 필수 선택 )
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "sitecode"}),
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "factorycode", param4: "X" }),
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "factorycode" }),
            DropDownItemGetter(apiUrl, { param1: "process", param2: "1000", param3: "processcode", param4: "X" }),
            DropDownItemGetter(apiUrl, { param1: "process", param2: "1000", param3: "processcode" }),
          ]);

        // 컬럼의 대소문자 name 과 동일하게 구성할것 !!!! plantcode , deptcode , workparty
        // items : 조회부 콤보박스 
        // mappings : 그리드 콤보박스 
        setDropdownData({
          plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired) },
          equipmentgrad: { items: equipgrade, mappings: CommonFunction.convertData(equipgrade) },
          equipmenttype: { items: equiptype, mappings: CommonFunction.convertData(equiptype) },
          instrumentlinked: { items: instrumentlinked, mappings: CommonFunction.convertData(instrumentlinked) },
          managedepart: { items: managedepart, mappings: CommonFunction.convertData(managedepart) },
          sitecode: { items: sitecodeAll, mappings: CommonFunction.convertData(sitecode) },
          factorycode: { items: factorycodeAll, mappings: CommonFunction.convertData(factoryCodeRequired)},
          processcode: { items: ProcesscodeAll, mappings: CommonFunction.convertData(ProcessCodeRequired)}
        });
      } catch (error) {
      }
    };

    loadDropdownData();
  }, [apiUrl]);
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
      { field: "equipmentid", headerName: "설비ID", minWidth: 150, }, // 신규 추가 일 경우 만 수정가능 
      { field: "equipmentname", headerName: "설비명", editable: true, minWidth: 150, },
      {
        field: "factorycode",
        headerName: "공장구분",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropdownData.factorycode.mappings) },
        editable: true,
        // 드롭다운 세팅
        valueParser: (params) => params.newValue,
        valueFormatter: (params) => dropdownData.factorycode.mappings[params.value],
        minWidth: 150,
      }, 
      {
        field: "sitecode", headerName: "설비위치",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropdownData.sitecode.mappings) },
        editable: true,
        // 드롭다운 세팅
        valueParser: (params) => params.newValue,
        valueFormatter: (params) => dropdownData.sitecode.mappings[params.value],
        minWidth: 150,
      },
      {
        field: "processcode",
        headerName: "공정",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropdownData.processcode.mappings) },
        editable: true,
        // 드롭다운 세팅
        valueParser: (params) => params.newValue,
        valueFormatter: (params) => dropdownData.processcode.mappings[params.value],
        minWidth: 150,
      }, 
      {
        field: "powerusage", headerName: "일간최대전력", editable: true, cellClass: 'text-right',
        valueFormatter: params => {
          const value = params.value;
          if (value == null || value === "") return "";
          return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
        minWidth: 150,
      },
      {  
        field: "equipmenttype",
        headerName: "설비타입",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropdownData.equipmenttype.mappings) },
        editable: true,
        // 드롭다운 세팅
        valueParser: (params) => params.newValue,
        valueFormatter: (params) => dropdownData.equipmenttype.mappings[params.value],
        minWidth: 150,
      },
      {
        field: "controlpriority",
        headerName: "우선순위",
        editable: true,
        cellDataType: "number",
        minWidth: 90,
        cellClass: "text-end"
      },
      {
        field: "targetusageh",
        headerName: "시간당 목표 사용량",
        editable: true,
        cellDataType: "number",
        minWidth: 150,
        cellClass: "text-end"
      },
      {
        field: "purchasedate",
        headerName: "구입일",
        editable: false,
        cellRenderer: (params) => (<Auto_Grid_InputDate_AGgrid value={params.value} onValueChange={(newValue) => params.setValue(newValue)} />),
        minWidth: 120,
      },
      {
        field: "purchaseprice",
        headerName: "구매금액",
        editable: true,
        cellClass: 'text-right',
        cellDataType: "number", 
        valueFormatter: params => {
          const value = params.value;
          if (value == null || value === "") return "";
          return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
        minWidth: 150,
      },
      {
        field: "equipmentgrad",
        headerName: "설비등급",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropdownData.equipmentgrad.mappings) },
        editable: true,
        // 드롭다운 세팅
        valueParser: (params) => params.newValue,
        valueFormatter: (params) => dropdownData.equipmentgrad.mappings[params.value],
        minWidth: 130,
      },
      {
        field: "productiondate",
        headerName: "제조일자",
        editable: false,
        cellRenderer: (params) => (<Auto_Grid_InputDate_AGgrid value={params.value} onValueChange={(newValue) => params.setValue(newValue)} />),
        minWidth: 120,
      },
      { field: "manufacturer", headerName: "제조업체", editable: true, minWidth: 150, },
      { field: "manager", headerName: "관리자", editable: true, minWidth: 150, },
      {
        field: "temperatureholdrange", headerName: "온도유지범위", editable: true, cellClass: 'text-right',
        valueFormatter: params => {
          const value = params.value;
          if (value == null || value === "") return "";
          return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
        minWidth: 150,
      },

      //{ field: "carbotarget", headerName: "탄소배출목표량(일)/tCO2)", editable: true, cellDataType: "number", cellClass: 'text-right',
      //      valueFormatter: params => {
      //        const value = params.value;
      //        if (value == null || value === "") return "";
      //        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      //      },
      //      minWidth : 200,
      //},


      // {
      //   field: "carbonemissiontarget", headerName: "탄소배출목표량(월/tCO2)ff",editable: true, cellDataType: "number",  cellClass: 'text-right',
      //   valueFormatter: params => {
      //     const value = params.value;
      //     if (value == null || value === "") return "";
      //     return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      //   },
      //   minWidth: 190,
      // }, 

      {
        field: "workinghours", headerName: "가동시간", editable: true, cellClass: 'text-right',
        valueFormatter: params => {
          const value = params.value;
          if (value == null || value === "") return "";
          return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
        minWidth: 150,
      },
      { field: "energysource", headerName: "주요에너지원", editable: true, minWidth: 110, },
      {
        field: "ratedpower", headerName: "정격소비전력", editable: true, cellClass: 'text-right',
        valueFormatter: params => {
          const value = params.value;
          if (value == null || value === "") return "";
          return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
        minWidth: 150,
      },
      { field: "ratedunit", headerName: "정격단위", editable: true, minWidth: 150, },
      {
        field: "instrumentlinked",
        headerName: "IOT계측연동여부",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropdownData.instrumentlinked.mappings) },
        editable: true,
        // 드롭다운 세팅
        valueParser: (params) => params.newValue,
        valueFormatter: (params) => dropdownData.instrumentlinked.mappings[params.value],
        minWidth: 150,
      },
      {
        field: "installationdate",
        headerName: "설치일",
        editable: false,
        cellRenderer: (params) => (<Auto_Grid_InputDate_AGgrid value={params.value} onValueChange={(newValue) => params.setValue(newValue)} />),
        minWidth: 120,
      },
      {
        field: "managedepart",
        headerName: "담당부서",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropdownData.managedepart.mappings) },
        editable: true,
        // 드롭다운 세팅
        valueParser: (params) => params.newValue,
        valueFormatter: (params) => dropdownData.managedepart.mappings[params.value],
        minWidth: 150,
      },
      { 
        field: "useflag", 
        headerName: "사용여부", 
        editable: false, 
        cellRenderer: (params) => (<Auto_Grid_Checkbox_AGgrid value={params.value} onValueChange={(newValue) => params.setValue(newValue)} />),
        minWidth: 85,
      },
      { field: "rowstatus", headerName: "상태", minWidth: 85, hide: true},
    ],
    [dropdownData]
  );

  //////////////////////////// Image Box 부분 /////////////////////
  // 그리드1에서 선택한 행의 정보로 Img src 가져오기 
  const grid1keyData = useRef({ plantcode: "", equipmentid: "" }); // 그리드 에서 선택한 설비 데이터
  const [isImageSearchPoint, setIsImageSearchPoint] = useState(true);
  const afterMainGridSelect = async (event) => { // imagebox 사용시 getselectrow가 아닌 getFocusedCell로 변경
    const focusedCell = gridRef.current.api.getFocusedCell();
    const rowNode = gridRef.current.api.getDisplayedRowAtIndex(focusedCell.rowIndex);

    grid1keyData.current.plantcode = rowNode.data.plantcode;
    grid1keyData.current.equipmentid = rowNode.data.equipmentid
    setIsImageSearchPoint(prev => !prev); // 클릭 상태 변경  
  };


  // 데이터베이스 에서 이미지를 호출 하도록 하는 정보
  const getsearchinfoEquipmentImage = () => ({
    params: {
      plantcode: grid1keyData.current.plantcode ?? "", // 사업장 
      getimagetype: "EQUIPMENT",  // 이미지 를 가져올 종류 * Equipmemtn : 설비이미지 
      code: grid1keyData.current.equipmentid ?? "", // 설비 ID
      seq: 1, // 설비 Seq    !!! seq 를 0 으로 고정하여 전달시 순차적으로 자동채번하여 등록된다.
    }
  });
  // 저장 완료 시 오른쪽(서브) 그리드 재조회
  const isFirstRender = useRef(true); // 최초 1 회 변경(excuteSuccesAndSearch 가 세팅되는 화면 오픈 시점 ) 감지 무시 용 변수
  const [selectedRowindex, setSelectedRowindex] = useState(0); // 선택 처리 하고자 하는  index 
  let matchedIndex = 0;
  // grid1KeyData.current 값을 기반으로 서브 그리드 재조회 
  /*useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // 첫 번째 실행은 무시
      return;
    }

    // 서브 그리드를 초기화
    //setGridSubData([]);

    // gridData가 비어있으면 조회하지 않음
    if (gridData.length < 1) {
      grid1keyData.current.plantcode = "";
      grid1keyData.current.equipmentid = "";
      return;
    }

    // grid1KeyData와 일치하는 행의 index 찾기 
    matchedIndex = gridData.findIndex(
      (item) =>
        item.plantcode === grid1keyData.current.plantcode &&
        item.equipmentid === grid1keyData.current.equipmentid
    );

    if (matchedIndex === -1) {
      // 일치하는 항목이 없을 경우 gridData[0]을 사용
      grid1keyData.current.plantcode = gridData[0].plantcode;
      grid1keyData.current.equipmentid = gridData[0].equipmentid;
      matchedIndex = 0;
    }
    if (selectedRowindex !== matchedIndex) {
      setSelectedRowindex(matchedIndex);
    }

  }, [gridData, excuteSuccesAndSearch]);*/
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // 첫 번째 실행은 무시
      return;
    }

    if (gridData.length > 0 && gridRef.current.api) {
      // 그리드 데이터가 로드되었을 때 첫 번째 행에 포커스만 주고 선택은 하지 않음
      const firstRowIndex = 0;
      gridRef.current.api.deselectAll(); // 모든 선택 해제
      gridRef.current.api.ensureIndexVisible(firstRowIndex, 'top');
      gridRef.current.api.setFocusedCell(firstRowIndex, "plantcode");
      grid1keyData.current.plantcode = gridData[firstRowIndex].plantcode;
      grid1keyData.current.equipmentid = gridData[firstRowIndex].equipmentid;
      setIsImageSearchPoint(prev => !prev); // 사진 조회 상태 변경
    }
  }, [gridData, columnDefs]);

  return (
    <div className="space-y-5">
      <TitleBar title="설비 마스터" />
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
              <Auto_SearchDropDown
                label="공장구분"
                onChange={(item) => updateSearchParams("factorycode", item)}
                inputWidth="217px"
                horizontal
                dropDownData={dropdownData.factorycode.items}
                labelSpacing={'mr-3'}
              />
              <Auto_SearchDropDown
                label="설비위치"
                onChange={(item) => updateSearchParams("sitecode", item)}
                inputWidth="217px"
                horizontal
                dropDownData={dropdownData.sitecode.items}
                labelSpacing={'mr-3'}
              />
            </div>
            <div className="flex flex-wrap gap-x-24 items-center gap-y-1">
              <Auto_Label_Text_Set
                label="설비ID"
                value={searchParams.equipmentid}
                onChange={(e) => updateSearchParams("equipmentid", e.target.value)}
                labelSpacing={'mr-1'}
                setEnterSearch={setEnterSearch}
              />
              <Auto_Label_Text_Set
                label="설비명"
                value={searchParams.equipmentname}
                onChange={(e) => updateSearchParams("equipmentname", e.target.value)}
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
                title={"설비 마스터"}
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
                modifyAddress="baseinfo/equipmentmaster-cud"
                setExcuteSuccesAndSearch={setExcuteSuccesAndSearch}
                gridRef={gridRef}
                setAddData={setAddData}
              />
            </div>
          </div>
          <Auto_Spliter
            left_width={65}
            leftContent={
              <>
                <Auto_AgGrid
                  gridType={"sender"}
                  primaryKeys={primaryKeys}
                  gridData={gridData}
                  gridRef={gridRef}
                  columnDefs={columnDefs}
                  onSelectionChanged={afterMainGridSelect}
                  selectedRowindex={selectedRowindex}
                  originalDataRef={originalDataRef}
                  dropdownData={dropdownData}
                  noneSelectionSearch={true} // image box가 있을 경우 사용되는 rowselection하지 않고 이미지 검색하기 위한 값
                />
              </>
            }
            rightContent={
              <>
                <Auto_Image_Box getSearchinfoEquipmentImage={getsearchinfoEquipmentImage} //이미지 조회를 위한 파라매터 정보
                  isImageSearchPoint={isImageSearchPoint} // 조회 시점 stats 로 전달
                />
              </>
            }
          />
          
        </Card>
      )}
    </div>
  )
};

export default EquipmentMaster;

