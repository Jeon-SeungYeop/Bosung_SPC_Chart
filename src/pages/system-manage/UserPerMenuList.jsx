import {
  Auto_GridCellButtonRenderer, CommonFunction, Auto_Popup_CodeName, Auto_Label_Text_Set,
  Auto_Radio_Useflag, TitleBar, Auto_SearchDropDown, DropDownItemGetter,
  Auto_AgGrid, Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid,
  Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid, Auto_Button_Add_GroupMenu,
  Auto_Button_Column_State, Auto_LabelPopup_Set
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import { AllCommunityModule, ModuleRegistry, } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const UserPerMenuList = () => {
    //////////////////////////////////////////////////////////////////////// AG 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
    const apiUrl = useApiUrl();
    const gridRef = useRef(); // 
    const [gridData, setGridData] = useState([]); // 그리드 매핑 데이터 
    const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
    const originalDataRef = useRef(new Map()); // U 업데이트위한 useRef
    const [addData, setAddData] = useState([]); // 추가 대상 리스트
    //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////
    const primaryKeys = ["plantcode", "userid", "parentmenuid","menuid", ]; // 그리드 의 기본 키
    const [ enterSearch, setEnterSearch ] = useState(false);  // 엔터 키로 검색하기 위한 변수

    // 검색 조건
    const [searchParams, setSearchParams] = useState({
        plantcode: "",
        userid: "",
        username: "",
        menutitle: "",
        useflag: "",
    });

    // 그리드 팝업 처리
    const [isProgramMasterPopupOpen, setIsProgramMasterPopupOpen] = useState(false); // 프로그램 팝업 호출 여부 판단
    const [isWorkerMasterPopupOpen, setIsWorkerMasterPopupOpen] = useState(false); // 작업자 팝업 호출 여부 판단.

    const afterSubGridSelect = (event) => {
        selectedSubRowIndex.current = event.rowIndex; // 선택한 행의 index
    };

    // 팝업 호출 후 받아올 데이터              code     title   menuname     url
    const popupProgramMagerInfo = useRef({ code: "", name: "", udc1: "", udc2: ""});
    // 팝업 호출 후 받아올 데이터             userid   username
    const popupWorkerInfo = useRef({ code: "", name: ""});
    const selectedSubRowIndex = useRef(null); // 포커스된 행 인덱스
    // Popup_CodeName 관련 mapping 값
    const MenufieldMapping = useMemo(() => ({
        menuid: "code",
        menutitle: "name",
        menuname: "udc1",
        url: "udc2",
    }), []);

    const UserfieldMapping = useMemo(() => ({
        userid: "code",
        username: "name",
    }), []);

    // 검색 조건 즉시 반영 (setSearchParams 이후 선언할 것)
    const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
    // 조회 조건 및 조회 정보
    const searchinfo = useMemo(
        () => ({
            address: "sys/userpermenulist-r",
            params: {
                plantcode: searchParams.plantcode?.value ?? "",
                userid: searchParams.userid ?? "",
                username: searchParams.username ?? "",
                useflag: searchParams.useflag ?? "",
            },
        }),
        [searchParams]
    );

    // 데이터 복사 변수
    const [ copyParam, setCopyParam ] = useState({
        copyid: "",
        copyname: ""
    })
    const updateCopyParam = useMemo(() => CommonFunction.createUpdateSearchParams(setCopyParam), [setCopyParam]);
    const copyinfo = useMemo(
        () => ({
            address: "sys/userpermenulist-copy",
            params: {
                plantcode: searchParams.plantcode?.value ?? "",
                copyid: copyParam.copyid ?? "",
                copyname: copyParam.copyname ?? "",
                loginid: JSON.parse(localStorage.getItem("userid")),
            },
        }),
        [copyParam]
    );

    // 드롭다운 데이터 상태
    const [dropDownData, setDropdownData] = useState({
        plantcode: { items: [], mappings: {} },
        menutype: { items: [], mappings: {} },
    });

    // 드롭다운 데이터 로드
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [plantcodeAll, plantcodeRequired, menutypeRequired] = 
                    await Promise.all([
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode"}),
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X"}),
                        DropDownItemGetter(apiUrl, { param1: "menutype", param2: "1000", param3: "M" , param4: "X" }),
                    ]);
                setDropdownData({
                    plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired)},
                    menutype: { items: menutypeRequired, mappings: CommonFunction.convertData(menutypeRequired)},
                });
            } catch (error) {

            }
        };
        loadDropdownData();
    }, [apiUrl]);

    // 그리드 컬럼 정의
    const columDefs = useMemo(
        () => [
            {
                field: "plantcode",
                headerName: "사업장",
                cellEditor: "agSelectCellEditor",
                cellEditorParams: { values: Object.keys(dropDownData.plantcode.mappings)},
                valueParser: (params) => params.newValue,
                valueFormatter: (params) => dropDownData.plantcode.mappings[params.value],
                editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"),
                minWidth: 150,
            },
            { 
                field: "userid", 
                headerName: "사용자ID", 
                editable: false, 
                cellRenderer: (params) => (<Auto_GridCellButtonRenderer value={params.value} data={params.data} setisPopupOpen={setIsWorkerMasterPopupOpen} />), 
                minWidth: 130,
            },
            {
                field: "username",
                headerName: "사용자이름",
                editable: false,
                minWidth: 100,
            },
            {
                field: "parentmenuid",
                headerName: "상위메뉴",
                cellEditor: "agSelectCellEditor",
                cellEditorParams: { values: Object.keys(dropDownData.menutype.mappings)},
                editable: true,
                valueParser: (params) => params.newValue,
                valueFormatter: (params) => dropDownData.menutype.mappings[params.value],
                minWidth: 150,
            },
            {
                field: "menuid",
                headerName: "메뉴ID",
                cellRenderer: (params) => (<Auto_GridCellButtonRenderer value={params.value} data={params.data} setisPopupOpen={setIsProgramMasterPopupOpen} />), 
                minWidth: 100,
                editable: false
            },
            { 
                field: "menuname", 
                headerName: "매뉴명", 
                editable: false, 
                minWidth: 150, 
            },
            { 
                field: "url", 
                headerName: "URL", 
                editable: false, 
                minWidth: 150,
            },
            { 
                field: "menutitle", 
                headerName: "화면명", 
                minWidth: 170, 
                editable: false
            },
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
        [dropDownData]
    );
console.log(gridData);
    return (
        <div className="space-y-5">
            {isProgramMasterPopupOpen && (
                <Auto_Popup_CodeName
                    activeModal={isProgramMasterPopupOpen}
                    onClose={CommonFunction.setCodeName(popupProgramMagerInfo, setIsProgramMasterPopupOpen, gridRef, selectedSubRowIndex, MenufieldMapping)}
                    title={"메뉴"}
                    keyword={"programmenu"}
                    selectdPopupInfo={popupProgramMagerInfo}
                />
            )}
            {isWorkerMasterPopupOpen && (
                <Auto_Popup_CodeName
                    activeModal={isWorkerMasterPopupOpen}
                    onClose={CommonFunction.setCodeName(popupWorkerInfo, setIsWorkerMasterPopupOpen, gridRef, selectedSubRowIndex, UserfieldMapping)}
                    title={"사용자"}
                    keyword={"user"}
                    selectdPopupInfo={popupWorkerInfo}
                />
            )}

            <TitleBar title="사용자 별 메뉴 관리"/>
            <Card noborder>
                <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-y-6">
                    <div className="flex flex-col gap-y-1">
                        <div className="flex flex-wrap gap-x-24 items-center gap-y-1">
                            <Auto_SearchDropDown
                                label="사업장"
                                id="plantcode"
                                onChange={(item) => updateSearchParams("plantcode", item)}
                                inputWidth="217px"
                                horizontal
                                dropDownData={dropDownData.plantcode.items}
                                labelSpacing={'mr-0'}
                            />
                            <Auto_LabelPopup_Set
                                label="사용자"
                                inputWidth="200px"
                                keyword="user"
                                onChangeId={(item) => updateSearchParams("userid", item)}
                                onChangeName={(item) => updateSearchParams("username", item)}
                                hiddenSpacing="85px"
                                setEnterSearch={setEnterSearch}
                            />
                            <Auto_Radio_Useflag
                                useValue={searchParams.useflag}
                                setUseValue={(value) => updateSearchParams("useflag", value)}
                            />
                        </div>
                        <div className="flex flex-wrap gap-x-2 items-center gap-y-1">
                            <Auto_LabelPopup_Set
                                label="복사할 대상"
                                inputWidth="200px"
                                keyword="user"
                                onChangeId={(item) => updateCopyParam("copyid", item)}
                                onChangeName={(item) => updateCopyParam("copyname", item)}
                                hiddenSpacing="85px"
                                setEnterSearch={setEnterSearch}
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
                            originalDataRef={originalDataRef}
                            primaryKeys={primaryKeys}
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
                                columDefs={columDefs}
                                setGridData={setGridData}
                            />
                            <Auto_Button_Export_Excel
                                columnDefs={columDefs}
                                gridData={gridData}
                                title="사용자 별 메뉴 관리"
                            />
                            <Auto_Button_Column_State
                                columnDefs={columDefs}
                                gridRef={gridRef}
                            />
                        </div>
                        <div className="flex space-x-2">
                            <Auto_Button_Add_AGgrid
                                columnDefs={columDefs}
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
                                modifyAddress="sys/userpermenulist-cud"
                                setExcuteSuccesAndSearch={setExcuteSuccesAndSearch}
                                gridRef={gridRef}
                            />
                        </div>
                    </div>
                    <Auto_AgGrid
                        gridType="recipient"
                        primaryKeys={primaryKeys}
                        gridData={gridData}
                        gridRef={gridRef}
                        columnDefs={columDefs}
                        originalDataRef={originalDataRef}
                        dropdownData={dropDownData}
                        onRowClicked={afterSubGridSelect}
                    />
                </Card>
            )}
        </div>
    );
}

export default UserPerMenuList;