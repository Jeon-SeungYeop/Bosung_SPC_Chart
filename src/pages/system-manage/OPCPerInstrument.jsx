import {
  Auto_GridCellButtonRenderer, CommonFunction, Auto_Popup_CodeName, Auto_Label_Text_Set,
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

const OPCPerInstrument = () => {
  //////////////////////////////////////////////////////////////////////// AG 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const apiUrl = useApiUrl();
  const gridRef = useRef(); // 
  const [gridData, setGridData] = useState([]); // 그리드 매핑 데이터 
  const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
  const originalDataRef = useRef(new Map()); // U 업데이트위한 useRef
  const [addData, setAddData] = useState([]); // 추가 대상 리스트

  // 그리드 팝업. 
  const [isEquipmentPopupOpen, setIsEquipmentPopupOpen] = useState(false); // 설비 팝업 호출 여부 판단.

  //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////

  const primaryKeys = ["ipaddress", "tag"]; // 그리드 의 기본 키  
  const [enterSearch, setEnterSearch] = useState(false);  // 엔터 키로 검색하기 위한 변수

  // 검색 조건 
  const [searchParams, setSearchParams] = useState({
    plantcode: "", 
    datatype : "",
    factorycode : "",
    sitecode : "",
    devicename : "" ,
    tag : "",
  });
  // 검색조건 변경 즉시 반영  (setSearchParams 이후 선언 할것)
  const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
  // 조회 조건 및 조회 정보 
  const searchinfo = useMemo(
    () => ({
      address: "sys/opcinstrument-r",
      params: {
        plantcode: searchParams.plantcode?.value ?? "", 
        datatype: searchParams.datatype?.value ?? "", 
        factorycode: searchParams.factorycode?.value ?? "", 
        sitecode: searchParams.sitecode?.value ?? "", 
        devicename: searchParams.devicename ?? "", 
        tag : searchParams.tag ?? "", 
      },
    }),
    [searchParams]
  );

  // 드롭다운 데이터 상태
  const [dropdownData, setDropdownData] = useState({
    cboplantcode: { items: [], mappings: {} },
    cbodatatype: { items: [], mappings: {} },
    cbofactorycode: { items: [], mappings: {} },
    cbositecode: { items: [], mappings: {} },
  });



  //  팝업 호출 후 받아올 데이터 (그리드)
  const popupEuipmentInfo = useRef({ code: "", name: ""});
  const selectedSubRowIndex = useRef(null);// 포커스된 행 인덱스
  // Popup_CodeName 관련 mapping 값
  const fieldMapping = useMemo(() => ({
    equipmentid : "code",
    equipmentname: "name",
  }), []); 
  // 그리드2  선택 시 index 기억하여 팝업에서 받아온 데이터 를 등록 하기.
  const afterSubGridSelect = (event) => {
    selectedSubRowIndex.current = event.rowIndex;// 선택한 행의 index  
  }; 




  // 드롭다운 데이터 로드
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [plantcodeAll, plantcodeRequired,datatypeall, datatypegrid,factorycodeall, factorycodegrid, sitecodeall,sitecodegrid] =
          await Promise.all([
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode" }), 
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }),  
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "collecdatatype" }),
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "collecdatatype", param4: "X" }),  
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "factorycode"}), 
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "factorycode", param4: "X" }),  
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "sitecode"}), 
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "sitecode", param4: "X" }), 
          ]);

        // 컬럼의 대소문자 name 과 동일하게 구성할것 !!!! plantcode 
        // items : 조회부 콤보박스 
        // mappings : 그리드 콤보박스 
        setDropdownData({
          cboplantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired) },
          cbodatatype: { items: datatypeall, mappings: CommonFunction.convertData(datatypegrid) },
          cbofactorycode: { items: factorycodeall, mappings: CommonFunction.convertData(factorycodegrid) },
          cbositecode: { items: sitecodeall, mappings: CommonFunction.convertData(sitecodegrid) }
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
        cellEditorParams: { values: Object.keys(dropdownData.cboplantcode.mappings) }, // 드롭다운 콤보박스 세팅.
        // 드롭다운 세팅
        valueParser: (params) => params.newValue, // 실제 처리 값은 ValueMember
        valueFormatter: (params) => dropdownData.cboplantcode.mappings[params.value], // 드롭다운의 Display member 로 보이기. 
        editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"), // 신규 추가 일 경우 만 수정가능.
        minWidth: 150,
      },
      {
        field: "datatype",
        headerName: "데이터유형", 
        cellEditor: "agSelectCellEditor",  
        cellEditorParams: { values: Object.keys(dropdownData.cbodatatype.mappings) }, // 드롭다운 콤보박스 세팅.
        // 드롭다운 세팅
        valueParser: (params) => params.newValue, // 실제 처리 값은 ValueMember
        valueFormatter: (params) => dropdownData.cbodatatype.mappings[params.value], // 드롭다운의 Display member 로 보이기. 
        minWidth: 150,
        editable: true,
      },

      {
        field: "factorycode",
        headerName: "공장",
        cellEditor: "agSelectCellEditor", 
        cellEditorParams: { values: Object.keys(dropdownData.cbofactorycode.mappings) }, // 드롭다운 콤보박스 세팅.
        // 드롭다운 세팅
        valueParser: (params) => params.newValue, // 실제 처리 값은 ValueMember
        valueFormatter: (params) => dropdownData.cbofactorycode.mappings[params.value], // 드롭다운의 Display member 로 보이기. 
        minWidth: 150,
        editable: true,
      },
      {
        field: "sitecode",
        headerName: "위치",
        cellEditor: "agSelectCellEditor", 
        cellEditorParams: { values: Object.keys(dropdownData.cbositecode.mappings) }, // 드롭다운 콤보박스 세팅.
        // 드롭다운 세팅
        valueParser: (params) => params.newValue, // 실제 처리 값은 ValueMember
        valueFormatter: (params) => dropdownData.cbositecode.mappings[params.value], // 드롭다운의 Display member 로 보이기. 
        minWidth: 150,
        editable: true,
      },
      {
        field: "ipaddress",
        headerName: "IP주소", 
        minWidth: 130, 
        editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"), // 신규 추가 일 경우 만 수정가능. (기본키 컬럼)
      },  
      {
        field: "devicename",
        headerName: "디바이스명", 
        minWidth: 130,
        editable: true,
      },  
      {
        field: "groupname",
        headerName: "그룹", 
        minWidth: 130,
        editable: true,
      },  

     { 
        field: "equipmentid", 
        headerName: "설비ID", 
        editable: false, 
        cellRenderer: (params) => (<Auto_GridCellButtonRenderer value={params.value} data={params.data} setisPopupOpen={setIsEquipmentPopupOpen} />), 
        minWidth: 130, },
      
      {
        field: "equipmentname",
        headerName: "설비명", 
        minWidth: 200, 
      },  


      {
        field: "managedec",
        headerName: "항목", 
        minWidth: 450,
        editable: true,
      },  
      {
        field: "tag",
        headerName: "태그정보", 
        minWidth: 130, 
        editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"), // 신규 추가 일 경우 만 수정가능. (기본키 컬럼)
      },  
      {
        field: "mapcolumn",
        headerName: "매핑컬럼", 
        minWidth: 250,  
        editable: true,
      },  
      {
        field: "ioaddress",
        headerName: "I/O 주소", 
        minWidth: 130,
        editable: true,
      },  

      {
        field: "remark",
        headerName: "비고", 
        minWidth: 200,
        editable: true,
      },   
       {
        field: "makedate",
        headerName: "등록일시",
        editable: false,
        minWidth: 200,
      },
      { field: "maker", headerName: "등록자", editable: false, minWidth: 100, },
      { field: "rowstatus", headerName: "상태", hide: true },

    ],
    [dropdownData]
  );



  return (
    <div className="space-y-5">
      {/* 설비 마스터 그리드 팝업 호출 */}
      {isEquipmentPopupOpen && (
        <Auto_Popup_CodeName
          activeModal={isEquipmentPopupOpen}
          onClose={ CommonFunction.setCodeName(popupEuipmentInfo, setIsEquipmentPopupOpen, gridRef, selectedSubRowIndex, fieldMapping)}
          title={"설비"}
          keyword={"equipment"} 
          selectdPopupInfo={popupEuipmentInfo}
        />

      )}

      <TitleBar title="계측기 별 OPC 마스터" />
      <Card noborder>
        <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-y-6">
          <div className="flex flex-col gap-y-1">
            <div className="flex flex-wrap gap-x-24 items-center gap-y-1">
              <Auto_SearchDropDown
                label="사업장"
                id="plantcode" // 로그인 사용자 사업장 기본 선택
                onChange={(item) => updateSearchParams("plantcode", item)}
                dropDownData={dropdownData.cboplantcode.items}
                inputWidth="217px"
                horizontal
                labelSpacing={'mr-3'}
              /> 
              <Auto_SearchDropDown
                label="데이터유형"
                id="datatype"  
                onChange={(item) => updateSearchParams("datatype", item)}
                dropDownData={dropdownData.cbodatatype.items}
                inputWidth="217px"
                horizontal
                labelSpacing={'mr-3'}
              /> 
              <Auto_SearchDropDown
                label="공장"
                id="factorycode"  
                onChange={(item) => updateSearchParams("factorycode", item)}
                dropDownData={dropdownData.cbofactorycode.items}
                inputWidth="217px"
                horizontal
                labelSpacing={'mr-3'}
              /> 
              <Auto_SearchDropDown
                label="위치"
                id="sitecode"  
                onChange={(item) => updateSearchParams("sitecode", item)}
                dropDownData={dropdownData.cbositecode.items}
                inputWidth="217px"
                horizontal
                labelSpacing={'mr-3'}
              /> 
              <Auto_Label_Text_Set
                label="DEVICE 명"
                value={searchParams.devicename}
                onChange={(e) => updateSearchParams("devicename", e.target.value)}
                labelSpacing={'mr-1'}
                setEnterSearch={setEnterSearch}
              /> 
              <Auto_Label_Text_Set
                label="TAG"
                value={searchParams.tag}
                onChange={(e) => updateSearchParams("tag", e.target.value)}
                labelSpacing={'mr-1'}
                setEnterSearch={setEnterSearch}
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
                modifyAddress="sys/opcinstrument-cud"
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
                  onRowClicked={afterSubGridSelect}// 그리드 의 포커스 index 공유 하기 . (팝업을 사용할 경우)
          />
        </Card>
      )}
    </div>
  );
};

export default OPCPerInstrument;