import {
  Auto_LabelPopup_Set, CommonFunction, Auto_Popup_CodeName, Auto_GridCellButtonRenderer,
  Auto_AgGrid, TitleBar, Auto_SearchDropDown, DropDownItemGetter,
  Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid,
  Auto_Spliter, Auto_Label_Text_Set, Auto_Radio_Useflag, Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid, Auto_Button_Column_State,
  Auto_DateTimePickerF_T, Bosung_equipmentid_search2, Auto_Button_Question
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useApiUrl } from "@/context/APIContext";
import MixedChart from "@/components/partials/widget/chart/Mixed";

const RealTimeInfo_Heating = () => {
    //////////////////////////////////////////////////////////////////////// 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
    const apiUrl = useApiUrl();  // Backend 접속 정보
    const gridRef= useRef();    // 삭제를 위한 참조 행 정보
    const [gridData, setGridData] = useState([]);  // 그리드 매핑 데이터
    const [rawData,  setRawData]  = useState([]);
    const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false);  // 저장 이후 재조회
    const intervalRef = useRef(null); // interval 참조를 저장하기 위한 ref
    const originalDataRef = useRef(new Map());  // U 업데이트위한 useRef
    const [addDdata, setAddData] = useState([]);  // 추가 대상 리스트
    const [maxminData, setMaxMinData] = useState([]);
    const [normalData, setNormalData] = useState([]);
    //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////
    // 조회 주소
    const searchAdress = "monitoring/realtimeinfo_heating-r"

    const [chartData, setChartData] = useState({
        label: "RealtimeControlStatus",
        labels: [],
        datas: []
    });

     // rawData를 max/min 그룹과 일반 그룹으로 분리하는 함수
    const separateDataGroups = (data) => {
        if (!data || data.length === 0) return { maxMinData: [], normalData: [] };
        
        const maxMinData = [];
        const normalData = [];
        
        data.forEach(item => {
            const maxMinItem = {};
            const normalItem = {};
            
            Object.keys(item).forEach(key => {
                if (key.startsWith('max_') || key.startsWith('min_')) {
                    maxMinItem[key] = item[key];
                } else {
                    normalItem[key] = item[key];
                }
            });
            
            // 빈 객체가 아닌 경우에만 추가
            if (Object.keys(maxMinItem).length > 0) {
                maxMinData.push(maxMinItem);
            }
            if (Object.keys(normalItem).length > 0) {
                normalData.push(normalItem);
            }
        });
        
        return { maxMinData, normalData };
    };

    // 차트데이터로 변환 (maxminData 사용)
    const formatChartData = (maxMinData) => {
        if (!maxMinData || maxMinData.length === 0) {
            return {
                label: "RealtimeControlStatus",
                labels: [],
                datas: []
            };
        }

        // 호기별로 라벨 생성 (1호기~18호기)
        const labels = [];
        const maxData = [];
        const minData = [];

        // 호기별 매핑 정보
        const machineMapping = [
            { label: '1호기', field: 'a01_r' },
            { label: '2호기', field: 'a01_s' },
            { label: '3호기', field: 'a01_t' },
            { label: '4호기', field: 'a02_r' },
            { label: '5호기', field: 'a02_s' },
            { label: '6호기', field: 'a02_t' },
            { label: '7호기', field: 'a03_r' },
            { label: '8호기', field: 'a03_s' },
            { label: '9호기', field: 'a03_t' },
            { label: '10호기', field: 'a04_r' },
            { label: '11호기', field: 'a04_s' },
            { label: '12호기', field: 'a04_t' },
            { label: '13호기', field: 'a05_r' },
            { label: '14호기', field: 'a05_s' },
            { label: '15호기', field: 'a05_t' },
            { label: '16호기', field: 'a06_r' },
            { label: '17호기', field: 'a06_s' },
            { label: '18호기', field: 'a06_t' },
        ];

        const latestMaxMinData = maxMinData[maxMinData.length - 1] || {};

        machineMapping.forEach(machine => {
            labels.push(machine.label);
            maxData.push(latestMaxMinData[`max_${machine.field}`] || 0);
            minData.push(latestMaxMinData[`min_${machine.field}`] || 0);
        });

        return {
            label: "RealtimeControlStatus",
            labels: labels,
            datas: [
                { name: "최대 전류", type: "column", data: maxData },
                { name: "최소 전류", type: "column", data: minData },
            ]
        };
    };

    // 그리드 데이터 변환 (pivot) - maxminData 사용
    function pivotForAgGrid(maxMinData) {
        if (!maxMinData || maxMinData.length === 0) return [];
        
        const result = [];
        
        // Max 행과 Min 행 생성
        const maxRow = { metric: "최대 전류" };
        const minRow = { metric: "최소 전류" };

        // 호기별 매핑 정보
        const machineMapping = [
            { label: '1호기', field: 'a01_r' },
            { label: '2호기', field: 'a01_s' },
            { label: '3호기', field: 'a01_t' },
            { label: '4호기', field: 'a02_r' },
            { label: '5호기', field: 'a02_s' },
            { label: '6호기', field: 'a02_t' },
            { label: '7호기', field: 'a03_r' },
            { label: '8호기', field: 'a03_s' },
            { label: '9호기', field: 'a03_t' },
            { label: '10호기', field: 'a04_r' },
            { label: '11호기', field: 'a04_s' },
            { label: '12호기', field: 'a04_t' },
            { label: '13호기', field: 'a05_r' },
            { label: '14호기', field: 'a05_s' },
            { label: '15호기', field: 'a05_t' },
            { label: '16호기', field: 'a06_r' },
            { label: '17호기', field: 'a06_s' },
            { label: '18호기', field: 'a06_t' },
        ];

        // 각 데이터 포인트별로 처리 (시간대별)
        maxMinData.forEach((item, idx) => {
            
            machineMapping.forEach(machine => {
                maxRow[`${machine.label}`] = item[`max_${machine.field}`] || 0;
                minRow[`${machine.label}`] = item[`min_${machine.field}`] || 0;
            });
        });

        result.push(maxRow, minRow);
        return result;
    }

    // 조회 후 데이터 변경
    useEffect(() => {
        const { maxMinData, normalData } = separateDataGroups(rawData);
        setMaxMinData(maxMinData);
        setNormalData(normalData);
        
        // 차트와 그리드 데이터 업데이트
        setChartData(formatChartData(maxMinData));
        setGridData(pivotForAgGrid(maxMinData));
    }, [rawData]);

    const columnDefs = useMemo(() => {
        // 동적 컬럼 생성
        const keys = gridData[0]
            ? Object.keys(gridData[0]).filter(key => key !== 'metric')
            : [];

        return [
            {
                field: 'metric',
                headerName: '',
                cellClass: "text-center",
                minWidth: 140,
                pinned: 'left'
            },
            ...keys.map(key => ({
                field: key,
                headerName: key.replace('_', ' '),
                cellClass: "text-right",
                editable: false,
                minWidth: 80,
                valueFormatter: (params) => {
                    const val = params.value;
                    return val != null && !isNaN(val)
                        ? Number(val).toFixed(2)
                        : '';
                },
                cellClassRules: {
                    // 10 이하: 빨간색 배경 + 흰색 텍스트
                    'bg-red-500 text-white': (params) => {
                        const val = params.value;
                        return val != null && !isNaN(val) && Number(val) <= 10;
                    },
                    // 20 이하 (10 초과): 주황색 배경 + 흰색 텍스트
                    'bg-orange-500 text-white': (params) => {
                        const val = params.value;
                        return val != null && !isNaN(val) && Number(val) > 10 && Number(val) <= 20;
                    },
                }
            }))
        ];
    }, [gridData]);
    
    const lastData = normalData.length ? normalData[normalData.length - 1] : {};

    // 값에 따른 색상 클래스를 반환하는 함수
    const getStatusColor = (value) => {
        if (value <= 10) {
            return 'bg-red-500 text-white'; // 10 이하: 빨간색
        } else if (value <= 20) {
            return 'bg-orange-500 text-white'; // 20 이하: 주황색
        } else {
            return 'bg-slate-200 dark:bg-slate-600 dark:text-white'; // 기본: 회색
        }
    };
    // 10초마다 자동 재조회 설정
    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setExcuteSuccesAndSearch(prev => !prev);
        }, 10000); // 10초

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);
    return (
        <div className="space-y-5">
            <Bosung_equipmentid_search2 setGridData={setRawData} searchAdress={searchAdress} excuteSuccesAndSearch={excuteSuccesAndSearch}/>
            <Card noborder>
                <div className="flex  items-center justify-between mt-3">
                    <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 ">
                        <div className="ltr:pr-4 rtl:pl-4 flex item-center mb-2">
                            <span className="mr-2 font-medium lg:text-xl capitalize ">
                                실시간 정보
                            </span>
                            <Auto_Button_Question
                                description="현재 시간을 기준으로 설비의 현재 전력을 나타냅니다. 10초마다 재조회됩니다."
                            />
                        </div>
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">현재전력</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{lastData.kw_total ? (lastData.kw_total).toFixed(2) : 0} kW</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[90%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a01_r || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">1호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a01_r ? lastData.a01_r.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a01_s || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">2호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a01_s ? lastData.a01_s.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a01_t || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">3호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a01_t ? lastData.a01_t.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a02_r || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">4호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a02_r ? lastData.a02_r.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a02_s || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">5호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a02_s ? lastData.a02_s.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a02_t || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">6호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a02_t ? lastData.a02_t.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a03_r || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">7호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a03_r ? lastData.a03_r.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a03_s || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">8호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a03_s ? lastData.a03_s.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a03_t || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">9호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a03_t ? lastData.a03_t.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a04_r || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">10호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a04_r ? lastData.a04_r.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a04_s || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">11호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a04_s ? lastData.a04_s.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a04_t || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">12호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a04_t ? lastData.a04_t.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a05_r || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">13호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a05_r ? lastData.a05_r.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a05_s || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">14호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a05_s ? lastData.a05_s.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a05_t || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">15호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a05_t ? lastData.a05_t.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a06_r || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">16호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a06_r ? lastData.a06_r.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a06_s || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">17호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a06_s ? lastData.a06_s.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[11%] sm:w-full lg:pr-4 mb-2">
                            <div className={`w-full p-3 flex place-content-between items-center justify-between text-[0.8vw] rounded-xl ${getStatusColor(lastData.a06_t || 0)}`}>
                                <div className="ml-3 mt-2 mb-2">18호기</div>
                                <div className="font-semibold mr-3 mt-2 mb-2">{lastData.a06_t ? lastData.a06_t.toFixed(2) : 0} A</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
            <Card noborer>
                <div className="flex justify-between items-center mb-5">
                    <div className="text-xl">
                        <span className="mr-2">호기 별 1시간 전력 추이</span>
                        <Auto_Button_Question
                            description={"최근 1시간의 데이터를 기준으로 각 호기 별 최대 전류, 최소 전류를 나타냅니다."}
                        />
                    </div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData}
                        title={"실시간 정보 - 가열로 히팅"}
                    />
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData}
                    columnDefs={columnDefs}
                    height={"137"}
                />
                <MixedChart data={chartData} height={300} />
            </Card>
        </div>
    )
}

export default RealTimeInfo_Heating