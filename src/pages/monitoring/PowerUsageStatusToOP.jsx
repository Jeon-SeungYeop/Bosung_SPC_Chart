import {
  Auto_GridCellButtonRenderer, CommonFunction, Auto_POPWorkerMaster, Auto_Label_Text_Set,
  Auto_Radio_Useflag, TitleBar, Auto_SearchDropDown, DropDownItemGetter,
  Auto_AgGrid, Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid,
  Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_InputDate_AGgrid, Auto_Spliter, Auto_Grid_Checkbox_AGgrid,
  Auto_Button_Column_State, Auto_DateTimePickerF_T, Auto_Button_Question
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import { AllCommunityModule, ModuleRegistry, colorSchemeDarkBlue, themeQuartz, colorSchemeLight } from "ag-grid-community";
import useDarkmode from "@/services/hooks/useDarkMode";
import Auto_HeatMapChart2 from "@/components/autocomponent/areaChart/Auto_HeatMapChart2";
ModuleRegistry.registerModules([AllCommunityModule]);

const PowerUsageStatusToOP = () => {
    const apiUrl = useApiUrl();
    const gridRef = useRef();
    const [rawData, setRawData] = useState([]);
    const [gridData, setGridData] = useState([]);
    const [gridData_sub, setGridData_sub] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false);

    const [realtimeArray, setRealtimeArray] = useState([]);
    const [gridArray, setGridArray] = useState([]);


    const [searchParams, setSearchParams] = useState({
        plantcode: "",
        processcode: "",
        startdate: "",
    });

    const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
    const searchinfo = useMemo(
        () => ({
            address: "monitoring/powerusagestatustoop-r",
            params: {
                plantcode: searchParams.plantcode?.value ?? "",
                processcode: searchParams.processcode?.value ?? "",
                startdate: searchParams.startdate ?? "",
            },
        }),
        [searchParams]
    );

    // 드롭다운 데이터 상태
    const [dropdownData, setDropdownData] = useState({
        plantcode: { items: [], mappings: {} },
        processcode: { items: [], mappings: {} },
        seasonpertimezone: { items: [], mappings: {} },
    });

    // 드롭다운 데이터 로드 (plantcode, sitecode, process)
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [plantcodeAll, plantcodeRequired, processRequired, seasonpertimezoneRequired] = await Promise.all([
                    DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode" }), // 조회부 콤보박스
                    DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }), // 그리드 콤보박스 (필수 선택)
                    DropDownItemGetter(apiUrl, { param1: "process", param2: "1000", param4: "X" }),
                    DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "seasonpertimezone", param4: "X" }),
                ]);

                setDropdownData((prev) => ({
                    ...prev,
                    plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired) },
                    processcode: { items: processRequired, mappings: CommonFunction.convertData(processRequired) },
                    seasonpertimezone: { items: seasonpertimezoneRequired, mappings: CommonFunction.convertData(seasonpertimezoneRequired) },
                }));
            } catch (error) {
                console.error("드롭다운 데이터 로드 실패:", error);
            }
        };

        loadDropdownData();
    }, [apiUrl]);

    // 피벗 데이터 변환 함수
    const transformToPivotData = (data) => {
        if (!data || data.length === 0) return [];

        // equipmentid별로 그룹화
        const grouped = data.reduce((acc, item) => {
            const key = `${item.equipmentid}_${item.equipmentname}`;
            if (!acc[key]) {
                acc[key] = {
                    equipmentid: item.equipmentid,
                    equipmentname: item.equipmentname,
                    plantcode: item.plantcode,
                    processcode: item.processcode,
                    collectdate: item.collectdate,
                    powerusage: item.powerusage,
                    totaldurationminutes: item.totaldurationminutes,
                    hourlyData: {}
                };
            }
            
            const hour = item.collecthour;
            acc[key].hourlyData[hour] = {
                usage_kwh: item.usage_kwh,
                usage_per: item.usage_per,
                seasonpertimezone: item.seasonpertimezone
            };
            
            return acc;
        }, {});

        // 배열로 변환
        return Object.values(grouped).map(equipment => {
            // 시간대별 usage_kwh 합계 계산
            let totalUsageKwh = 0;
            
            const row = {
                equipmentid: equipment.equipmentid,
                equipmentname: equipment.equipmentname,
                plantcode: equipment.plantcode,
                processcode: equipment.processcode,
                collectdate: equipment.collectdate,
                powerusage: equipment.powerusage,
                totaldurationminutes: (equipment.totaldurationminutes / 60).toFixed(1),
            };

            // 시간대별 데이터 추가 및 합계 계산
            for (let hour = 0; hour < 24; hour++) {
                const hourData = equipment.hourlyData[hour] || {};
                const usageKwh = hourData.usage_kwh || 0;
                
                row[`hour_${hour}_usage`] = usageKwh;
                row[`hour_${hour}_per`] = hourData.usage_per ? hourData.usage_per.toFixed(1) : 0;
                row[`hour_${hour}_zone`] = hourData.seasonpertimezone || '';
                
                // 합계에 추가
                totalUsageKwh += Number(usageKwh);
            }
            
            // 설비별 총 사용전력 추가
            row.usage_kwh = totalUsageKwh.toFixed(2);

            return row;
        });
    };

    const columnDefs = useMemo(() => {
        const baseColumns = [
            {
                field: 'equipmentname',
                headerName: '설비명',
                cellClass: "text-center",
                minWidth: 120,
                pinned: 'left'
            },
            {
                field: 'powerusage',
                headerName: '일간목표전력(kWh)',
                cellClass: "text-right",
                minWidth: 140,
            },
            {
                field: 'totaldurationminutes',
                headerName: '가동시간(H)',
                cellClass: "text-right",
                minWidth: 120,
            },
            {
                field: 'usage_kwh',
                headerName: '사용전력(kWh)',
                cellClass: "text-right",
                minWidth: 120,
            },
        ];

        // 숨김 필드
        const hiddenColumns = [
            { field: 'equipmentid', headerName: '설비ID', hide: true },
            { field: 'plantcode', headerName: '사업장', hide: true },
            { field: 'processcode', headerName: '공정', hide: true },
            { field: 'collectdate', headerName: '수집일', hide: true }
        ];

        // 시간대별 컬럼 생성 (0~23시)
        const hourColumns = [];
        const seasonOptions = Object.keys(dropdownData.seasonpertimezone.mappings);
        
        for (let hour = 0; hour < 24; hour++) {
            hourColumns.push({
                headerName: `${hour}`,
                children: [
                    {
                        field: `hour_${hour}_usage`,
                        headerName: '사용전력',
                        cellClass: "text-right",
                        minWidth: 90,
                        valueFormatter: params => params.value ? Number(params.value).toFixed(0) : '0'
                    },
                    {
                        field: `hour_${hour}_per`,
                        headerName: '%',
                        cellClass: "text-right",
                        minWidth: 70,
                        valueFormatter: params => params.value ? `${params.value}%` : '0%'
                    },
                    {
                        field: `hour_${hour}_zone`,
                        headerName: '구간',
                        cellClass: "text-center",
                        minWidth: 120,
                        editable: false,
                        cellEditor: "agSelectCellEditor",
                        cellEditorParams: {
                            values: seasonOptions
                        },
                        valueFormatter: (params) => {
                            if (!params.value) return '';
                            const displayValue = dropdownData.seasonpertimezone.mappings[params.value] || params.value;
                            return displayValue.replace(/^\[.{4}\]\s/, '');
                        },
                    }
                ]
            });
        }

        return [...baseColumns, ...hiddenColumns, ...hourColumns];
    }, [dropdownData.seasonpertimezone.mappings]);

    const columnDefs_sub = useMemo(() => [
        {
            field: 'runstopstatus',
            headerName: "가동상태",
            cellClass: "text-center",
            editable: false,
            valueFormatter: (params) => {
                if (params.value == "10") {
                    return '승온'
                }
                else if (params.value == "20") {
                    return '예열'
                }
                else if (params.value == "30") {
                    return '침탄'
                }
                else if (params.value == "40") {
                    return '확산'
                }
                else if (params.value == "50") {
                    return '강온'
                }
                else if (params.value == "60") {
                    return '소입'
                }
                else if (params.value == "99") {
                    return '종료'
                }
                else if (params.value == "1") {
                    return '가동'
                }
                else if (params.value == "0") {
                    return '비가동'
                }
                else {
                    return '상태 측정 오류'
                }
            }
        },
        {
            field: 'starttime',
            headerName: "시작시간",
            cellClass: "text-center",
            editable: false,
            valueFormatter: (params) => {
                if (!params.value) return '';
                // T를 공백으로 변경하고 소수점 이하 제거
                return params.value.replace('T', ' ').split('.')[0];
            }
        },
    ])

    // 그리드1에서 선택한 행의 정보로 그리드2 호출하기
    const grid1keyData = useRef({ plantcode: "", processcode: "", startdate: "", equipmentid: ""})
    const afterMainGridSelect = async (event) => {
        const selectedRows = event.api.getSelectedRows();

        if (selectedRows.length === 0) return;

        grid1keyData.current.plantcode = selectedRows[0].plantcode;
        grid1keyData.current.processcode = selectedRows[0].processcode;
        grid1keyData.current.startdate = selectedRows[0].collectdate;
        grid1keyData.current.equipmentid = selectedRows[0].equipmentid;

        // 메인 그리드 클릭 시 서브 그리드 데이터 조회
        inquireSubGrid();
    };

    const searchinfosub = useMemo(() => ({
        address: "monitoring/powerusagestatustoop-r2",
        params: {
            plantcode: grid1keyData.current.plantcode,
            processcode: grid1keyData.current.processcode,
            startdate: grid1keyData.current.startdate,
            equipmentid: grid1keyData.current.equipmentid,
        },
    }), [searchParams])

    // 그리드2 데이터 조회 메서드
    const inquireSubGrid = async () => {
        await CommonFunction.fetchAndSetGridData({
            apiUrl,
            searchinfo: {
                ...searchinfosub,
                params: {
                    ...searchinfosub.params,
                    plantcode: grid1keyData.current.plantcode,
                    processcode: grid1keyData.current.processcode,
                    startdate: grid1keyData.current.startdate,
                    equipmentid: grid1keyData.current.equipmentid
                },
            },
            setGridData: setGridData_sub,
        });
    };

    const [selectedRowindex, setSelectedRowindex] = useState(0);
    
    // 조회된 값이 없을 시 2그리드, 차트데이터 초기화
    useEffect(()=> {
        if (!gridData || gridData.length === 0) {
            setGridData_sub([]);
            setChartData();
        }
    }, [gridData]);

    useEffect(() => {
        if (rawData.realtimeArray?.jbody) {
            setRealtimeArray(rawData.realtimeArray.jbody[0]);
        }
        if (rawData.gridArray?.jbody) {
            const newGridArray = rawData.gridArray.jbody;
            setGridArray(newGridArray);
            // 피벗 데이터로 변환
            const pivotData = transformToPivotData(newGridArray);
            setGridData(pivotData);
        }
    }, [rawData])

    return (
        < div className="space-y-5">
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
                                dropDownData={dropdownData.plantcode.items}
                                labelSpacing={'mr-3'}
                            />
                            <Auto_SearchDropDown
                                label="공정"
                                onChange={(item) => updateSearchParams("processcode", item)}
                                inputWidth="217px"
                                horizontal
                                dropDownData={dropdownData.processcode.items}
                                labelSpacing={'mr-3'}
                            />
                            <Auto_DateTimePickerF_T
                                label="일자"
                                onChangeStart={(val) => updateSearchParams("startdate", val)}
                                labelSpacing=""
                                oneDate={true}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-end h-full">
                        <Auto_Button_Search_AGgrid
                            searchinfo={searchinfo}
                            setGridData={setRawData}
                            excuteSuccesAndSearch={excuteSuccesAndSearch}
                        />
                    </div>
                </div>
            </Card>
            <Card noborder>
                <div className="ltr:pr-4 rtl:pl-4 flex item-center">
                    <span className="mr-2 font-medium lg:text-xl capitalize ">
                        실시간 정보
                    </span>
                </div>
                <div className="flex flex-wrap items-center justify-between mt-3">
                    <div className="w-full lg:w-[20%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">평균 가동 시간</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{realtimeArray?.op_time ? ((realtimeArray.op_time)/60).toFixed(1) : 0} H</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">총 사용 전력(kWh)</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{realtimeArray?.usage_kwh ? (realtimeArray.usage_kwh).toFixed(2) : 0} kWh</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[20%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">최대 부하 시간</div>
                            <div className="font-semibold mt-2 mb-2">{realtimeArray?.max_hour ? (realtimeArray.max_hour) : 0} H</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[35%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">최대 부하 시간 사용 전력</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{realtimeArray?.max_usage_kwh ? (realtimeArray.max_usage_kwh).toFixed(2) : 0} kW</div>
                        </div>
                    </div>
                </div>
            </Card>
            <Card noborder>
                <Auto_Spliter
                    left_width={75}
                    leftContent={
                        <>
                            <Auto_AgGrid
                                gridType="sender"
                                gridData={gridData}
                                columnDefs={columnDefs}
                                onSelectionChanged={afterMainGridSelect}
                                selectedRowindex={selectedRowindex}
                                height={400}
                            />
                        </>
                    }
                    rightContent={
                        <>
                            <Auto_AgGrid
                                gridType="sender"
                                gridData={gridData_sub}
                                columnDefs={columnDefs_sub}
                                height={400}
                            />
                        </>
                    }
                />
            </Card>
            <Card noborder>
                <Auto_Button_Question
                    description="각 설비당 시간대 별 사용전력을 %로 나타냅니다."
                />
                <Auto_HeatMapChart2
                    gridData={gridData}
                />
            </Card>
        </div>
    )
};

export default PowerUsageStatusToOP;