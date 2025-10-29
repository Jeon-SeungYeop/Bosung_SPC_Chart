import {
  Auto_GridCellButtonRenderer, CommonFunction, Auto_Popup_CodeName, Auto_Label_Text_Set,
  Auto_Radio_Useflag, TitleBar, Auto_SearchDropDown, DropDownItemGetter,
  Auto_AgGrid, Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid,
  Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid, Auto_Button_Add_GroupMenu,
  Auto_Button_Column_State
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import { AllCommunityModule, ModuleRegistry, } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const UserGroupPerMenuList = () => {
  //////////////////////////////////////////////////////////////////////// AG 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const apiUrl = useApiUrl();
  const gridRef = useRef(); // 
  const [gridData, setGridData] = useState([]); // 그리드 매핑 데이터 
  const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
  const originalDataRef = useRef(new Map()); // U 업데이트위한 useRef
  const [addData, setAddData] = useState([]); // 추가 대상 리스트
  //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const primaryKeys = ["plantcode", "groupid", "parentmenuid","menuid", ]; // 그리드 의 기본 키
  const [ enterSearch, setEnterSearch ] = useState(false);  // 엔터 키로 검색하기 위한 변수

  // 검색 조건 
  const [searchParams, setSearchParams] = useState({
    plantcode: "",
    usergroup: "",
    menutitle: "",
    useflag: "",
  });

  // 데이터 복사 변수
  const [ copyParam, setCopyParam ] = useState({
    copygroup : "",
  });
  const updateCopyParam = useMemo(() => CommonFunction.createUpdateSearchParams(setCopyParam), [setCopyParam]);
  const copyinfo = useMemo(
    () => ({
      address: "sys/usergrouppermenulist-copy",
      params: {
        plantcode: searchParams.plantcode?.value ?? "",
        copygroup: copyParam.copygroup?.value ?? "",
        userid: JSON.parse(localStorage.getItem("userid")),
      },
    }),
    [searchParams, copyParam]
  );

  // 그리드 팝업 처리 
  // 그리드2  선택 시 index 기억하여 팝업에서 받아온 데이터 를 등록 하기. 
  const [isProgramMasterPopupOpen, setIsProgramMasterPopupOpen] = useState(false); // 작업자 팝업 호출 여부 판단.

  const afterSubGridSelect = (event) => {
    selectedSubRowIndex.current = event.rowIndex;// 선택한 행의 index  
  };
  //  팝업 호출 후 받아올 데이터 (그리드)        codem     title     menuname   url        
  const popupProgramMagerInfo = useRef({ code: "", name: "" ,udc1 : "", udc2 : ""});
  const selectedSubRowIndex = useRef(null);// 포커스된 행 인덱스
  // Popup_CodeName 관련 mapping 값
  const fieldMapping = useMemo(() => ({
    menuid : "code",
    menutitle: "name",
    menuname: "udc1",
    url: "udc2",
  }), []);

  // 검색조건 변경 즉시 반영  (setSearchParams 이후 선언 할것)
  const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
  // 조회 조건 및 조회 정보 
  const searchinfo = useMemo(
    () => ({
      address: "sys/usergrouppermenulist-r",
      params: {
        plantcode: searchParams.plantcode?.value ?? "",
        usergroup: searchParams.usergroup?.value ?? "",
        menutitle: searchParams.menutitle ?? "",
        useflag: searchParams.useflag ?? "",
      },
    }),
    [searchParams]
  );

  // 드롭다운 데이터 상태
  const [dropdownData, setDropdownData] = useState({
    plantcode: { items: [], mappings: {} },
    menutype: { items: [], mappings: {} },
    usergroup: { items: [], mappings: {} },
  });


  // 드롭다운 데이터 로드
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [plantcodeAll, plantcodeRequired, menutypeRequired, usergroupRequired,usergroupAll] =
          await Promise.all([
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode" }),  // 조회부 콤보박스  
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }),  // 그리드 콤보박스 ( 필수 선택 )
            DropDownItemGetter(apiUrl, { param1: "menutype", param2: "1000", param3: "M" , param4: "X" }),
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "usergroup", param4: "X"  }),
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "usergroup" }),
          ]);

        // 컬럼의 대소문자 name 과 동일하게 구성할것 !!!! plantcode , deptcode , workparty
        // items : 조회부 콤보박스 
        // mappings : 그리드 콤보박스 
        setDropdownData({
          plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired) },
          menutype: { items: menutypeRequired, mappings: CommonFunction.convertData(menutypeRequired) },
          usergroup: { items: usergroupAll, mappings: CommonFunction.convertData(usergroupRequired) },
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
      {
        field: "groupid",
        headerName: "사용자그룹",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropdownData.usergroup.mappings) },
        editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"),
        // 드롭다운 세팅
        valueParser: (params) => params.newValue,
        valueFormatter: (params) => dropdownData.usergroup.mappings[params.value],
        minWidth: 130,
      },
      {
        field: "groupidname",
        headerName: "사용자그룹NAME",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropdownData.usergroup.mappings) },
        editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"),
        // 드롭다운 세팅
        valueParser: (params) => params.newValue,
        valueFormatter: (params) => dropdownData.usergroup.mappings[params.value],
        hide: true
      },
      {
        field: "parentmenuid",
        headerName: "상위매뉴",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropdownData.menutype.mappings) },
        editable: true,
        // 드롭다운 세팅
        valueParser: (params) => params.newValue,
        valueFormatter: (params) => dropdownData.menutype.mappings[params.value],
        minWidth: 150,
      },
      { field: "menuid", headerName: "매뉴ID", cellRenderer: (params) => (<Auto_GridCellButtonRenderer value={params.value} data={params.data} setisPopupOpen={setIsProgramMasterPopupOpen} />), minWidth: 100, },
      { field: "menuname", headerName: "매뉴명", editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"), minWidth: 150, },
      { field: "url", headerName: "URL", editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"), minWidth: 150,},

      { field: "menutitle", headerName: "화면명", editable: true, minWidth: 170, },
      { field: "displayseq", headerName: "표시순번", editable: true, cellDataType: "number", minWidth: 90, },
      { 
        field: "manageauth", 
        headerName: "갱신권한", 
        editable: false, 
        cellRenderer: (params) => (<Auto_Grid_Checkbox_AGgrid value={params.value} onValueChange={(newValue) => params.setValue(newValue)} />),
        minWidth: 90,
      },
      { 
        field: "exceldownloadauth", 
        headerName: "엑셀다운로드", 
        editable: false, 
        cellRenderer: (params) => (<Auto_Grid_Checkbox_AGgrid value={params.value} onValueChange={(newValue) => params.setValue(newValue)} />),
        minWidth: 90,
      },
      { 
        field: "exceluploadauth", 
        headerName: "엑셀업로드", 
        editable: false, 
        cellRenderer: (params) => (<Auto_Grid_Checkbox_AGgrid value={params.value} onValueChange={(newValue) => params.setValue(newValue)} />),
        minWidth: 90,
      },
      { 
        field: "useflag", 
        headerName: "사용여부", 
        editable: false, 
        cellRenderer: (params) => (<Auto_Grid_Checkbox_AGgrid value={params.value} onValueChange={(newValue) => params.setValue(newValue)} />),
        minWidth: 90,
      },
      { field: "rowstatus", headerName: "상태", hide: true },
    ],
    [dropdownData]
  );

  return (
    <div className="space-y-5">

      {isProgramMasterPopupOpen && (
        <Auto_Popup_CodeName
          activeModal={isProgramMasterPopupOpen}
          onClose={ CommonFunction.setCodeName(popupProgramMagerInfo, setIsProgramMasterPopupOpen, gridRef, selectedSubRowIndex, fieldMapping)}
          title={"매뉴"}
          keyword={"programmenu"} // worker : 작업자 마스터 , process : 공정마스터 , equipment : 설비마스터  , programmenu: 프로그램 매뉴
          selectdPopupInfo={popupProgramMagerInfo}
        />
      )}


      <TitleBar title="사용자 그룹 별 메뉴 관리" />
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
                labelSpacing={'mr-0'}
              />
              <Auto_SearchDropDown
                label="사용자그룹"
                onChange={(item) => updateSearchParams("usergroup", item)}
                inputWidth="217px"
                horizontal
                dropDownData={dropdownData.usergroup.items}
                labelSpacing={'mr-0'}
              />
              <Auto_Label_Text_Set
                label="화면명"
                value={searchParams.menutitle}
                labelSpacing={'-mr-2'}
                onChange={(e) => updateSearchParams("menutitle", e.target.value)}
                setEnterSearch={setEnterSearch}
              />
              <Auto_Radio_Useflag
                useValue={searchParams.useflag}
                setUseValue={(value) => updateSearchParams("useflag", value)}
              />
            </div>
            <div className="flex flex-wrap gap-x-2 items-center gap-y-1">
              <Auto_SearchDropDown
                label="데이터복사"
                onChange={(item) => updateCopyParam("copygroup", item)}
                inputWidth="217px"
                horizontal
                dropDownData={dropdownData.usergroup.items}
                labelSpacing={'mr-0'}
              />
              <Auto_Button_Add_GroupMenu
                searchinfo={copyinfo}
                setAddData={setAddData}
                setExcuteSuccesAndSearch={setExcuteSuccesAndSearch}
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
                title={"사용자 그룹 별 메뉴 관리"}
              />
              <Auto_Button_Column_State
                columnDefs={columnDefs}
                gridRef={gridRef}
              />
            </div>
            <div className="flex space-x-2">
              <Auto_Button_Add_AGgrid
                //  setExcuteSuccesAndSearch={setExcuteSuccesAndSearch}
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
                modifyAddress="sys/usergrouppermenulist-cud"
                setExcuteSuccesAndSearch={setExcuteSuccesAndSearch}
                gridRef={gridRef}
                setAddData={setAddData}
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
  )
};

export default UserGroupPerMenuList;