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
import GaugeChart from "react-gauge-chart";
import useDarkMode from "@/services/hooks/useDarkMode";
import Icon from "@/components/ui/Icon";

const PowerFactorQuality = () => {
    const [isDark] = useDarkMode();
    const [gridData, setGridData] = useState([]);
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

    const search_address = "monitoring/powerfactorquality-r";

    // 차트데이터로 변환
    const formatChartData = (data) => {
        const labels = data.map(item => {
            return item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);;
        });
        const power_factor_avg_data = data.map(item => item.power_factor_avg);
        const power_factor_max_data = data.map(item => item.power_factor_max);
        const power_factor_min_data = data.map(item => item.power_factor_min);

        return {
            label: "RealtimePowerFactorTrend_1point",
            labels: labels,
            datas: [
                {
                    name: '평균역률',
                    type: "line",
                    data: power_factor_avg_data
                },
                {
                    name: '최대',
                    type: "column",
                    data: power_factor_max_data
                },
                {
                    name: '최소',
                    type: "column",
                    data: power_factor_min_data
                },
            ]
        };
    };
    
    // 그리드 데이터 변환 (pivot)
    function pivotForAgGrid(data) {
        if (data.length === 0) return [];
        const power_factor_avg_Row = { metric: "평균 역률" };
        const power_factor_max_Row = { metric: "최대" };
        const power_factor_min_Row = { metric: "최소" };

        data.forEach((item, idx) => {
            const day = item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);
            power_factor_avg_Row[day] = item.power_factor_avg;
            power_factor_max_Row[day] = item.power_factor_max;
            power_factor_min_Row[day] = item.power_factor_min;
        });
        return [
            power_factor_avg_Row,
            power_factor_max_Row,
            power_factor_min_Row
        ];
    }
    
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
                    if (val != null && !isNaN(val)) {
                        // 소수점 셋째 자리까지 자르기 (반올림 없음)
                        return (Math.floor(Number(val) * 1000) / 1000).toString();
                    }
                    return '';
                }
            }))
        ];
    }, [gridData]);

    // rawData에서 SUM(kw_total_sum) / SUM(kva_total_sum) 계산하는 함수
    const calculatePowerFactorFromSums = (rawData) => {
        if (!rawData || rawData.length === 0) {
            return 0;
        }

        const totalKw = rawData.reduce((sum, item) => {
            return sum + (item.kw_total_sum || 0);
        }, 0);

        const totalKva = rawData.reduce((sum, item) => {
            return sum + (item.kva_total_sum || 0);
        }, 0);

        if (totalKva === 0) {
            return 0;
        }

        return totalKw / totalKva;
    };
    
    // rawData에서 가장 낮은 power_factor_min 값을 구하는 함수
    const getLowestPowerFactorMin = (rawData) => {
        if (!rawData || rawData.length === 0) {
            return 0;
        }

        // power_factor_min 값이 존재하는 데이터만 필터링
        const validData = rawData.filter(item => 
            item.power_factor_min !== null && 
            item.power_factor_min !== undefined && 
            !isNaN(item.power_factor_min)
        );

        if (validData.length === 0) {
            return 0;
        }

        // 가장 낮은 값 찾기
        const lowestValue = Math.min(...validData.map(item => item.power_factor_min));
        return lowestValue;
    };
    
    // 실시간 역률 데이터 구하기
    const lastData = rawData.length ? rawData[rawData.length - 1] : {};
    const nowData_percent = lastData.power_factor_now ? lastData.power_factor_now * 100 : 0;
    const nowData_state = lastData.power_factor_now ? 
        (nowData_percent >= 95 && nowData_percent <= 97 ? "정상" : 
        (nowData_percent >= 92 && nowData_percent < 95) || nowData_percent > 97 ? "주의" : "경고") : "";
    const nodwData_color = lastData.power_factor_now ? 
        (nowData_state === "정상" ? "bg-emerald-500" : 
        nowData_state === "주의" ? "bg-amber-400" : "bg-rose-600") : "";
        
    // 조회된 기간 내 역률 값 구하기
    const calculatedPowerFactor = useMemo(() => {
        return calculatePowerFactorFromSums(rawData);
    }, [rawData]);
    const calculatedPowerFactorPercent = calculatedPowerFactor * 100;
    const calculatePowerFactorState = calculatedPowerFactorPercent ? 
        (calculatedPowerFactorPercent >= 95 && calculatedPowerFactorPercent <= 97 ? "정상" : 
        (calculatedPowerFactorPercent >= 92 && calculatedPowerFactorPercent < 95) || calculatedPowerFactorPercent > 97 ? "주의" : "경고") : "";
    const calculatedPowerFactorColor = calculatedPowerFactor ? 
        (calculatePowerFactorState === "정상" ? "bg-emerald-500" : 
        calculatePowerFactorState === "주의" ? "bg-amber-400" : "bg-rose-600") : "";
        
    // 조회된 기간 내 최소 역률 값 구하기
    const lowestPowerFactorMin = useMemo(() => {
        return getLowestPowerFactorMin(rawData);
    }, [rawData]);
    const lowestPowerFactorMinPercent = lowestPowerFactorMin * 100;
    const lowestPowerFactorState = lowestPowerFactorMinPercent ? 
        (lowestPowerFactorMinPercent >= 95 && lowestPowerFactorMinPercent <= 97 ? "정상" : 
        (lowestPowerFactorMinPercent >= 92 && lowestPowerFactorMinPercent < 95) || lowestPowerFactorMinPercent > 97 ? "주의" : "경고") : "";
    const lowestPowerFactorColor = lowestPowerFactorMin ? 
        (lowestPowerFactorState === "정상" ? "bg-emerald-500" : 
        lowestPowerFactorState === "주의" ? "bg-amber-400" : "bg-rose-600") : "";
    
    // 조회 후 데이터 변경
    useEffect(() => {
        setGridData(pivotForAgGrid(rawData));
        setChartData(formatChartData(rawData));
    }, [rawData]);

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
                setGridData={setRawData}
                excuteSuccesAndSearch={excuteSuccesAndSearch}
                isDate={true}
            />
            <Card noborder>
                <div className="flex justify-between items-center mb-5 space-x-10 h-full">
                    <div className=" ltr:pr-4 rtl:pl-4 flex item-center justify-between">
                        <span className="mr-2 font-medium lg:text-xl capitalize">실시간 역률 상태</span>
                        <Auto_Button_Question
                            description={"조회된 기간 내 데이터를 바탕으로 가장 최근의 역률 상태, 기간 내 역률 평균, 역률 최저를 나타냅니다."}
                        />
                    </div>
                    <div className="flex justify-between items-center h-full">
                        <div className="border-2 h-full p-2 rounded-lg">
                            역률 관리 기준 | 정상 : 95% &le; 역률 &le; 97% | <span className="text-yellow-500">주의 : 92% &le; 역률 &lt; 95%, 역률 &gt; 97% </span>| <span className="text-red-700">경고 : 역률 &lt; 92% </span> 
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between mt-3">
                    <div className="w-full lg:w-[33%] sm:w-full lg:pr-4 ">
                        <div className="w-full h-full bg-slate-200 p-3 dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="flex flex-col gap-3 h-full">
                                <div className="flex-1 grid grid-cols-0 md:grid-cols-4 items-center gap-3 mb-2">
                                    <div className="md:col-span-2 font-semibold text-lg ml-3">역률 상태</div>
                                    <div className={`md:col-span-2 w-[80%] h-[0.8vw] p-5 mr-5 flex text-[1.0vw] rounded-xl
                                                    justify-center text-center items-center ${nodwData_color}`}>
                                        <div className={`leading-none font-semibold ${
                                                        nowData_state === "주의" ? "text-slate-900 dark:!text-slate-900"
                                                        : "text-white dark:!text-white"
                                                        }`}>{nowData_state ? nowData_state : ""}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 items-center gap-3">
                                <div className="md:col-span-2 font-semibold text-xl ml-5">현재 : {nowData_percent ? nowData_percent.toFixed(2) : "0.00"}%</div>
                                <div className="md:col-span-3 h-full relative w-full">
                                    <GaugeChart
                                        id="power-factor-analysis-gauge-chart"
                                        nrOfLevels={420}
                                        arcsLength={[0.2, 0.3, 0.2, 0.3]}
                                        colors={["#EA4228", "#F5CD19", "#5BE12C", "#F5CD19"]}
                                        percent={nowData_percent ? nowData_percent < 90? 0 : (nowData_percent - 90) / 10 : 0}
                                        textColor={isDark ? "#cbd5e1" : "#0f172a"}
                                        arcPadding={0.02}
                                        hideText={true}
                                    />
                                    <div className="absolute left-2 bottom-0 text-xs text-slate-600 dark:text-slate-300">
                                        90%
                                    </div>
                                    <div className="absolute right-2 bottom-0 text-xs text-slate-600 dark:text-slate-300">
                                        100%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[33%] sm:w-full lg:pr-4 ">
                        <div className="w-full h-full bg-slate-200 p-3 dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="flex flex-col gap-3 h-full">
                                <div className="flex-1 grid grid-cols-0 md:grid-cols-4 items-center gap-3 mb-2">
                                    <div className="md:col-span-2 font-semibold text-lg ml-3">역률 평균</div>
                                    <div className={`md:col-span-2 w-[80%] h-[0.8vw] p-5 mr-5 flex text-[1.0vw] rounded-xl
                                                    justify-center text-center items-center ${calculatedPowerFactorColor}`}>
                                        <div className={`leading-none font-semibold ${
                                                        calculatePowerFactorState === "주의" ? "text-slate-900 dark:!text-slate-900"
                                                        : "text-white dark:!text-white"
                                                        }`}>{calculatePowerFactorState}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 items-center gap-3">
                                <div className="md:col-span-2 font-semibold text-xl ml-5">현재 : {calculatedPowerFactorPercent.toFixed(2)}%</div>
                                <div className="md:col-span-3 h-full relative w-full">
                                    <GaugeChart
                                        id="power-factor-analysis-gauge-chart"
                                        nrOfLevels={420}
                                        arcsLength={[0.2, 0.3, 0.2, 0.3]}
                                        colors={["#EA4228", "#F5CD19", "#5BE12C", "#F5CD19"]}
                                        percent={calculatedPowerFactorPercent < 90? 0 : (calculatedPowerFactorPercent - 90) / 10}
                                        textColor={isDark ? "#cbd5e1" : "#0f172a"}
                                        arcPadding={0.02}
                                        hideText={true}
                                    />
                                    <div className="absolute left-2 bottom-0 text-xs text-slate-600 dark:text-slate-300">
                                        90%
                                    </div>
                                    <div className="absolute right-2 bottom-0 text-xs text-slate-600 dark:text-slate-300">
                                        100%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[33%] sm:w-full lg:pr-4 ">
                        <div className="w-full h-full bg-slate-200 p-3 dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="flex flex-col gap-3 h-full">
                                <div className="flex-1 grid grid-cols-0 md:grid-cols-4 items-center gap-3 mb-2">
                                    <div className="md:col-span-2 font-semibold text-lg ml-3">역률 최저</div>
                                    <div className={`md:col-span-2 w-[80%] h-[0.8vw] p-5 mr-5 flex text-[1.0vw] rounded-xl
                                                    justify-center text-center items-center ${lowestPowerFactorColor}`}>
                                        <div className={`leading-none font-semibold ${
                                                        lowestPowerFactorState === "주의" ? "text-slate-900 dark:!text-slate-900"
                                                        : "text-white dark:!text-white"
                                                        }`}>{lowestPowerFactorState}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 items-center gap-3">
                                <div className="md:col-span-2 font-semibold text-xl ml-5">현재 : {lowestPowerFactorMinPercent.toFixed(2)}%</div>
                                <div className="md:col-span-3 h-full relative w-full">
                                    <GaugeChart
                                        id="power-factor-analysis-gauge-chart"
                                        nrOfLevels={420}
                                        arcsLength={[0.2, 0.3, 0.2, 0.3]}
                                        colors={["#EA4228", "#F5CD19", "#5BE12C", "#F5CD19"]}
                                        percent={lowestPowerFactorMinPercent < 90? 0 : (lowestPowerFactorMinPercent - 90) / 10}
                                        textColor={isDark ? "#cbd5e1" : "#0f172a"}
                                        arcPadding={0.02}
                                        hideText={true}
                                    />
                                    <div className="absolute left-2 bottom-0 text-xs text-slate-600 dark:text-slate-300">
                                        90%
                                    </div>
                                    <div className="absolute right-2 bottom-0 text-xs text-slate-600 dark:text-slate-300">
                                        100%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
            <Card noborder>
                <div className="flex items-center mb-5 space-x-2 h-full">
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData}
                        title={"역률 품질"}
                    />
                    <Auto_Button_Question
                        description={"기간 내 공정 별 설비의 역률 추이를 나타냅니다. 조회기간이 2일 이내이면 시간 단위, 7일 이내이면 4시간 단위, 8일 이상이면 일단위로 나타냅니다. 역률은 공급전력 중 실제 일에 쓰인 비율입니다. 1에 가까울수록 효율적입니다."}
                    />
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData}
                    columnDefs={columnDefs}
                    height={"195"}
                />
                <MixedChart data={chartData} height={300} />
            </Card>
        </div>
    )
};

export default PowerFactorQuality;