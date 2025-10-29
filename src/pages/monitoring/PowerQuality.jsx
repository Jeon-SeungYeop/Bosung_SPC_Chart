import {
  Auto_LabelPopup_Set, CommonFunction, Auto_Popup_CodeName, Auto_GridCellButtonRenderer, Auto_AgGrid, TitleBar, Auto_SearchDropDown,
  DropDownItemGetter, Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid, Auto_Spliter, Auto_Label_Text_Set,
  Auto_Radio_Useflag, Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid, Auto_Button_Column_State, Auto_DateTimePickerF_T, Auto_Button_Question
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import Bosung_equipmentid_search4 from "@/components/bosungcomponent/Bosung_equipmentid_search4";
import MixedChart from "@/components/partials/widget/chart/Mixed";

const PowerQuality = () => {
    // 그리드 매핑 데이터
    const [gridData, setGridData] = useState([]);
    const [gridData_sec, setGridData_Sec] = useState([]);
    const [gridData_thd, setGridData_Thd] = useState([]);
    // rawData만 저장
    const [rawData, setRawData] = useState([]);
    const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
    const intervalRef = useRef(null); // interval 참조를 저장하기 위한 ref
    const apiUrl = useApiUrl();
    // Default Chart Data(페이지 로드시 오류 방지)
    const [chartData, setChartData] = useState({
        label: "load-ratio",
        labels: [],
        datas: []
    });
    const [chartData_sec, setChartData_Sec] = useState({
        label: "load-ratio",
        labels: [],
        datas: []
    });
    const [chartData_thd, setChartData_Thd] = useState({
        label: "load-ratio",
        labels: [],
        datas: []
    });

    const search_address = "monitoring/powerquality-r";

    // 전력 부하 통계 계산 함수
    const calculatePowerLoadStats = (data) => {
        if (!data || data.length === 0) {
            return { avgVoltage_ln_avgLoad: 0, avgVoltage_thd_avgLoad: 0, avgFrequencyLoad: 0, avgKw_totalLoad: 0};
        }

        // 평균전압: avg_voltage_ln_avg의 평균값
        const avgVoltage_ln_avg = data
            .map(item => item.avg_voltage_ln_avg)
            .filter(value => value != null && !isNaN(value));
        
        // 평균THD: avg_voltage_thd_avg의 평균값
        const avgVoltage_thd_avg = data
            .map(item => item.avg_voltage_ln_avg)
            .filter(value => value != null && !isNaN(value));
        
        // 평균 주파수: avg_frequency의 평균값
        const avgFrequency = data
            .map(item => item.avg_frequency)
            .filter(value => value != null && !isNaN(value));

        // 평균 전류: avg_kw_total의 평균값
        const avgKw_total = data
            .map(item => item.avg_kw_total)
            .filter(value => value != null && !isNaN(value));

        const avgVoltage_ln_avgLoad = avgVoltage_ln_avg.length > 0 
            ? avgVoltage_ln_avg.reduce((sum, value) => sum + value, 0) / avgVoltage_ln_avg.length 
            : 0;
        
        const avgVoltage_thd_avgLoad = avgVoltage_thd_avg.length > 0 
            ? avgVoltage_thd_avg.reduce((sum, value) => sum + value, 0) / avgVoltage_thd_avg.length 
            : 0;
        
        const avgFrequencyLoad = avgFrequency.length > 0 
            ? avgFrequency.reduce((sum, value) => sum + value, 0) / avgFrequency.length 
            : 0;

        const avgKw_totalLoad = avgKw_total.length > 0 
            ? avgKw_total.reduce((sum, value) => sum + value, 0) / avgKw_total.length 
            : 0;

        return {
            avgVoltage_ln_avgLoad: Number(avgVoltage_ln_avgLoad.toFixed(2)),
            avgVoltage_thd_avgLoad: Number(avgVoltage_thd_avgLoad.toFixed(2)),
            avgFrequencyLoad: Number(avgFrequencyLoad.toFixed(2)),
            avgKw_totalLoad: Number(avgKw_totalLoad.toFixed(2)),
        };
    };

    // rawData의 전력 부하 통계값 계산
    const powerLoadStats = useMemo(() => {
        return calculatePowerLoadStats(rawData);
    }, [rawData]);

    // 차트데이터로 변환
    const formatChartData = (data) => {
        const labels = data.map(item => {
            return item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);;
        });
        const avg_voltage_ln_avg_data = data.map(item => item.avg_voltage_ln_avg);
        const max_data = data.map(() => 418);
        const min_data = data.map(() => 382);
        return {
            label: "RealtimePowerFactorTrend_1point",
            labels: labels,
            datas: [
                {
                    name: '전압',
                    type: "line",
                    data: avg_voltage_ln_avg_data
                },
                {
                    name: '전압상한',
                    type: "line",
                    data: max_data,
                },
                {
                    name: '전압하한',
                    type: "line",
                    data: min_data,
                },
            ]
        };
    };
    const formatChartData_sec = (data) => {
        const labels = data.map(item => {
            return item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);
        });
        const avg_frequency_data = data.map(item => item.avg_frequency);
        const max_data = data.map(() => 60.2);
        const min_data = data.map(() => 59.8);
        return {
            label: "RealtimePowerFactorTrend_1point",
            labels: labels,
            datas: [
                {
                    name: '주파수',
                    type: "line",
                    data: avg_frequency_data
                },
                {
                    name: '주파수상한',
                    type: "line",
                    data: max_data
                },
                {
                    name: '주파수하한',
                    type: "line",
                    data: min_data
                },
            ]
        };
    };
    const formatChartData_thd = (data) => {
        const labels = data.map(item => {
            return item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);;
        });
        const avg_voltage_thd_avg_data = data.map(item => item.avg_voltage_thd_avg);
        const max_data = data.map(() => 15);
        return {
            label: "RealtimePowerFactorTrend_1point",
            labels: labels,
            datas: [
                {
                    name: 'THD',
                    type: "line",
                    data: avg_voltage_thd_avg_data
                },
                {
                    name: '고조파상한',
                    type: "line",
                    data: max_data
                },
            ]
        };
    };

    // 그리드 데이터 변환 (pivot)
    function pivotForAgGrid(data) {
        if (data.length === 0) return [];
        const avg_voltage_ln_avg_Row = { metric: "전압(V)" };


        data.forEach((item, idx) => {
            const day = item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);
            avg_voltage_ln_avg_Row[day] = item.avg_voltage_ln_avg;
        });
        return [
            avg_voltage_ln_avg_Row,
        ];
    }
    function pivotForAgGrid_sec(data) {
        if (data.length === 0) return [];
        const avg_frequency_Row = { metric: "주파수(Hz)" };


        data.forEach((item, idx) => {
            const day = item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);
            avg_frequency_Row[day] = item.avg_frequency;
        });
        return [
            avg_frequency_Row,
        ];
    }
    function pivotForAgGrid_thd(data) {
        if (data.length === 0) return [];
        const avg_voltage_thd_avg_Row = { metric: "THD(%)" };


        data.forEach((item, idx) => {
            const day = item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);
            avg_voltage_thd_avg_Row[day] = item.avg_voltage_thd_avg;
        });
        return [
            avg_voltage_thd_avg_Row,
        ];
    }


    // 조회 후 데이터 변경
    useEffect(() => {
        setGridData(pivotForAgGrid(rawData));
        setGridData_Sec(pivotForAgGrid_sec(rawData));
        setGridData_Thd(pivotForAgGrid_thd(rawData));
        setChartData(formatChartData(rawData));
        setChartData_Sec(formatChartData_sec(rawData));
        setChartData_Thd(formatChartData_thd(rawData));
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
                minWidth: 80,
                pinned: 'left'
            },
            ...keys.map(key => ({
                field: key,
                headerName: key,
                cellClass: "text-right",
                editable: false,
                minWidth: 110,
                valueFormatter: (params) => {
                    const val = params.value;
                    return val != null && !isNaN(val)
                        ? Number(val).toFixed(2)
                        : '';
                }
            }))
        ];
    }, [gridData]);
    // 10분마다 자동 재조회 설정
    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setExcuteSuccesAndSearch(prev => !prev);
        }, 600000); // 10분

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);
    return (
        <div className="space-y-5">
            <Bosung_equipmentid_search4
                adress={search_address}
                setGridData={setRawData}
                excuteSuccesAndSearch={excuteSuccesAndSearch}
                isDate={true}
            />
            <Card noborder>
                <div className="ltr:pr-4 rtl:pl-4 flex item-center">
                    <span className="mr-2 font-medium lg:text-xl capitalize ">
                        전력 부하 분석
                    </span>
                    <Auto_Button_Question
                        description="조회 기간 내 데이터를 바탕으로 평균 전압, 평균 THD(고조파), 평균 주파수와 평균 전류를 나타냅니다."
                    />
                </div>
                <div className="flex flex-wrap items-center justify-between mt-3">
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">평균 전압</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{powerLoadStats.avgVoltage_ln_avgLoad} V</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">평균(THD)</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{powerLoadStats.avgVoltage_thd_avgLoad} %</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">평균 주파수</div>
                            <div className="font-semibold mt-2 mb-2">{powerLoadStats.avgFrequencyLoad} Hz</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">평균 전류</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{powerLoadStats.avgKw_totalLoad} A</div>
                        </div>
                    </div>
                </div>
            </Card>
            <Card noborder>
                <div className="flex justify-between items-center mb-5">
                    <div className="text-xl">
                        <span className="mr-2">전압 품질 추이</span>
                        <Auto_Button_Question
                            description={"기간 내 전압 품질 추이를 나타냅니다. 조회기간이 2일 이내이면 시간 단위, 7일 이내이면 4시간 단위, 8일 이상이면 일단위로 나타냅니다."}
                        />
                    </div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData}
                        title={"전력 품질 - 전압 품질 추이"}
                    />
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData}
                    columnDefs={columnDefs}
                    height={"111"}
                />
                <div className="flex justify-end items-center mt-3">
                    <div className="font-semibold text-lg mr-5">전압 상한 : {418}</div>
                    <div className="font-semibold text-lg mr-5">전압 하한 : {382}</div>
                </div>
                <MixedChart data={chartData} height={300} />
            </Card>
            <Card noborder>
                <div className="flex justify-between items-center mb-5">
                    <div className="text-xl">
                        <span className="mr-2">주파수 품질 추이</span>
                        <Auto_Button_Question
                            description={"기간 내 주파수 품질 추이를 나타냅니다. 조회기간이 2일 이내이면 시간 단위, 7일 이내이면 4시간 단위, 8일 이상이면 일단위로 나타냅니다."}
                        />
                    </div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData_sec}
                        title={"전력 품질 - 주파수 품질 추이"}
                    />
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData_sec}
                    columnDefs={columnDefs}
                    height={"111"}
                />
                <div className="flex justify-end items-center mt-3">
                    <div className="font-semibold text-lg mr-5">주파수 상한 : {60.2}</div>
                    <div className="font-semibold text-lg mr-5">주파수 하한 : {59.8}</div>
                </div>
                <MixedChart data={chartData_sec} height={300} />
            </Card>
            <Card noborder>
                <div className="flex justify-between items-center mb-5">
                    <div className="text-xl">
                        <span className="mr-2">고조파(THD) 품질 추이</span>
                        <Auto_Button_Question
                            description={"기간 내 고조파(THD) 품질 추이를 나타냅니다. 조회기간이 2일 이내이면 시간 단위, 7일 이내이면 4시간 단위, 8일 이상이면 일단위로 나타냅니다."}
                        />
                    </div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData_thd}
                        title={"전력 품질 - 고조파 추이"}
                    />
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData_thd}
                    columnDefs={columnDefs}
                    height={"111"}
                />
                <div className="flex justify-end items-center mt-3">
                    <div className="font-semibold text-lg mr-5">고조파 상한 : {15}</div>
                </div>
                <MixedChart data={chartData_thd} height={300} />
            </Card>
        </div>
    )
};

export default PowerQuality;