import {
  Auto_GridCellButtonRenderer, CommonFunction, Auto_Popup_FileManage, Auto_Label_Text_Set,
  Auto_Radio_Useflag, TitleBar, Auto_SearchDropDown, DropDownItemGetter,
  Auto_AgGrid, Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid,
  Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid, Auto_Button_Column_State,
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import { AllCommunityModule, ModuleRegistry, colorSchemeDarkBlue, themeQuartz, colorSchemeLight } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

import { useLocation } from "react-router-dom";
const CommonCodeGroup = () => {
  //////////////////////////////////////////////////////////////////////// AG 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const apiUrl = useApiUrl();
  const gridRef = useRef(); // 
  const [gridData, setGridData] = useState([]); // 그리드 매핑 데이터 
  const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
  const originalDataRef = useRef(new Map()); // U 업데이트위한 useRef
  const [addData, setAddData] = useState([]); // 추가 대상 리스트
  const [selectedRowData, setSelectedRowData] = useState(null); // 선택한 row의 data
  const [tempState, setTempState] = useState(null); // 팝업에 임시로 사용되는 변수

  //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const primaryKeys = ["plantcode", "groupid"]; // 그리드 의 기본 키  
  const [ enterSearch, setEnterSearch ] = useState(false);  // 엔터 키로 검색하기 위한 변수

  // 검색 조건 
  const [searchParams, setSearchParams] = useState({
    plantcode: "",
    groupid: "",
    groupname: "",
    useflag: "",
  });

  // 그리드 팝업 처리 
  // 그리드2  선택 시 index 기억하여 팝업에서 받아온 데이터 를 등록 하기. 
  const [isFileManagePopupOpen, setIsFileManagePopupOpen] = useState(false); // 작업자 팝업 호출 여부 판단.

  const afterSubGridSelect = (event) => {
    const rowdata = event.data;
    selectedSubRowIndex.current = event.rowIndex;// 선택한 행의 index
    rowdata['code'] = rowdata['groupid'];   // plantcode, code로 전달달
    setSelectedRowData(rowdata); // 선택한 행의 data
  };
  

  //  팝업 호출 후 받아올 데이터 (그리드)        codem     title     menuname   url        
  const popupFileManageInfo = useRef({ filtCount : 0 });
  const selectedSubRowIndex = useRef(null);// 포커스된 행 인덱스

  // 검색조건 변경 즉시 반영  (setSearchParams 이후 선언 할것)
  const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
  
  /////////////////////////////////////////////////////////////////////// 차트에서 넘어온 값 처리 부분 ////////////////////////////////////////////////////////////////////////
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dataKey = queryParams.get("dataKey");
  const value = queryParams.get("value");
  useEffect(() => {
    if(dataKey!= null && value != null){
      updateSearchParams("groupid", dataKey);
      updateSearchParams("groupname", value);
    }
  }, [dataKey, value])
  
  // 조회 조건 및 조회 정보
  const searchinfo = useMemo(
    () => ({
      address: "baseinfo/commonCode-r",
      params: {
        plantcode: searchParams.plantcode?.value ?? "",
        code: searchParams.groupid ?? "",
        name: searchParams.groupname ?? "",
        useflag: searchParams.useflag ?? "",
      }
    }), [searchParams]
  );

  // 드롭다운 데이터 상태
  const [dropDownData, setDropdownData] = useState({
    plantcode: { items: [], mappings: {} },
  });

  // 드롭다운 데이터 로드
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [plantcodeAll, plantcodeRequired,] =
          await Promise.all([
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode" }), // 조회부 콤보박스
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }), // 그리드 콤보박스 (필수 선택)
          ]);

        // 컬럼의 대소문자 name 과 동일하게 구성할것 !!!! plantcode,
        // items : 조회부 콤보박스
        // mappings : 그리드 콤보박스
        setDropdownData({
          plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired) },
        });
      }
      catch (error) {
      }
    };

    loadDropdownData();
  }, [apiUrl]);

  useEffect(() => {
    if (selectedRowData && tempState) {
      setIsFileManagePopupOpen(true);
    }
  }, [selectedRowData,tempState]);

  // 그리드 컬럼 정의
  const columnDefs = useMemo( 
    () => [
      {
        field: "plantcode",
        headerName: "사업장",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: Object.keys(dropDownData.plantcode.mappings) }, // 드롭다운 콤보박스 세팅.
        // 드롭다운 세팅
        valueParser: (params) => params.newValue, // 실제 처리 값은 ValueMember
        valueFormatter: (params) => dropDownData.plantcode.mappings[params.value], // 드롭다운의 Display member 로 보이기. 
        editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"), // 신규 추가 일 경우 만 수정가능. 
        cellClass: "text-left",
        minWidth: 150,
      },
      { field: "groupid", headerName: "그룹ID", editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"), minWidth: 150, }, //신규 추가 일 경우 만 수정가능
      { field: "groupname", headerName: "그룹명", editable: true, cellClass: "text-left", minWidth: 150,},
      { field: "remark", headerName: "비고", editable: true, cellClass: "text-left", minWidth: 150,},
      { field: "filecount", headerName: "파일", editable: false, cellClass: "text-right",
        cellRenderer: (params) => (<Auto_GridCellButtonRenderer value={params.data.filecount} data={params.data} setisPopupOpen={setTempState} title="파일관리" />),
        minWidth: 150,
       },
      { 
        field: "useflag", 
        headerName: "사용여부", 
        editable: false, 
        cellRenderer: (params) => (<Auto_Grid_Checkbox_AGgrid value={params.value} onValueChange={(newValue) => params.setValue(newValue)} />),
        minWidth: 90,
      },
      { field: "rowstatus", headerName: "상태", hide: true,},
    ],
    [dropDownData]
  );

  return (
    <div className="space-y-5">

      {isFileManagePopupOpen && (
        <Auto_Popup_FileManage
          getimagetype="COMMONGROUP"
          selectedRowData={selectedRowData}
          activeModal={isFileManagePopupOpen}
          onClose={() => { 
            setIsFileManagePopupOpen(false);
            setSelectedRowData(null);
            setTempState(false);
            const filecnt = popupFileManageInfo.current['fileCount'];
            const idx = selectedSubRowIndex.current;
            if (typeof(idx) === "number" && typeof(filecnt) === "number") {
              setGridData(prev => {
                const newData = [...prev];
                const row = { ...newData[idx] };
                // 팝업에서 받아온 값 세팅
                row.filecount = filecnt;
                newData[idx] = row;
                return newData;
              });
            }
          }}
          title={"파일 목록"}
          keyword={"commongroup"} // worker : 작업자 마스터 , process : 공정마스터 , equipment : 설비마스터  , programmenu: 프로그램 매뉴
          selectdPopupInfo={popupFileManageInfo}
        />
      )}

      <TitleBar title="공통코드 그룹 등록" />
      {/*조회부*/}
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
                labelSpacing="mr-3"
                dropDownData={dropDownData.plantcode.items}
              />
              <Auto_Label_Text_Set
                label="그룹ID"
                value={searchParams.groupid}
                onChange={(e) => updateSearchParams("groupid", e.target.value)}
                labelSpacing="mr-1"
                setEnterSearch={setEnterSearch}
              />
              <Auto_Label_Text_Set 
                label="그룹명" 
                value={searchParams.groupname} 
                onChange={(e) => updateSearchParams("groupname", e.target.value)} 
                labelSpacing="mr-1"
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
      {Object.values(dropDownData).some(({ items }) => items.length === 0) ? (
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
                title={"공통코드 그룹 등록"}
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
                modifyAddress="baseinfo/commonCode-cud"
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
            dropdownData={dropDownData}
            onRowClicked={afterSubGridSelect}// 그리드 의 포커스 index 공유 하기 . (팝업을 사용할 경우)
          />
        </Card>
      )}
    </div>
  );
};

export default CommonCodeGroup;
