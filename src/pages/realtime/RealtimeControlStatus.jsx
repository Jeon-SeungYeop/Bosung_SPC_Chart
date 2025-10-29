import {
  Auto_LabelPopup_Set, CommonFunction, Auto_Popup_CodeName, Auto_GridCellButtonRenderer,
  Auto_AgGrid, TitleBar, Auto_SearchDropDown, DropDownItemGetter,
  Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid,
  Auto_Spliter, Auto_Label_Text_Set, Auto_Radio_Useflag, Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid, Auto_Button_Column_State,
  Auto_DateTimePickerF_T, Auto_Button_Question
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import MixedChart from "@/components/partials/widget/chart/Mixed";
import { load_ratio_mix } from "@/services/constant/data";
import Bosung_equipmentid_search3 from "@/components/bosungcomponent/Bosung_equipmentid_search3";

const RealtimeControlStatus = () => {
    //////////////////////////////////////////////////////////////////////// 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
    const apiUrl = useApiUrl();  // Backend 접속 정보
    const gridRef= useRef();    // 삭제를 위한 참조 행 정보
    const [gridData, setGridData] = useState([]);  // 그리드 매핑 데이터
    const [gridSubData, setGridSubData] = useState([]);  // 그리드 Sub 매핑 데이터
    const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false);  // 저장 이후 재조회
    const originalDataRef = useRef(new Map());  // U 업데이트위한 useRef
    const [addDdata, setAddData] = useState([]);  // 추가 대상 리스트
    
    // 스플리터 크기 상태 추가
    const [leftPanelHeight, setLeftPanelHeight] = useState(250); // 초기 높이값
    
    //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////
    const [chartData, setChartData] = useState({
        label: "load-ratio",
        labels: [
            
        ],
        datas: [
            
        ]
    });
    const primaryKeys_g2 = ["plantcode"];
    const [enterSearch, setEnterSearch] = useState(false); // 엔터 키로 검색하기 위한 변수

    // 차트데이터로 변환
    const formatChartData = (rawData) => {
        const labels = rawData.map((_, idx) => (idx + 1).toString());
        const voltageData = rawData.map(item => item.voltage_ln_avg);
        const frequencyData = rawData.map(item => item.frequency);
        const powerData = rawData.map(item => item.kw_total);

        return {
            label: "RealtimeControlStatus",
            labels: labels,
            datas: [
                {
                    name: "전압",
                    type: "line", 
                    data: voltageData
                },
                {
                    name: "주파수",
                    type: "line",
                    data: frequencyData
                },
                {
                    name: "전력",
                    type: "column",
                    data: powerData
                }
            ]
        };
    };

    // 2그리드 데이터 변환
    function pivotForAgGrid(data) {
        const voltageRow = { metric: '전압' };
        const powerRow   = { metric: '전력' };
        const freqRow    = { metric: '주파수' };

        data.forEach((item, idx) => {
            const day = (idx + 1).toString();
            voltageRow[day] = item.voltage_ln_avg;
            powerRow[day]   = item.kw_total;
            freqRow[day]    = item.frequency;
        });

        return [voltageRow, powerRow, freqRow];
    }

    const [searchParams, setSearchParams] = useState({
        plantcode: "",
        sitecode: "",
        equipmentid: "",
        startdate: "",
        enddate: "",
    });
    // 검색조건 변경 즉시 반영 (setSearchParams 이후 선언할 것)
    const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
    // 조회 조건 및 조회 정보
    const searchinfo = useMemo(
        () => ({
            address: "realtime/realtimecontrolstatus-r1",
            params: {
                plantcode: searchParams.plantcode?.value ?? "",
                sitecode : searchParams.sitecode?.value ?? "",
                equipmentid: searchParams.equipmentid?.value ?? "",
                startdate: searchParams.startdate ?? "",
                enddate: searchParams.enddate ?? "",
            },
        }),
        [searchParams]
    );

    // 드롭다운 데이터 상태
    const [dropdownData, setDropdownData] = useState({
        plantcode: { items: [], mappings: {} },
        sitecode: { items: [], mappings: {} },
        factorycode: { items: [], mappings: {} },
        area_kw_total: { items: {}, mappings: {} },
        area_demand_kw_total_prediction: { items: {}, mappings: {} },
    })

    // 드롭다운 데이터 로드
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [plantcodeAll, plantcodeRequired, factorycodeRequired, area_kw_totalRequired, area_demand_kw_total_predictionRequired, sitecodeAll, sitecodeRequired] =
                    await Promise.all([
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode" }),  // 조회부 콤보박스  
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }),  // 그리드 콤보박스 ( 필수 선택 ) 
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "factorycode", param4: "x"}),
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "peakarea", param4: "x"}),
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "peakarea", param4: "x"}),
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "sitecode", }),
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "sitecode", param4: "X"})
                    ]);
                setDropdownData({
                    plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired)},
                    factorycode: { items: factorycodeRequired, mappings: CommonFunction.convertData(factorycodeRequired)},
                    area_kw_total: { items: area_kw_totalRequired, mappings: CommonFunction.convertData(area_kw_totalRequired)},
                    area_demand_kw_total_prediction: { items: area_demand_kw_total_predictionRequired, mappings: CommonFunction.convertData(area_demand_kw_total_predictionRequired)},
                    sitecode: { items: sitecodeAll, mappings: CommonFunction.convertData(sitecodeRequired)},
                });
            } catch(error){

            }
        };

        loadDropdownData();
    }, [apiUrl]);

    // 그리드1 컬럼 정의
    const columnDefs = useMemo(
        () => [
            {
                headerName: "제어 설비",
                headerClass: "text-center",
                children: [
                    {
                        field: "insertdate",
                        headerName: "제어일시",
                        editable: false,
                        valueFormatter: params => {
                            const val = params.value;
                            if (!val) return "";
                            // 'T' 제거하고 밀리초 제거
                            return val.split(".")[0].replace("T", " ");
                        },
                        minWidth: 120,
                    },
                    {
                        field: "factorycode",
                        headerName: "공장",
                        cellEditor: "agSelectCellEditor",
                        cellEditorParams: { values: Object.keys(dropdownData.factorycode.mappings)},
                        valueParser: (params) => params.newValue,
                        valueFormatter: (params) => dropdownData.factorycode.mappings[params.value],
                        editable: false,
                        minWidth: 100,
                        hide: true,
                    },
                    {
                        field: "sitecode",
                        headerName: "설비위치",
                        cellEditor: "agSelectCellEditor",
                        cellEditorParams: { values: Object.keys(dropdownData.sitecode.mappings)},
                        valueParser: (params) => params.newValue,
                        valueFormatter: (params) => dropdownData.sitecode.mappings[params.value],
                        editable: false,
                        minWidth: 100,
                    },
                    {
                        field: "processname",
                        headerName: "공정",
                        editable: false,
                        minWidth: 100,
                    },
                    {
                        field: "equipmentid",
                        headerName: "설비ID",
                        editable: false,
                        minWidth: 100,
                        hide: true
                    },
                    {
                        field: "equipmentname",
                        headerName: "설비명",
                        editable: false,
                        minWidth: 100,
                    },
                ]
            },
            {
                headerName: "제어시점 공장 전력 현황",
                headerClass: "text-center",
                children: [
                    {
                        field: "targetusagebyfactoryid",
                        headerName: "목표치ID",
                        editable: false,
                        minWidth: 100,
                        hide: true,
                    },
                    {
                        field: "goalpeakpower",
                        headerName: "설정목표치",
                        editable: false,
                        minWidth: 100,
                        cellDataType: "number",
                        cellClass: "text-right"
                    },
                    {
                        field: "kw_total",
                        headerName: "측정전력",
                        editable: false,
                        minWidth: 100,
                        cellDataType: "number",
                        cellClass: "text-right",
                        valueFormatter: (params) => {  // 소수점 둘째 자리까지 포맷
                            const val = params.value;
                            return val != null && !isNaN(val)
                                ? Number(val).toFixed(2)
                                : '';
                        },
                    },
                    {
                        field: "demand_kw_total_prediction",
                        headerName: "예측전력",
                        editable: false,
                        minWidth: 100,
                        cellDataType: "number",
                        cellClass: "text-right",
                        valueFormatter: (params) => {  // 소수점 둘째 자리까지 포맷
                            const val = params.value;
                            return val != null && !isNaN(val)
                                ? Number(val).toFixed(2)
                                : '';
                        },
                    },
                    {
                        field: "area_kw_total",
                        headerName: "유효전력구간",
                        cellEditor: "agSelectCellEditor",
                        cellEditorParams: { values: Object.keys(dropdownData.area_kw_total.mappings)},
                        editable: false,
                        valueParser: (params) => params.newValue,
                        valueFormatter: (params) => dropdownData.area_kw_total.mappings[params.value],
                        minWidth: 150,
                    },
                    {
                        field: "area_demand_kw_total_prediction",
                        headerName: "예측구간",
                        cellEditor: "agSelectCellEditor",
                        cellEditorParams: { values: Object.keys(dropdownData.area_demand_kw_total_prediction.mappings)},
                        editable: false,
                        valueParser: (params) => params.newValue,
                        valueFormatter: (params) => dropdownData.area_demand_kw_total_prediction.mappings[params.value],
                        minWidth: 150,
                    },
                    {
                        field: "controlaction",
                        headerName: "동작",
                        editable: false,
                        minWidth: 100,
                        cellRenderer: (params) => {
                            return params.value ? "설비 제어" : "설비 제어 해제";
                        }
                    },
                ]
            },
        ],
        [dropdownData]
    );

    // 그리드2 컬럼 정의
    const columnDefsSub = useMemo(() => {
    // 동적 컬럼 생성
        const convertGridData = gridSubData.length > 0 
            ? Object.keys(gridSubData[0]).filter(key => key !== 'metric' && !isNaN(key))
            : [];

        return [
            { 
                field: 'metric',
                headerName: '',
                cellClass: "text-center",
                minWidth: 80
            },
            ...convertGridData.map(key => ({
                field: key,
                headerName: key,
                cellClass: (params) => { // 그리드1에서 선택한 행의 값 배경색 지정
                    if (params.colDef.headerName === "15") {
                        return "text-right bg-red-100 dark:bg-slate-700";
                    }
                    return "text-right";
                },
                editable: false,
                minWidth: 80,
                valueFormatter: (params) => {  // 소수점 둘째 자리까지 포맷
                    const val = params.value;
                    return val != null && !isNaN(val)
                        ? Number(val).toFixed(2)
                        : '';
                },
            })),
        ];
    }, [gridSubData]);

    // 그리드1에서 선택한 행의 정보로 그리드2 호출하기
    const grid1KeyData = useRef({ equipmentid: "", insertdate: "",})
    const afterMainGridSelect = async (event) => {
        const selectedRows = event.api.getSelectedRows();

        if (selectedRows.length === 0) return;

        grid1KeyData.current.equipmentid = selectedRows[0].equipmentid
        grid1KeyData.current.insertdate = (selectedRows[0].insertdate).split(".")[0].replace("T", " ")

        // 메인 그리드 클릭 시 서브 그리드 데이터 조회
        inquireSubGrid();
    };

    /////////////// 그리드 2 호출 ////////////////////////////////////////////////////////////////////////
    // 그리드2 데이터 조회 메서드
    const inquireSubGrid = async () => {
        await CommonFunction.fetchAndSetGridData({
            apiUrl,
            searchinfo: {
                ...searchinfosub,
                params: {
                    ...searchinfosub.params,
                    equipmentid: grid1KeyData.current.equipmentid,
                    insertdate: grid1KeyData.current.insertdate,
                },
            },
            setGridData: (data) => {
                const processedData = pivotForAgGrid(data);
                setGridSubData(processedData);
                const chartFormattedData = formatChartData(data);
                setChartData(chartFormattedData);
            },
            originalDataRef,
            primaryKeys: primaryKeys_g2,
            setAddData: setAddData
        });
    };

    const searchinfosub = useMemo(() => ({
        address: "realtime/realtimecontrolstatus-r2",
        params: {
            equipmentid: grid1KeyData.current.equipmentid,
            insertdate: grid1KeyData.current.insertdate,
        },
    }), [searchParams]);

    const [selectedRowindex, setSelectedRowindex] = useState(0);
    
    // 조회된 값이 없을 시 2그리드, 차트데이터 초기화
    useEffect(()=> {
        if (!gridData || gridData.length === 0) {
            setGridSubData([]);
            setChartData({
                label: "RealtimeControlStatus",
                labels: [],
                datas: []
            });
        }
    }, [gridData])

    // 스플리터 크기 변경 핸들러
    const handleSplitterResize = useCallback((event) => {
        const totalHeight = 1500;
        const panelHeight = (totalHeight * event.sizes[0]) / 100;
        const headerHeight = 80; // 제목과 버튼 영역 높이
        const cardPadding = 40; // Card 컴포넌트의 패딩
        const newHeight = panelHeight - headerHeight - cardPadding; // 헤더와 패딩을 제외한 순수 그리드 높이
        setLeftPanelHeight(Math.max(250, newHeight)); // 최소 높이 250px
    }, []);
    
    return (
        <div className="space-y-5">
            <TitleBar title="실시간 제어 현황" />
            <Bosung_equipmentid_search3 
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                searchinfo={searchinfo}
                setGridData={setGridData}
            />
            {Object.values(dropdownData).some(({ items }) => items.length === 0) ? (
            <Loading/>
        ) : (
            <>
                <Auto_Spliter
                    vertical={true}
                    left_width={20}
                    onResize={handleSplitterResize}
                    leftContent={
                        <Card noborder className="h-full">
                            <div className="flex justify-between items-center mb-5">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl leading-none">전력제어이력</span>
                                    <Auto_Button_Question
                                        description="전력관리 Peak Agent를 통해 설비가 제어된 이력을 나타냅니다. 행을 선택 시 아래의 제어시점부하이력에 대한 데이터가 나타납니다."
                                    />
                                </div>
                                <Auto_Button_Export_Excel
                                    columnDefs={columnDefs}
                                    gridData={gridData}
                                    title={"전력제어이력"}
                                />
                            </div>
                            <Auto_AgGrid
                                gridType="sender"
                                gridData={gridData}
                                columnDefs={columnDefs}
                                onSelectionChanged={afterMainGridSelect}
                                selectedRowindex={selectedRowindex}
                                height={leftPanelHeight.toString()}
                            />
                        </Card>
                    }
                    rightContent={
                        <Card noborder>
                            <div className="flex justify-between items-center mb-5">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl leading-none">제어시점부하이력</span>
                                    <Auto_Button_Question
                                        description="선택된 제어이력 데이터를 기준으로 14분 전, 15분 후의 전압, 전력, 주파수를 보여줍니다. 제어에 따른 전력 추이를 쉽게 볼 수 있습니다."
                                    />
                                </div>
                                <Auto_Button_Export_Excel
                                    columnDefs={columnDefsSub}
                                    gridData={gridSubData}
                                    title={"전력제어시점 별 상세 데이터"}
                                />
                            </div>
                            <Auto_AgGrid
                                gridType="sender"
                                gridData={gridSubData}
                                columnDefs={columnDefsSub}
                                height={"195"}
                            />
                            {
                                // gridSubData(또는 chartData.datas)의 길이가 0 초과일 때만 차트 렌더링
                                chartData.datas && chartData.datas.length > 0 && (
                                    <MixedChart data={chartData} height={250}/>
                                )
                            }
                        </Card>
                    }
                />
            </>
        )}
        </div>
    )
};

export default RealtimeControlStatus;