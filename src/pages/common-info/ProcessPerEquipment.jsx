import {
  Auto_LabelPopup_Set, CommonFunction, Auto_Popup_CodeName, Auto_GridCellButtonRenderer,
  Auto_AgGrid, TitleBar, Auto_SearchDropDown, DropDownItemGetter,
  Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid,
  Auto_Spliter, Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Button_Column_State
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import { CollectionsOutlined } from "@mui/icons-material";

// 공정 별 설비 관리 
const ProcessPerEquipment = () => {
  //////////////////////////////////////////////////////////////////////// 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
  const apiUrl = useApiUrl(); // Backend 접속 정보 
  const gridRef = useRef(); // 삭제 를 위한 참조 행 정보 
  const [gridData, setGridData] = useState([]); // 그리드 매핑 데이터 
  const [gridSubData, setGridSubData] = useState([]); // 그리드 Sub 매핑 데이터 
  const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
  const originalDataRef = useRef(new Map()); // U 업데이트위한 useRef
  const [addData, setAddData] = useState([]); // 추가 대상 리스트
  //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////


  // // 설비 조회부 팝업 관련 데이터 
  // const [txtEquipmentid, setTxtEquipmentId] = useState("");
  // const [txtEquipmentName, setTxtEquipmentName] = useState("");
  // // 설비 팝업 호출 후 받아올 데이터 
  // const [popupEquipmentInfo, setPopupEquipmentInfo] = useState({ code: "", name: "" });
  // // 팝업에서의 데이터 변경 시 
  // useEffect(() => {
  //   setTxtEquipmentId(popupEquipmentInfo.code);
  //   setTxtEquipmentName(popupEquipmentInfo.name);
  // }, [popupEquipmentInfo]);

  // 그리드 팝업. 
  const [isEquipmentPopupOpen, setIsEquipmentPopupOpen] = useState(false); // 설비 팝업 호출 여부 판단.

  const primaryKeys_g2 = ["plantcode", "processid", "equipmentid"]; // 그리드 2의 기본 키 
  const [ enterSearch, setEnterSearch ] = useState(false);  // 엔터 키로 검색하기 위한 변수
  
  // 검색 조건 
  const [searchParams, setSearchParams] = useState({
    plantcode: "",
    processid: "",
    processname: "",
    equipmentid: "",
    equipmentname: "",
    useflag: "",
  });
  // 검색조건 변경 즉시 반영  (setSearchParams 이후 선언 할것)
  const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
  // 조회 조건 및 조회 정보 
  const searchinfo = useMemo(
    () => ({
      address: "baseinfo/processperequipment-rl",
      params: {
        plantcode: searchParams.plantcode?.value ?? "",
        processid: searchParams.processid ?? "",
        processname: searchParams.processname ?? "",
        equipmentid: searchParams.equipmentid ?? "",
        equipmentname: searchParams.equipmentname ?? "",
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
        const [plantcodeAll, plantcodeRequired] =
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
        minWidth: 100,
      },
      { field: "processid", headerName: "공정ID", editable: false, minWidth: 100, },
      { field: "processname", headerName: "공정명", editable: false, minWidth: 150, },

    ],
    [dropdownData]
  );


  // 그리드 컬럼 정의
  const columnDefsSub = useMemo(
    () => [
      // 팝업을 호출할 그리드 컬럼.
      { field: "plantcode", headerName: "사업장", hide: true },
      { field: "processid", headerName: "공정ID", editable: true, hide: true },
      { field: "equipmentid", headerName: "설비ID", editable: false, cellRenderer: (params) => (<Auto_GridCellButtonRenderer value={params.value} data={params.data} setisPopupOpen={setIsEquipmentPopupOpen} />), minWidth: 130, },
      { field: "equipmentname", headerName: "설비명", editable: false, minWidth: 120, },
      { field: "equipmenttype", headerName: "설비타입", editable: false, minWidth: 130, },
      { field: "powerusage", headerName: "일간최대전력", editable: false, minWidth: 120, },
      { 
        field: "workinghours", 
        headerName: "가동시간", 
        editable: false, 
        cellDataType: "number", 
        cellClass: 'text-right',
        valueFormatter: params => {
          const value = params.value;
          if (value == null || value === "") return "";
          return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }, 
        minWidth: 100,
      },
      { field: "sitecode", headerName: "설비위치", editable: false, minWidth: 100, },
      { field: "remark", headerName: "비고", editable: true, minWidth: 130, },
      { field: "rowstatus", headerName: "행상태", editable: false, hide: true },
    ],
    [dropdownData]
  );



  // 그리드 1 에서 선택 한 행의 정보 로 그리드 2 호출하기 . 
  const grid1KeyData = useRef({ plantcode: "", processid: "" }); // 그리드1 에서 선택한 사업장 과 공정id


  const searchinfosub = useMemo(() => ({
    address: "baseinfo/processperequipment-rr",
    params: {
      plantcode: grid1KeyData.current.plantcode ?? "",
      processid: grid1KeyData.current.processid ?? "",
      processname: searchParams.processname ?? "",
      equipmentid: searchParams.equipmentid ?? "",
      equipmentname: searchParams.equipmentname ?? "",
      useflag: searchParams.useflag ?? "",
    },
  }), [searchParams]); // grid1KeyData는 ref라 의존성에 넣을 필요 없음




  const afterMainGridSelect = async (event) => {
    const selectedRows = event.api.getSelectedRows();

    if (selectedRows.length === 0) return; // 선택된 게 없으면 리턴


    grid1KeyData.current.plantcode = selectedRows[0].plantcode;
    grid1KeyData.current.processid = selectedRows[0].processid;


    inquireSubGrid();

  };

  // 그리드2  선택 시 index 기억하여 팝업에서 받아온 데이터 를 등록 하기.
  const afterSubGridSelect = (event) => {
    selectedSubRowIndex.current = event.rowIndex;// 선택한 행의 index  
  };

  //  팝업 호출 후 받아올 데이터 (그리드)
  const popupEuipmentInfo = useRef({ code: "", name: "", udc1: "", udc4: "", });
  const selectedSubRowIndex = useRef(null);// 포커스된 행 인덱스
  // Popup_CodeName 관련 mapping 값
  const fieldMapping = useMemo(() => ({
    equipmentid : "code",
    equipmentname: "name",
    equipmenttype: "udc1",
    sitecode: "udc4",
  }), []);

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
          processid: grid1KeyData.current.processid ?? "",
        },
      },
      setGridData: setGridSubData,
      originalDataRef,
      primaryKeys: primaryKeys_g2,
      setAddData: setAddData,
    });
  };

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
        item.processid === grid1KeyData.current.processid
    );

    if (matchedIndex === -1) {
      // 일치하는 항목이 없을 경우 gridData[0]을 사용
      grid1KeyData.current.plantcode = gridData[0].plantcode;
      grid1KeyData.current.processid = gridData[0].processid;
      matchedIndex = 0;
    } 
    if (selectedRowindex !== matchedIndex) {
      setSelectedRowindex(matchedIndex);
    }

    // 조회 
    inquireSubGrid();
  }, [gridData, excuteSuccesAndSearch]);

  return (
    <div className="space-y-5">
      {/* 설비 마스터 그리드 팝업 호출 */}
      {isEquipmentPopupOpen && (
        <Auto_Popup_CodeName
          activeModal={isEquipmentPopupOpen}
          onClose={ CommonFunction.setCodeName(popupEuipmentInfo, setIsEquipmentPopupOpen, gridRef, selectedSubRowIndex, fieldMapping)}
          title={"설비"}
          keyword={"equipment"} // worker : 작업자 마스터 , process : 공정마스터 , equipment : 설비마스터
          selectdPopupInfo={popupEuipmentInfo}
        />

      )}
      <TitleBar title="공정 별 설비 마스터" />
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

              <Auto_LabelPopup_Set
                label="공정"
                inputWidth="200px"
                keyword="process"
                onChangeId={(item) => updateSearchParams("processid", item)}
                onChangeName={(item) => updateSearchParams("processname", item)}
                labelSpacing={'-mr-6'}
                setEnterSearch={setEnterSearch}
              />

              <Auto_LabelPopup_Set
                label="설비"
                inputWidth="200px"
                keyword="equipment"
                onChangeId={(item) => updateSearchParams("equipmentid", item)}
                onChangeName={(item) => updateSearchParams("equipmentname", item)}
                labelSpacing={'-mr-6'}
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
              primaryKeys={primaryKeys_g2} // 복사 세트를 만들 Key 정보 
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
                <div className="h-[54px]"></div> {/* 약 20px 간격 */}
                <Auto_AgGrid
                  gridType="sender" // 데이터를 발생 시키는 그리드
                  gridData={gridData}
                  columnDefs={columnDefs}
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
                      title={"공정 별 설비 마스터"}
                    />
                    <Auto_Button_Column_State
                      columnDefs={columnDefsSub}
                      gridRef={gridRef}
                    />
                  </div>

                  {/* 오른쪽: Add/Delete/Save 버튼들 */}
                  <div className="flex space-x-2 justify-end">
                    <Auto_Button_Add_AGgrid
                      columnDefs={columnDefsSub}
                      gridRef={gridRef}
                      grid1KeyData={grid1KeyData}
                      setAddData={setAddData}
                    />
                    <Auto_Button_Delete_AGgrid
                      gridRef={gridRef}
                      gridData={gridSubData}
                      setAddData={setAddData}
                    />
                    <Auto_Button_Save_AGgrid
                      gridRef={gridRef}
                      modifiedData={[...gridSubData, ...addData]} // 그리드 의 모든 데이터 와 삭제 된 데이터 를 전달 함. ( 그리드에는 기존 행 과 U,C,P 인 상태의 행이 있음 Auto_Button_Save_AGgrid 에서 상태가 있는 행들만 걸러냄. ) 
                      modifyAddress="baseinfo/processperequipment-cud"
                      setExcuteSuccesAndSearch={setExcuteSuccesAndSearch}
                    />
                  </div>
                </div>
                <Auto_AgGrid
                  gridType="recipient" // 데이터를 전달받아 처리하는 그리드
                  primaryKeys={primaryKeys_g2}
                  gridData={gridSubData}
                  gridRef={gridRef}
                  columnDefs={columnDefsSub}
                  originalDataRef={originalDataRef}
                  dropdownData={dropdownData}
                  onRowClicked={afterSubGridSelect}// 그리드 의 포커스 index 공유 하기 . (팝업을 사용할 경우)
                />
              </>
            }
          />
        </Card>
      )}
    </div>
  );
};

export default ProcessPerEquipment;