import {
  Auto_AgGrid, Auto_Button_Search_AGgrid,
  Auto_Grid_InputDate_AGgrid,
  Auto_Label_Text_Set,
  Auto_SearchDropDown,
  CommonFunction, Auto_Button_Save_AGgrid,
  DropDownItemGetter, Auto_Button_Delete_AGgrid,
  TitleBar, Auto_Spliter, Auto_Button_Add_AGgrid
} from "@/components/autocomponent";
import { Box, Tab, Tabs } from '@mui/material';

import Loading from "@/components/Loading";
import Card from "@/components/ui/Card";
import { useApiUrl } from "@/context/APIContext";
import { AllCommunityModule, ModuleRegistry, } from "ag-grid-community";
import React, { useEffect, useMemo, useRef, useState } from "react";

ModuleRegistry.registerModules([AllCommunityModule]);

const ProcessControlManage = () => {
  //////////////////////////////////////////////////////////////////////// AG 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const apiUrl = useApiUrl();
  const gridRef = useRef(); // 
  const [gridData, setGridData] = useState([]); // 그리드 매핑 데이터 
  const [deleteData, setDeleteData] = useState([]); // 삭제 대상 리스트 
  const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
  const originalDataRef = useRef(new Map()); // U 업데이트위한 useRef
  const [gridSubData, setGridSubData] = useState([]); // 그리드 Sub 매핑 데이터 

  //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////


  const primaryKeys = ["plantcode", "workerid"]; // 그리드 의 기본 키  
  const [enterSearch, setEnterSearch] = useState(false);  // 엔터 키로 검색하기 위한 변수

  const [selectedRowindex, setSelectedRowindex] = useState(0); // 선택 처리 하고자 하는  index 
  const afterMainGridSelect = async (event) => {
    const selectedRows = event.api.getSelectedRows();

    if (selectedRows.length === 0) return; // 선택된 게 없으면 리턴

    grid1KeyData.current.plantcode = selectedRows[0].plantcode;
    grid1KeyData.current.groupid = selectedRows[0].groupid;

    // 메인 그리드 클릭 시 서브 그리드 데이터 조회
    inquireSubGrid();
  };


  // 검색 조건 
  const [searchParams, setSearchParams] = useState({
    plantcode: "",
    workerid: "",
    workername: "",
    deptcode: "",
    workparty: "",
    useflag: "",
  });
  // 검색조건 변경 즉시 반영  (setSearchParams 이후 선언 할것)
  const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
  // 조회 조건 및 조회 정보 
  const searchinfo = useMemo(
    () => ({
      address: "baseinfo/workermaster-r",
      params: {
        plantcode: searchParams.plantcode?.value ?? "",
        workerid: searchParams.workerid ?? "",
        workername: searchParams.workername ?? "",
        deptcode: searchParams.deptcode?.value ?? "",
        workparty: searchParams.workparty?.value ?? "",
        useflag: searchParams.useflag ?? "",
      },
    }),
    [searchParams]
  );


  // 드롭다운 데이터 상태
  const [dropdownData, setDropdownData] = useState({
    plantcode: { items: [], mappings: {} },
    deptcode: { items: [], mappings: {} },
    workparty: { items: [], mappings: {} },
  });


  // 드롭다운 데이터 로드
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [plantcodeAll, plantcodeRequired, deptcodeAll, workpartyAll] =
          await Promise.all([
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode" }),  // 조회부 콤보박스  
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }),  // 그리드 콤보박스 ( 필수 선택 )
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "deptcode" }),
            DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "bancode" }),
          ]);

        // 컬럼의 대소문자 name 과 동일하게 구성할것 !!!! plantcode , deptcode , workparty
        // items : 조회부 콤보박스 
        // mappings : 그리드 콤보박스 
        setDropdownData({
          plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired) },
          deptcode: { items: deptcodeAll, mappings: CommonFunction.convertData(deptcodeAll) },
          workparty: { items: workpartyAll, mappings: CommonFunction.convertData(workpartyAll) },
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
      },
      { field: "processid", headerName: "공정ID", editable: false },
      { field: "processname", headerName: "공정명", editable: false },

    ],
    [dropdownData]
  );




  // 그리드 컬럼 정의
  const columnDefsSub = useMemo(
    () => [
      { field: "plantcode", headerName: "사업장", hide: true },
      { field: "groupid", headerName: "그룹ID", editable: true, hide: true },
      { field: "codeid", headerName: "상세코드", editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"), },
      { field: "codename", headerName: "상세코드명", editable: true },
      { field: "remark", headerName: "비고", editable: true },
      { field: "real1", headerName: "관련1", editable: true },
      { field: "real2", headerName: "관련2", editable: true },
      { field: "real3", headerName: "관련3", editable: true },
      { field: "real4", headerName: "관련4", editable: true },
      { field: "real5", headerName: "관련5", editable: true },
      { field: "useflag", headerName: "사용여부", cellDataType: "boolean", editable: true },
      { field: "rowstatus", headerName: "행상태", editable: false },
    ],
    [dropdownData]
  );




  // 그리드 1 에서 선택 한 행의 정보 로 그리드 2 호출하기 . 
  const grid1KeyData = useRef({ plantcode: "", groupid: "" }); // 그리드1 에서 선택한 사업장 과 공정id



  // Tab 컨트롤 생성 및 디자인

  // 세척기
  const WasherTab = () => <div>
    <Auto_AgGrid
      gridType="recipient" // 데이터를 전달받아 처리하는 그리드
      primaryKeys={primaryKeys}
      gridData={gridData}
      gridRef={gridRef}
      columnDefs={columnDefs}
      originalDataRef={originalDataRef}
      dropdownData={dropdownData}
    />
  </div>;
  const FurnaceTab = () => <div>가열로 내용</div>;
  const TemperingTab = () => <div>템퍼링 내용</div>;


  const TabContent = React.memo(({ Component, isActive }) => {
    return <div style={{ display: isActive ? 'block' : 'none' }}><Component /></div>;
  });


  const tabItems = [
    { label: '세척기', component: WasherTab },
    { label: '가열로', component: FurnaceTab },
    { label: '템퍼링', component: TemperingTab },
  ];


  const [activeIndex, setActiveIndex] = useState(0);

  const memoizedTabs = useMemo(() => {
    return tabItems.map((tab, index) => ({
      ...tab,
      content: (
        <TabContent
          key={tab.label}
          Component={tab.component}
          isActive={index === activeIndex}
        />
      ),
    }));
  }, [activeIndex]);



  return (
    <div className="space-y-5">

      <TitleBar title="공정 제어 관리" />
      <Card noborder>
        <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-y-6">
          <div className="flex flex-col gap-y-1">
            <div className="flex flex-wrap gap-x-24 items-end space-y-1">
              <Auto_SearchDropDown
                label="사업장"
                id="plantcode" // 로그인 사용자 사업장 기본 선택
                onChange={(item) => updateSearchParams("plantcode", item)}
                inputWidth="217px"
                horizontal
                labelSpacing="-mr-3"
                dropDownData={dropdownData.plantcode.items}
              />
              <Auto_Label_Text_Set
                label="작업자ID"
                value={searchParams.workerid}
                onChange={(e) => updateSearchParams("workerid", e.target.value)}
                labelSpacing="-mr-5"
                setEnterSearch={setEnterSearch}
              />
              <Auto_Label_Text_Set
                label="작업자명"
                value={searchParams.workername}
                onChange={(e) => updateSearchParams("workername", e.target.value)}
                labelSpacing="-mr-5"
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
              setDeleteData={setDeleteData} // 그리드 삭제 내역 리스트 를 초기화 하기 위해 전달
              enterSearch={enterSearch}
              setEnterSearch={setEnterSearch}
            />
          </div>
        </div>
      </Card>

      {Object.values(dropdownData).some(({ items }) => items.length === 0) ? (
        <Loading />
      ) : (
        <Card noborder>





          <Auto_Spliter
            // 왼쪽 그리드 
            leftContent={ 
              <>
                <div className="h-[54px]"></div> {/* 약 20px 간격 */}
                <Auto_AgGrid
                  gridType="recipient" // 데이터를 전달받아 처리하는 그리드
                  primaryKeys={primaryKeys}
                  gridData={gridData}
                  gridRef={gridRef}
                  columnDefs={columnDefs}
                  originalDataRef={originalDataRef}
                  dropdownData={dropdownData}
                />
              </>
            }
            // 오른쪽 그리드
            rightContent={
              <>

                <Box sx={{ width: '100%' }}>
                  <Tabs
                    value={activeIndex}
                    onChange={(e, newValue) => setActiveIndex(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      '& .MuiTabs-indicator': { backgroundColor: '#1976d2' },
                      '& .MuiTab-root': { fontSize: '14px', minHeight: '32px' },
                      '& .MuiTab-root.Mui-selected': { color: '#1976d2' },
                    }}
                  >
                    {tabItems.map((tab, index) => (
                      <Tab key={index} label={tab.label} />
                    ))}
                  </Tabs>

                  <Box sx={{ mt: 2 }}>
                    {memoizedTabs.map((tab) => tab.content)}
                  </Box>
                </Box>
                <Auto_Button_Save_AGgrid
                modifiedData={[...gridData, ...deleteData]}
                modifyAddress="baseinfo/workermaster-cud"
                setExcuteSuccesAndSearch={setExcuteSuccesAndSearch}
                setDeleteData={setDeleteData}
                gridRef={gridRef}
              />
              </>
            }
          />




        </Card>
      )}
    </div>
  );
};

export default ProcessControlManage;