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

const PowerFactorQualityAnalysis = () => {
    const [isDark] = useDarkMode();
    // 그리드 매핑 데이터
    const [gridData, setGridData] = useState([]);
    const [gridData_heat, setGridData_heat] = useState([]);
    const [gridData_temp, setGridData_temp] = useState([]);
    const [gridData_clean, setGridData_clean] = useState([]);
    const [gridData_comp, setGridData_comp] = useState([]);
    const [gridData_warn, setGridData_warn] = useState([]);
    // rawData만 저장
    const [rawData, setRawData] = useState([]);
    const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
    const apiUrl = useApiUrl();
    // Default Chart Data(페이지 로드시 오류 방지)
    const [chartData, setChartData] = useState({
        label: "load-ratio",
        labels: [],
        datas: []
    });

    const search_address = "dataanalysis/powerfactorqualityanalysis-r";

    // 역률 품질 통계 계산 함수
    const calculatePowerFactorQualityStats = (data) => {
        if (!data || data.length === 0) {
            return { total_percent: 0, a_percent: 0, b_percent: 0, c_percent : 0,
                     total_state: '', a_state: '', b_state: '', c_state: '',
                     total_color: 'bg-slate-300 ', a_color: 'bg-slate-300 ', b_color: 'bg-slate-300 ', c_color: 'bg-slate-300 '
            };
        }

        // 전체 kw_total_sum
        const kwTotalSumValues = data
            .map(item => item.kw_total_sum)
            .filter(value => value != null && !isNaN(value));

        // A동 kw_total_sum
        const kwTotalSumValuesA = data
            .filter(item => item.sitecode == 'A')
            .map(item => item.kw_total_sum)
            .filter(value => value != null && !isNaN(value));

        // B동 kw_total_sum
        const kwTotalSumValuesB = data
            .filter(item => item.sitecode == 'B')
            .map(item => item.kw_total_sum)
            .filter(value => value != null && !isNaN(value));

        // C동 kw_total_sum
        const kwTotalSumValuesC = data
            .filter(item => item.sitecode == 'C')
            .map(item => item.kw_total_sum)
            .filter(value => value != null && !isNaN(value));
        

        // 전체 kva_total_sum
        const kvaTotalSumValues = data
            .map(item => item.kva_total_sum)
            .filter(value => value != null && !isNaN(value));
        
        // A동 kva_total_sum
        const kvaTotalSumValuesA = data
            .filter(item => item.sitecode == 'A')
            .map(item => item.kva_total_sum)
            .filter(value => value != null && !isNaN(value));

        // B동 kva_total_sum
        const kvaTotalSumValuesB = data
            .filter(item => item.sitecode == 'B')
            .map(item => item.kva_total_sum)
            .filter(value => value != null && !isNaN(value));

        // C동 kva_total_sum
        const kvaTotalSumValuesC = data
            .filter(item => item.sitecode == 'C')
            .map(item => item.kva_total_sum)
            .filter(value => value != null && !isNaN(value));

        const total_percent = kwTotalSumValues.length > 0 && kvaTotalSumValues.length > 0
            // ? 93 // test용
            ? kwTotalSumValues.reduce((sum, value) => sum + value, 0) / kvaTotalSumValues.reduce((sum, value) => sum + value, 0) * 100
            : 0;

        const total_state = total_percent >= 95 && total_percent <= 97 ? "정상" : (total_percent >= 92 && total_percent < 95) || total_percent > 97 ? "주의" : "경고";
        const total_color = total_state === "정상" ? "bg-emerald-500" : total_state === "주의" ? "bg-amber-400" : "bg-rose-600";
        
        const a_percent = kwTotalSumValuesA.length > 0 && kvaTotalSumValuesA.length > 0
            ? kwTotalSumValuesA.reduce((sum, value) => sum + value, 0) / kvaTotalSumValuesA.reduce((sum, value) => sum + value, 0) * 100
            : 0;
        
        const a_state = a_percent >= 95 && a_percent <= 97 ? "정상" : (a_percent >= 92 && a_percent < 95) || a_percent > 97 ? "주의" : "경고";
        const a_color = a_state === "정상" ? "bg-emerald-500" : a_state === "주의" ? "bg-amber-400" : "bg-rose-600";

        const b_percent = kwTotalSumValuesB.length > 0 && kvaTotalSumValuesB.length > 0 
            ? kwTotalSumValuesB.reduce((sum, value) => sum + value, 0) / kvaTotalSumValuesB.reduce((sum, value) => sum + value, 0) * 100
            : 0;

        const b_state = b_percent >= 95 && b_percent <= 97 ? "정상" : (b_percent >= 92 && b_percent < 95) || b_percent > 97 ? "주의" : "경고";
        const b_color = b_state === "정상" ? "bg-emerald-500" : b_state === "주의" ? "bg-amber-400" : "bg-rose-600";

        const c_percent = kwTotalSumValuesC.length > 0 && kvaTotalSumValuesC.length > 0
            ? kwTotalSumValuesC.reduce((sum, value) => sum + value, 0) / kvaTotalSumValuesC.reduce((sum, value) => sum + value, 0) * 100
            : 0;

        const c_state = c_percent >= 95 && c_percent <= 97 ? "정상" : (c_percent >= 92 && c_percent < 95) || c_percent > 97 ? "주의" : "경고";
        const c_color = c_state === "정상" ? "bg-emerald-500" : c_state === "주의" ? "bg-amber-400" : "bg-rose-600";

        return {
            total_percent: Math.round(total_percent),
            a_percent: Math.round(a_percent),
            b_percent: Math.round(b_percent),
            c_percent: Math.round(c_percent),
            total_state, a_state, b_state, c_state,
            total_color, a_color, b_color, c_color
        };
    };

    // rawData의 역률 통계값 계산
    const powerFactorQualityStats = useMemo(() => {
        const r2_data = rawData.filter(item => item.kind == "R2");
        return calculatePowerFactorQualityStats(r2_data);
    }, [rawData]);

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
            label: "RealtimePowerFactorTrend",
            labels: labels,
            datas: [
                {
                    name: '평균역률',
                    type: "line",
                    data: power_factor_avg_data
                },
                {
                    name: '최대',
                    type: "line",
                    data: power_factor_max_data
                },
                {
                    name: '최소',
                    type: "line",
                    data: power_factor_min_data
                },
            ]
        };
    };

    // 그리드 데이터 변환 (pivot)
    function pivotForAgGrid(data) {
        if (data.length === 0) return [];
        const power_factor_avg_Row = { metric: "평균 역률(%)" };
        const power_factor_max_Row = { metric: "최대(%)" };
        const power_factor_min_Row = { metric: "최소(%)" };

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

    // 조회 후 데이터 변경
    useEffect(() => {
        // 조회조건 데이터
        const r1_data = rawData.filter(item => item.kind == "R1");
        setGridData(pivotForAgGrid(r1_data));
        setChartData(formatChartData(r1_data));

        // 조회기간만 적용한 전체 데이터
        const r2_data = rawData.filter(item => item.kind == "R2");
        // 설비명(n호기) 순서대로 정렬
        const heat_data = r2_data.filter(item => item.processcode == "OP002").sort((a, b) => parseInt(a.equipmentname.split('#')[1]) - parseInt(b.equipmentname.split('#')[1]));
        const temp_data = r2_data.filter(item => item.processcode == "OP003").sort((a, b) => parseInt(a.equipmentname.replace(/[^0-9]/g, '') - parseInt(b.equipmentname.replace(/[^0-9]/g, ''))));
        const clean_data = r2_data.filter(item => item.processcode == "OP001").sort((a, b) => parseInt(a.equipmentname.replace(/[^0-9]/g, '') - parseInt(b.equipmentname.replace(/[^0-9]/g, ''))));
        const comp_data = r2_data.filter(item => item.processcode == "OP004").sort((a, b) => parseInt(a.equipmentname.replace(/[^0-9]/g, '') - parseInt(b.equipmentname.replace(/[^0-9]/g, ''))));
        setGridData_heat(heat_data);
        setGridData_temp(temp_data);
        setGridData_clean(clean_data);
        setGridData_comp(comp_data);

        // 조회조건 내 역률 이상 현황 데이터
        const r3_data = rawData.filter(item => item.kind == "R3");
        setGridData_warn(r3_data);
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

    const columnDefs_heat = useMemo(
        () => [
        { field: "equipmentname",  headerName: "가열로", editable: false, flex: 1.5},
        { field: "power_factor_avg", headerName: "상태", editable: false, cellClass: "text-center",
            cellRenderer: (params) => {
                const pf = Number(params.data?.power_factor_avg ?? NaN);
                const pct = Number.isFinite(pf) ? Math.floor(pf * 100) : null; // 퍼센티지로 변환
                const level = pf >= 0.95 && pf <= 0.97 ? "good" : (pf >= 0.92 && pf < 0.95) || pf > 0.97 ? "warn" : "bad";
                const colorClass =
                level === "good"
                    ? "bg-emerald-500"
                    : level === "warn"
                    ? "bg-amber-400"
                    : "bg-rose-600";

                return (
                    <div className="flex items-center gap-2 justify-between">
                        <span className="ml-2 text-md opacity-70">{pct != null ? `${pct}%` : "-"}</span>
                        <span className={`inline-block w-3 h-3 rounded-full ${colorClass}`} />
                    </div>
                );
            },
        },
        ],
        [gridData_heat]
    );

    const columnDefs_temp = useMemo(
        () => [
        { field: "equipmentname",  headerName: "템퍼링", editable: false, flex: 1.5},
        { field: "power_factor_avg", headerName: "상태", editable: false, cellClass: "text-center",
            cellRenderer: (params) => {
                const pf = Number(params.data?.power_factor_avg ?? NaN);
                const pct = Number.isFinite(pf) ? Math.floor(pf * 100) : null; // 퍼센티지로 변환
                const level = pf >= 0.95 && pf <= 0.97 ? "good" : (pf >= 0.92 && pf < 0.95) || pf > 0.97 ? "warn" : "bad";
                const colorClass =
                level === "good"
                    ? "bg-emerald-500"
                    : level === "warn"
                    ? "bg-amber-400"
                    : "bg-rose-600";

                return (
                    <div className="flex items-center gap-2 justify-between">
                        <span className="ml-2 text-md opacity-70">{pct != null ? `${pct}%` : "-"}</span>
                        <span className={`inline-block w-3 h-3 rounded-full ${colorClass}`} />
                    </div>
                );
            },
        },
        ],
        [gridData_temp]
    );

    const columnDefs_clean = useMemo(
        () => [
        { field: "equipmentname",  headerName: "세척", editable: false, flex: 1.5},
        { field: "power_factor_avg", headerName: "상태", editable: false, cellClass: "text-center",
            cellRenderer: (params) => {
                const pf = Number(params.data?.power_factor_avg ?? NaN);
                const pct = Number.isFinite(pf) ? Math.floor(pf * 100) : null; // 퍼센티지로 변환
                const level = pf >= 0.95 && pf <= 0.97 ? "good" : (pf >= 0.92 && pf < 0.95) || pf > 0.97 ? "warn" : "bad";
                const colorClass =
                level === "good"
                    ? "bg-emerald-500"
                    : level === "warn"
                    ? "bg-amber-400"
                    : "bg-rose-600";

                return (
                    <div className="flex items-center gap-2 justify-between">
                        <span className="ml-2 text-md opacity-70">{pct != null ? `${pct}%` : "-"}</span>
                        <span className={`inline-block w-3 h-3 rounded-full ${colorClass}`} />
                    </div>
                );
            },
        },
        ],
        [gridData_clean]
    );

    const columnDefs_comp = useMemo(
        () => [
        { field: "equipmentname",  headerName: "컴프레셔", editable: false, flex: 1.5},
        { field: "power_factor_avg", headerName: "상태", editable: false, cellClass: "text-center",
            cellRenderer: (params) => {
                const pf = Number(params.data?.power_factor_avg ?? NaN);
                const pct = Number.isFinite(pf) ? Math.floor(pf * 100) : null; // 퍼센티지로 변환
                const level = pf >= 0.95 && pf <= 0.97 ? "good" : (pf >= 0.92 && pf < 0.95) || pf > 0.97 ? "warn" : "bad";
                const colorClass =
                level === "good"
                    ? "bg-emerald-500"
                    : level === "warn"
                    ? "bg-amber-400"
                    : "bg-rose-600";

                return (
                    <div className="flex items-center gap-2 justify-between">
                        <span className="ml-2 text-md opacity-70">{pct != null ? `${pct}%` : "-"}</span>
                        <span className={`inline-block w-3 h-3 rounded-full ${colorClass}`} />
                    </div>
                );
            },
        },
        ],
        [gridData_comp]
    );

    const columnDefs_warn = useMemo(
        () => [
        {
            field: "inserdate",
            headerName: "일시",
            editable: false,
            wrapText: true,        // 줄바꿈 허용
            autoHeight: true,      // 줄바꿈에 맞춰 행 높이 자동 조절
            valueFormatter: params => {
            const val = params.value;
            if (!val) return "";
            // 'T' 제거하고 밀리초 제거
            return val.split(".")[0].replace("T", " ");
            },
        },
        { field: "equipmentname",  headerName: "설비명", editable: false},
        { field: "power_factor_total",  headerName: "역률값", editable: false},
        { field: "level_str",  headerName: "경고등급", editable: false},
        ],
        [gridData_warn]
    );

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
                            description={"역률은 공급전력 중 실제 일에 쓰인 비율입니다. 1에 가까울수록 효율적입니다."}
                        />
                    </div>
                    <div className="flex justify-between items-center h-full">
                        <div className="border-2 h-full p-2 rounded-lg">
                            역률 관리 기준 | 정상 : 95% &le; 역률 &le; 97% | <span className="text-yellow-500">주의 : 92% &le; 역률 &lt; 95%, 역률 &gt; 97% </span>| <span className="text-red-700">경고 : 역률 &lt; 92% </span> 
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between mt-3">
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full h-full bg-slate-200 p-3 dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="flex flex-col gap-3 h-full">
                                <div className="flex-1 grid grid-cols-0 md:grid-cols-4 items-center gap-3 mb-2">
                                    <div className="md:col-span-2 font-semibold text-lg ml-3">전체 역률 상태</div>
                                    <div className={`md:col-span-2 w-[80%] h-[0.8vw] p-5 mr-5 flex text-[1.0vw] rounded-xl
                                                    justify-center text-center items-center ${powerFactorQualityStats.total_color}`}>
                                        <div className={`leading-none font-semibold ${
                                                        powerFactorQualityStats.total_state === "주의" ? "text-slate-900 dark:!text-slate-900"
                                                        : "text-white dark:!text-white"
                                                        }`}>{powerFactorQualityStats.total_state}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 items-center gap-3">
                                <div className="md:col-span-2 font-semibold text-xl ml-5">현재 : {powerFactorQualityStats.total_percent}%</div>
                                <div className="md:col-span-3 h-full relative w-full">
                                    <GaugeChart
                                        id="power-factor-analysis-gauge-chart"
                                        nrOfLevels={420}
                                        arcsLength={[0.2, 0.3, 0.2, 0.3]}
                                        colors={["#EA4228", "#F5CD19", "#5BE12C", "#F5CD19"]}
                                        percent={powerFactorQualityStats.total_percent < 90? 0 : (powerFactorQualityStats.total_percent - 90) / 10}
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
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full h-full bg-slate-200 p-3 dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="flex flex-col gap-3 h-full">
                                <div className="flex-1 grid grid-cols-0 md:grid-cols-4 items-center gap-3 mb-2">
                                    <div className="md:col-span-2 font-semibold text-lg ml-3">A동 역률 상태</div>
                                    <div className={`md:col-span-2 w-[80%] h-[0.8vw] p-5 mr-5 flex text-[1.0vw] rounded-xl
                                                    justify-center text-center items-center ${powerFactorQualityStats.a_color}`}>
                                        <div className={`leading-none font-semibold ${
                                                        powerFactorQualityStats.a_state === "주의" ? "text-slate-900 dark:!text-slate-900"
                                                        : "text-white dark:!text-white"
                                                        }`}>{powerFactorQualityStats.a_state}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 items-center gap-3">
                                <div className="md:col-span-2 font-semibold text-xl ml-5">현재 : {powerFactorQualityStats.a_percent}%</div>
                                <div className="md:col-span-3 h-full relative w-full">
                                    <GaugeChart
                                        id="power-factor-analysis-gauge-chart"
                                        nrOfLevels={420}
                                        arcsLength={[0.2, 0.3, 0.2, 0.3]}
                                        colors={["#EA4228", "#F5CD19", "#5BE12C", "#F5CD19"]}
                                        percent={powerFactorQualityStats.a_percent < 90? 0 : (powerFactorQualityStats.a_percent - 90) / 10}
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
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full h-full bg-slate-200 p-3 dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="flex flex-col gap-3 h-full">
                                <div className="flex-1 grid grid-cols-0 md:grid-cols-4 items-center gap-3 mb-2">
                                    <div className="md:col-span-2 font-semibold text-lg ml-3">B동 역률 상태</div>
                                    <div className={`md:col-span-2 w-[80%] h-[0.8vw] p-5 mr-5 flex text-[1.0vw] rounded-xl
                                                    justify-center text-center items-center ${powerFactorQualityStats.b_color}`}>
                                        <div className={`leading-none font-semibold ${
                                                        powerFactorQualityStats.b_state === "주의" ? "text-slate-900 dark:!text-slate-900"
                                                        : "text-white dark:!text-white"
                                                        }`}>{powerFactorQualityStats.b_state}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 items-center gap-3">
                                <div className="md:col-span-2 font-semibold text-xl ml-5">현재 : {powerFactorQualityStats.b_percent}%</div>
                                <div className="md:col-span-3 h-full relative w-full">
                                    <GaugeChart
                                        id="power-factor-analysis-gauge-chart"
                                        nrOfLevels={420}
                                        arcsLength={[0.2, 0.3, 0.2, 0.3]}
                                        colors={["#EA4228", "#F5CD19", "#5BE12C", "#F5CD19"]}
                                        percent={powerFactorQualityStats.b_percent < 90? 0 : (powerFactorQualityStats.b_percent - 90) / 10}
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
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full h-full bg-slate-200 p-3 dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="flex flex-col gap-3 h-full">
                                <div className="flex-1 grid grid-cols-0 md:grid-cols-4 items-center gap-3 mb-2">
                                    <div className="md:col-span-2 font-semibold text-lg ml-3">C동 역률 상태</div>
                                    <div className={`md:col-span-2 w-[80%] h-[0.8vw] p-5 mr-5 flex text-[1.0vw] rounded-xl
                                                    justify-center text-center items-center ${powerFactorQualityStats.c_color}`}>
                                        <div className={`leading-none font-semibold ${
                                                        powerFactorQualityStats.c_state === "주의" ? "text-slate-900 dark:!text-slate-900"
                                                        : "text-white dark:!text-white"
                                                        }`}>{powerFactorQualityStats.c_state}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 items-center gap-3">
                                <div className="md:col-span-2 font-semibold text-xl ml-5">현재 : {powerFactorQualityStats.c_percent}%</div>
                                <div className="md:col-span-3 h-full relative w-full">
                                    <GaugeChart
                                        id="power-factor-analysis-gauge-chart"
                                        nrOfLevels={420}
                                        arcsLength={[0.2, 0.3, 0.2, 0.3]}
                                        colors={["#EA4228", "#F5CD19", "#5BE12C", "#F5CD19"]}
                                        percent={powerFactorQualityStats.c_percent < 90? 0 : (powerFactorQualityStats.c_percent - 90) / 10}
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
                {/* 공정/설비 별 역률 수치 및 상태*/}
                <div className="mt-3 grid gap-[6px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:w-full lg:pr-4">
                    <Auto_AgGrid
                        gridType="sender"
                        gridData={gridData_heat}
                        columnDefs={columnDefs_heat}
                        height={"180"}
                    />
                    <Auto_AgGrid
                        gridType="sender"
                        gridData={gridData_temp}
                        columnDefs={columnDefs_temp}
                        height={"180"}
                    />
                    <Auto_AgGrid
                        gridType="sender"
                        gridData={gridData_clean}
                        columnDefs={columnDefs_clean}
                        height={"180"}
                    />
                    <Auto_AgGrid
                        gridType="sender"
                        gridData={gridData_comp}
                        columnDefs={columnDefs_comp}
                        height={"180"}
                    />
                </div>
            </Card>
            <div className="flex justify-between mb-5 gap-3">
                <Card noborder className="w-[70%]">
                    <div className="flex justify-between items-center mb-5">
                        <div className="text-xl">
                            <span className="mr-2">역률 이력</span>
                            <Auto_Button_Question
                                description={"기간 내 역률을 나타냅니다. 조회기간이 2일 이내이면 시간 단위, 7일 이내이면 4시간 단위, 8일 이상이면 일단위로 나타냅니다."}
                            />
                        </div>
                        <Auto_Button_Export_Excel
                            columnDefs={columnDefs}
                            gridData={gridData}
                            title={"역률 품질 분석 - 역률 이력"}
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
                <Card noborder className="w-[30%]">
                    <div className="flex justify-between items-center mb-5">
                        <div className="text-xl">
                            <span className="mr-2">역률 이상 현황</span>
                            <Auto_Button_Question
                                description={"기간 내 역률 이상 현황을 나타냅니다."}
                            />
                        </div>
                    </div>
                    <Auto_AgGrid
                        gridType="sender"
                        gridData={gridData_warn}
                        columnDefs={columnDefs_warn}
                    />
                </Card>
            </div>
        </div>
    )
};

export default PowerFactorQualityAnalysis