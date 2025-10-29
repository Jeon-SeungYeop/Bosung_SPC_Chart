import {
  Auto_LabelPopup_Set, CommonFunction, Auto_Popup_CodeName, Auto_GridCellButtonRenderer, Auto_AgGrid, TitleBar, Auto_SearchDropDown,
  DropDownItemGetter, Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid, Auto_Spliter, Auto_Label_Text_Set,
  Auto_Radio_Useflag, Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid, Auto_Button_Column_State, Auto_DateTimePickerF_T, Auto_Button_Question
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import Bosung_equipmentid_search from "@/components/bosungcomponent/Bosung_equipmentid_search";
import MixedChart from "@/components/partials/widget/chart/Mixed";

const Realtime = () => {
    const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
    const intervalRef = useRef(null); // interval 참조를 저장하기 위한 ref
    // 그리드 매핑 데이터
    const [gridData, setGridData] = useState([]);
    const [gridData_sec, setGridData_Sec] = useState([]);
    const [gridData_thd, setGridData_Thd] = useState([]);

    // rawData만 저장
    const [rawData, setRawData] = useState([]);
    const [nowArray, setNowArray] = useState([]);
    const [voltageArray, setVoltageArray] = useState([]);
    const [frequencyArray, setFrequencyArray] = useState([]);
    const [factorArray, setFactorArray] = useState([]);
    
    // Default Chart Data(페이지 로드시 오류 방지)
    const [chartData, setChartData] = useState({
        label: "RealtimeControlStatus",
        labels: [
            
        ],
        datas: [
            
        ]
    });
    const [chartData_sec, setChartData_Sec] = useState({
        label: "RealtimeControlStatus",
        labels: [
            
        ],
        datas: [
            
        ]
    });
    const [chartData_thd, setChartData_Thd] = useState({
        label: "RealtimeControlStatus",
        labels: [
            
        ],
        datas: [
            
        ]
    });

    const search_address = "monitoring/realtime-r";

    // 차트데이터로 변환  - 전력
    const formatChartData = (data) => {
        const labels = data.map((_, idx) => (idx).toString());
        const Usage_kwh_net_Data = data.map(item => item.usage_kwh_net);
        const Volate_ln_avg_Data = data.map(item => item.voltage_ln_avg);

        return {
            label: "RealtimeElectricityForecast_1point",
            labels: labels,
            datas: [
                { name: "전압", type: "line", data: Volate_ln_avg_Data },
                { name: "누적 전력", type: "area", data: Usage_kwh_net_Data },
            ]
        };
    };
    // 차트데이터로 변환  - 주파수
    const formatChartData_sec = (data) => {
        const labels = data.map((_, idx) => (idx).toString());
        const Frequency_Data = data.map(item => item.frequency);
        const Kw_total_Data = data.map(item => item.kw_total);

        return {
            label: "RealtimeElectricityForecast_4point",
            labels: labels,
            datas: [
                { name: "주파수", type: "line", data: Frequency_Data },
                { name: "전류", type: "line", data: Kw_total_Data },
            ]
        };
    };
    // 차트데이터로 변환  - 역률
    const formatChartData_thd = (data) => {
        const labels = data.map((_, idx) => (idx).toString());
        const Power_factor_avg_Data = data.map(item => item.power_factor_avg);
        
        return {
            label: "RealtimePowerFactorTrend_1point",
            labels: labels,
            datas: [
                { name: "역률", type: "line", data: Power_factor_avg_Data, },
            ]
        };
    };

    // 그리드 데이터 변환 (pivot) - 전력
    function pivotForAgGrid(data) {
        if (data.length === 0) return [];
        const Usage_kwh_net_Row = { metric: "누적 전력(kW)" };
        const Voltage_ln_avg_Row = { metric: "전압(kW)" };


        data.forEach((item, idx) => {
            const day = (idx).toString();
            Usage_kwh_net_Row[day] = item.usage_kwh_net;
            Voltage_ln_avg_Row[day] = item.voltage_ln_avg;
        });
        return [
            Usage_kwh_net_Row,
            Voltage_ln_avg_Row
        ];
    }
    // 그리드 데이터 변환 (pivot) - 주파수
    function pivotForAgGrid_sec(data) {
        if (data.length === 0) return [];
        const Frequency_Row = { metric: "주파수(Hz)" };
        const Kw_total_Row = { metric: "전류(kW)" };


        data.forEach((item, idx) => {
            const day = (idx).toString();
            Frequency_Row[day] = item.frequency;
            Kw_total_Row[day] = item.kw_total;
        });
        return [
            Frequency_Row,
            Kw_total_Row
        ];
    }
    // 그리드 데이터 변환 (pivot) - 역률
    function pivotForAgGrid_thd(data) {
        if (data.length === 0) return [];
        const Power_factor_avg_Row = { metric: "역률(%)" };


        data.forEach((item, idx) => {
            const day = (idx).toString();
            Power_factor_avg_Row[day] = item.power_factor_avg;
        });
        return [
            Power_factor_avg_Row,
        ];
    }

    // 조회 후 데이터 변경
    useEffect(() => {
        if (rawData && typeof rawData === 'object') {
            if (rawData.nowArray && rawData.nowArray.jbody) {
                setNowArray(rawData.nowArray.jbody);
            }
            if (rawData.voltageArray && rawData.voltageArray.jbody) {
                setVoltageArray(rawData.voltageArray.jbody);
            }
            if (rawData.freqArray && rawData.freqArray.jbody) {
                setFrequencyArray(rawData.freqArray.jbody);
            }
            if (rawData.powerArray && rawData.powerArray.jbody) {
                setFactorArray(rawData.powerArray.jbody);
            }
        }
    }, [rawData]);

    useEffect(() =>{
        setGridData(pivotForAgGrid(voltageArray));
        setChartData(formatChartData(voltageArray));
        setGridData_Sec(pivotForAgGrid_sec(frequencyArray));
        setChartData_Sec(formatChartData_sec(frequencyArray));
        setGridData_Thd(pivotForAgGrid_thd(factorArray));
        setChartData_Thd(formatChartData_thd(factorArray));
    }, [voltageArray, frequencyArray, factorArray])

    // 24개의 행 고정
    const HOUR_FIELDS = useMemo(() => Array.from({ length: 24 }, (_, i) => String(i )), []);
    const columnDefs = useMemo(() => {
        return [
            {
            field: 'metric',
            headerName: '',
            cellClass: "text-center",
            minWidth: 220,
            pinned: 'left'
            },
            ...HOUR_FIELDS.map((key) => ({
            field: key,
            headerName: key,
            cellClass: "text-right",
            editable: false,
            minWidth: 90,
            valueFormatter: (params) => {
                const val = params.value;
                const metric = params.data?.metric || '';
                
                if (val != null && !isNaN(val)) {
                    // 누적 전력은 소수점 없이 정수로, 천 단위 콤마
                    if (metric.includes('누적 전력')) {
                        return Math.floor(Number(val)).toLocaleString('ko-KR');
                    }
                    // 나머지는 소수점 셋째 자리까지, 천 단위 콤마
                    return (Math.floor(Number(val) * 1000) / 1000).toLocaleString('ko-KR', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 3
                    });
                }
                return '';
            }
            }))
        ];
    }, [HOUR_FIELDS]);

    // rawData의 마지막 인덱스 요소를 꺼내서 사용
    const lastData = nowArray.length ? nowArray[nowArray.length - 1] : {};
    
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
            <Bosung_equipmentid_search
                adress={search_address}
                excuteSuccesAndSearch={excuteSuccesAndSearch}
                setGridData={setRawData}
            />
            <Card noborder className="mt-3">
                <div className="ltr:pr-4 rtl:pl-4 flex item-center">
                    <span className="mr-2 font-medium lg:text-xl capitalize ">
                        실시간 정보
                    </span>
                    <Auto_Button_Question
                        description="현재 시간을 기준으로 사용된 총 전력, 최대 부하, 전압, 역률을 나타냅니다. 10초마다 재조회됩니다."
                    />
                </div>
                <div className="flex flex-wrap items-center justify-between mt-3">
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">총 사용전력(kW)</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{lastData.sum_usage_kwh_net ? Number((lastData.sum_usage_kwh_net).toFixed(2)).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 0} kWh</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">최대부하</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{lastData.max_kw_total_max ? (lastData.max_kw_total_max).toFixed(2) : 0} kWh</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">전압</div>
                            <div className="font-semibold mt-2 mb-2">{lastData.avg_voltage_ln_avg ? (lastData.avg_voltage_ln_avg).toFixed(2) : 0} kW</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">역률</div>
                            <div className="font-semibold mt-2 mb-2">{lastData.power_factor ? (Math.floor(lastData.power_factor * 100) / 100).toFixed(2) : 0} %</div>
                        </div>
                    </div>
                </div>
            </Card>
            <Card noborder>
                <div className="flex items-center justify-between mb-5 space-x-10 h-full">
                    <div className="text-xl">
                        <span className="mr-2">전력 정보</span>
                        <Auto_Button_Question
                            description={"금일 시간 별 누전 전력과 전압을 나타냅니다. 전압이 높을수록 같은 시간 동안 더 많은 전기 에너지가 전달되므로, 전력량이 더 크게 누적됩니다."}
                        />
                    </div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData}
                        title={"실시간 정보 - 전력 정보"}
                    />
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData}
                    columnDefs={columnDefs}
                    height={"150"}
                />
                <MixedChart data={chartData} height={300} />
            </Card>
            <Card noborder>
                <div className="flex items-center justify-between mb-5 space-x-10 h-full">
                    <div className="text-xl">
                        <span className="mr-2">전류 / 주파수</span>
                        <Auto_Button_Question
                            description={"금일 시간 별 전류와 주파수를 나타냅니다. 전류가 높을수록 설비에 더 힘이 걸려 주파수가 내려갑니다."}
                        />
                    </div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData_sec}
                        title={"실시간 정보 - 전류/주파수"}
                    />
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData_sec}
                    columnDefs={columnDefs}
                    height={"150"}
                />
                <MixedChart data={chartData_sec} height={300} />
            </Card>
            <Card noborder>
                <div className="flex items-center justify-between mb-5 space-x-10 h-full">
                    <div className="text-xl">
                        <span className="mr-2">역률</span>
                        <Auto_Button_Question
                            description={"금일 시간 별 역률을 나타냅니다. 역률은 공급전력 중 실제 일에 쓰인 비율입니다. 1에 가까울수록 효율적입니다."}
                        />
                    </div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData_thd}
                        title={"실시간 정보 - 역률"}
                    />
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData_thd}
                    columnDefs={columnDefs}
                    height={"111"}
                />
                <MixedChart data={chartData_thd} height={300} />
            </Card>
        </div>
    );
}

export default Realtime;