import {
  Auto_GridCellButtonRenderer, CommonFunction, Auto_Popup_CodeName, Auto_Label_Text_Set,
  Auto_Radio_Useflag, TitleBar, Auto_SearchDropDown, DropDownItemGetter,
  Auto_AgGrid, Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid,
  Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid, Auto_Button_Add_GroupMenu,
  Auto_Button_Column_State, Auto_Grid_InputDate_AGgrid, Auto_DateTimePickerF_T, Auto_Spliter, Auto_Button_Question
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import { AllCommunityModule, ModuleRegistry, } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const FactoryTargetUsage = () => {
    ///////////////////////////////////////////////// 그리드 필수 필드 멤버 //////////////////////////////////////////
    const apiUrl = useApiUrl();
    const gridRef = useRef();
    const [gridData, setGridData] = useState([]);
    const [gridSubData, setGridSubData] = useState([]);
    const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false);
    const originalDataRef = useRef(new Map());
    const [addData, setAddData] = useState([]);
    ///////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 //////////////////////////////////////////
    const primaryKeys = ["plantcode", "factorycode", "targetusagebyfactoryid"];
    const [ enterSearch, setEnterSearch ] = useState(false);

    const [searchParams, setSearchParams] = useState({
        plantcode: "",
        sitecode: "",
        useflag: "",
    });
    const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
    const searchinfo = useMemo(
        () => ({
            address: "baseinfo/factorytargetusage-r",
            params: {
                plantcode: searchParams.plantcode?.value ?? "",
                sitecode: searchParams.sitecode?.value ?? "",
                useflag: searchParams.useflag ?? "",
            },
        }),
        [searchParams]
    );

    const [dropdownData, setDropdownData] = useState({
        plantcode: { items: [], mappings: {} },
        sitecode: { items: [], mappings: {} },
        controlevalstandard: { items: [], mappings: {} },
        factorycode: { items: [], mappings: {} },
    });

    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [plantcodeAll, plantcodeRequired, controlevalstandarddAll, sitecodeAll, sitecodeRequired, factorycodeRequired] =
                    await Promise.all([
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode" }),
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }),
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "controlevalstandard", param4: "X" }),
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "sitecode", }),
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "sitecode", param4: "X"}),
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "factorycode", param4: "X"}),
                    ]);
                setDropdownData({
                    plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired)},
                    sitecode: { items: sitecodeAll, mappings: CommonFunction.convertData(sitecodeRequired)},
                    controlevalstandard: { items: controlevalstandarddAll, mappings: CommonFunction.convertData(controlevalstandarddAll)},
                    factorycode: { items: factorycodeRequired, mappings: CommonFunction.convertData(factorycodeRequired)},
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
                cellEditorParams: { values: Object.keys(dropdownData.plantcode.mappings)},
                valueParser: (params) => params.value,
                valueFormatter: (params) => dropdownData.plantcode.mappings[params.value],
                editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"),
                minWidth: 100,
            },
            {
                field: "sitecode",
                headerName: "설비위치",
                cellEditor: "agSelectCellEditor",
                cellEditorParams: { values: Object.keys(dropdownData.sitecode.mappings)},
                valueParser: (params) => params.newValue,
                valueFormatter: (params) => dropdownData.sitecode.mappings[params.value],
                editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"),
                minWidth: 100,
            },
            {
                field: "targetusagebyfactoryid",
                headerName: "제어ID",
                editable: false,
                minWidth: 100,
            },
            {
                field: "contractdemand",
                headerName: "계약전력(kw)",
                editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"),
                cellDataType: "number",
                minWidth: 130,
                cellClass: "text-right",
                valueFormatter: params => {
                    const value = params.value;
                    if (value == null || value === "") return "";
                    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                },
            },
            {
                field: "goalpeakpower",
                headerName: "최대전력(kw)",
                editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"),
                cellDataType: "number",
                minWidth: 130,
                cellClass: "text-right",
                valueFormatter: params => {
                    const value = params.value;
                    if (value == null || value === "") return "";
                    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                },
            },
            {
                field: "stablearea",
                headerName: "안정화구간(kw)",
                editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"),
                cellDataType: "number",
                minWidth: 130,
                cellClass: "text-right"
            },
            {
                field: "warningarea",
                headerName: "경고구간(kw)",
                editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"),
                cellDataType: "number",
                minWidth: 130,
                cellClass: "text-right"
            },
            {
                field: "limitarea",
                headerName: "차단구간(kw)",
                editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"),
                cellDataType: "number",
                minWidth: 130,
                cellClass: "text-right"
            },
            {
                field: "waittimenextequcheck",
                headerName: "설비제어주기(초)",
                editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"),
                cellDataType: "number",
                minWidth: 140,
                cellClass: "text-right",
                valueFormatter: params => {
                    const value = params.value;
                    if (value == null || value === "") return "";
                    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                },
            },
            {
                field: "waittimenextequrun",
                headerName: "설비제어해제주기(초)",
                editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"),
                cellDataType: "number",
                minWidth: 160,
                cellClass: "text-right",
                valueFormatter: params => {
                    const value = params.value;
                    if (value == null || value === "") return "";
                    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                },
            },
            {
                field: "waittimeequstate",
                headerName: "전력현황체크주기(초)",
                editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"),
                cellDataType: "number",
                minWidth: 160,
                cellClass: "text-right",
                valueFormatter: params => {
                    const value = params.value;
                    if (value == null || value === "") return "";
                    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                },
            },
            {
                field: "totalequipmentcheckdealy",
                headerName: "전체설비체크주기(초)",
                editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"),
                cellDataType: "number",
                minWidth: 160,
                cellClass: "text-right",
                valueFormatter: params => {
                    const value = params.value;
                    if (value == null || value === "") return "";
                    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                },
            },
            {
                field: "controlevalustandard",
                headerName: "제어판정기준",
                cellEditor: "agSelectCellEditor",
                cellEditorParams: { values: Object.keys(dropdownData.controlevalstandard.mappings) }, // 드롭다운 콤보박스 세팅.
                // 드롭다운 세팅
                valueParser: (params) => params.newValue, // 실제 처리 값은 ValueMember
                valueFormatter: (params) => dropdownData.controlevalstandard.mappings[params.value], // 드롭다운의 Display member 로 보이기. 
                editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"),
                minWidth: 150,
            },
            {
                field: "registdate",
                headerName: "적용시작일",
                editable: false,
                cellRenderer: (params) => (
                    <Auto_Grid_InputDate_AGgrid
                    value={params.value}
                    onValueChange={(newValue) => params.setValue(newValue)}
                    disable={!(params.data?.rowstatus === "C" || params.data?.rowstatus === "P")}
                    />
                ),
                minWidth: 120,
            },

            {
                field: "goaldaypower",
                headerName: "시간당 목표 사용량(kwh)",
                editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"),
                cellDataType: "number",
                minWidth: 180,
                cellClass: "text-right",
                valueFormatter: params => {
                    const value = params.value;
                    if (value == null || value === "") return "";
                    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                },
            },
            {
                field: "goalmonpower",
                headerName: "일별 목표 사용량(kwh)",
                editable: (params) => (params.data?.rowstatus === "C" || params.data?.rowstatus === "P"),
                cellDataType: "number",
                minWidth: 170,
                cellClass: "text-right",
                valueFormatter: params => {
                    const value = params.value;
                    if (value == null || value === "") return "";
                    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                },
            },
            {
                field: "useflag",
                headerName: "사용여부",
                editable: false,
                cellRenderer: (params) => (<Auto_Grid_Checkbox_AGgrid value={params.value} onValueChange={(newValue) => params.setValue(newValue)} />),
                minWidth: 85
            },
            {
                field: "makedate",
                headerName: "등록일시",
                editable: false,
                minWidth: 160,
                valueFormatter: params => {
                    const val = params.value;
                    if (!val) return "";
                    // 'T' 제거하고 밀리초 제거
                    return val.split(".")[0].replace("T", " ");
                },
            },
            {
                field: "maker",
                headerName: "등록자",
                editable: false,
                minWidth: 120
            },
            { field: "rowstatus", headerName: "상태", hide: true,},
        ],
        [dropdownData]
    );

    
    return (
        <div className="space-y-5">
            <TitleBar title="제어관리"/>
            <Card noborder>
                <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-y-6">
                    <div className="flex flex-col gap-y-1">
                        <div className="flex flex-wrap gap-x-24 items-end gap-y-1">
                            <Auto_SearchDropDown
                                label="사업장"
                                id="plantcode"
                                onChange={(item) => updateSearchParams("plantcode", item)}
                                inputWidth="217px"
                                horizontal
                                dropDownData={dropdownData.plantcode.items}
                                labelSpacing={"-mr-1"}
                            />
                            <Auto_SearchDropDown
                                label="동"
                                onChange={(item) => updateSearchParams("sitecode", item)}
                                inputWidth="217px"
                                horizontal
                                dropDownData={dropdownData.sitecode.items}
                                labelSpacing={"-mr-1"}
                            />
                            <Auto_Radio_Useflag
                                useValue={searchParams.useflag}
                                setUseValue={(value) => updateSearchParams("useflag", value)}
                            />
                        </div>
                        <div className="flex flex-wrap gap-x-24 items-center gap-y-1">
                            
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
            {Object.values(dropdownData).some(({ items }) => items.length === 0) ? (
                <Loading />
            ): (
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
                            title={"제어 관리"}
                        />
                        <Auto_Button_Column_State
                            columnDefs={columnDefs}
                            gridRef={gridRef}
                        />
                        <Auto_Button_Question
                            description={
                                <>
                                    [계약전력] 한전 계약 전력 <br/>
                                    [최대 전력] 공장에서 설정한 관리 한계 <br/>
                                    [제어판정 기준] 제어 기준 유효전력(15분평균) or 예측전력<br/>
                                    [설비제어주기] 한 설비 제어 후 다음 설비 제어 대기 시간<br/>
                                    [설비제어해제주기] 제어해제 후 다음 제어해제 대기 시간<br/>
                                    [전력현황체크주기] 동 별 전력 구간 확인 주기.<br/> 
                                    [전체설비체크주기] 전체설비 감지 후 다음 감지 까지 대기 시간.<br/>
                                    [시간/일별 목표 사용량] 각 동 별 목표 사용량 설정.<br/> 
                                    <br/>
                                    * 설비 상태 제어 구간 별 동작<br/>
                                    안정화 ~ 경고 :  제어된 설비 제어상태 해제.<br/>
                                    경고 ~ 차단 : 전력 추이를 지켜보는 구간,제어/해제 하지않음.<br/>
                                    차단 구간 ~ : 설비 제어(SCR 신호 차단).<br/>
                                </>}
                            direction="down"
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
                            modifyAddress="baseinfo/factorytargetusage-cud"
                            setExcuteSuccesAndSearch={setExcuteSuccesAndSearch}
                            gridRef={gridRef}
                            setAddData={setAddData}
                        />
                        </div>
                    </div>
                    <Auto_AgGrid
                        gridType="recipient"
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

export default FactoryTargetUsage;