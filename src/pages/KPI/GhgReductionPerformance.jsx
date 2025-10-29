import {
  Auto_LabelPopup_Set, CommonFunction, Auto_Popup_CodeName, Auto_GridCellButtonRenderer, Auto_AgGrid, TitleBar, Auto_SearchDropDown,
  DropDownItemGetter, Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid, Auto_Spliter, Auto_Label_Text_Set,
  Auto_Radio_Useflag, Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid, Auto_Button_Column_State, Auto_DateTimePickerF_T
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import Bosung_equipmentid_search4 from "@/components/bosungcomponent/Bosung_equipmentid_search4";
import MixedChart from "@/components/partials/widget/chart/Mixed";
import GaugeChart from "react-gauge-chart";
import useDarkMode from "@/services/hooks/useDarkMode";
import Icon from "@/components/ui/Icon";

const GhgReductionPerformance = () => {
    const [isDark] = useDarkMode();
    const [gridData, setGridData] = useState([]);
    const [rawData, setRawData] = useState([]);
    const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false);
    const apiUrl = useApiUrl();

    // Default Chart Data
    const [chartData, setChartData] = useState({
        label: "load-ratio",
        labels: [],
        datas: []
    });

    const search_address = "kpi/ghgreductionperformance-r"

    // rawData에서 usage_kwh 합계 계산
    const totalUsageKwh = useMemo(() => {
        return rawData.reduce((sum, item) => sum + (item.usage_kwh || 0), 0);
    }, [rawData]);

    // 배출량 계산 (usage_kwh 합계 * 0.466)
    const totalEmissionCo2 = useMemo(() => {
        return totalUsageKwh * 0.466 / 1000;
    }, [totalUsageKwh]);

    // siteall이 "ALL"인지 확인 // 동 전체 선택 시 "---"
    const isSiteAll = useMemo(() => {
        return rawData.some(item => item.siteall === "ALL");
    }, [rawData]);

    // 차트데이터로 변환
    const formatChartData = (data) => {
        const labels = data.map(item => {
            if (item.quarter != null) {
                return `${String(item.collectyear)} ${item.quarter}`;
            } else if (item.collectmonth != null) {
                return `${String(item.collectyear)} ${item.collectmonth}`;
            } else {
                return String(item.collectyear);
            }
        });
        const usage_kwh_data = data.map(item => item.usage_kwh);
        const emission_co2_data = data.map(item => item.emission_co2);

        return {
            label: "RealtimeElectricityForecast_1point",
            labels: labels,
            datas: [
                {
                    name: '전력',
                    type: "line",
                    data: usage_kwh_data
                },
                {
                    name: '온실가스 배출량',
                    type: "column",
                    data: emission_co2_data,
                },
            ]
        };
    };
    
    // 그리드 데이터 변환 (pivot)
    function pivotForAgGrid(data) {
        if (data.length === 0) return [];
        const usage_kwh_Row = { metric: "전력" };
        const emission_co2_Row = { metric: "온실가스 배출량" };

        data.forEach((item, idx) => {
            const day = item.quarter != null 
                ? `${String(item.collectyear)} ${item.quarter}`
                : item.collectmonth != null
                ? `${String(item.collectyear)} ${item.collectmonth}`
                : String(item.collectyear);
            usage_kwh_Row[day] = item.usage_kwh;
            emission_co2_Row[day] = item.emission_co2;
        });
        return [
            usage_kwh_Row,
            emission_co2_Row,
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
                        return Number(val).toLocaleString('ko-KR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });
                    }
                    return '';
                }
            }))
        ];
    }, [gridData]);

    useEffect(() => {
        setGridData(pivotForAgGrid(rawData));
        setChartData(formatChartData(rawData));
    },[rawData]);

    return (
        <div className="space-y-5">
            <Bosung_equipmentid_search4
                adress={search_address}
                setGridData={setRawData}
                excuteSuccesAndSearch={excuteSuccesAndSearch}
                isYear={true}
                isDivision={true}
            />
            <Card noborder>
                <div className="flex flex-wrap items-center justify-between mt-3">
                    <div className="w-full lg:w-[20%] sm:w-full lg:pr-4 text-[0.8vw]">
                        온실 가스 배출량
                    </div>
                    <div className="w-full lg:w-[20%] sm:w-full lg:pr-4">
                        [ tCO₂ : 사용 전력 * 0.4666 / 1000 ]
                    </div>
                    <div className="w-full lg:w-[30%] sm:w-full lg:pr-4">
                        [ 구축전 / 목표  : 총 생산량 대비 사용 전력에 대한 사업계획서 기술 내용 ]
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between mt-3">
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">사용 전력</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{totalUsageKwh.toLocaleString()} kWh</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">배출량(tCO₂)</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{Number(totalEmissionCo2.toFixed(2)).toLocaleString()} tCO₂</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">구축 전 배출량(tCO₂)</div>
                            <div className="font-semibold mt-2 mb-2">{isSiteAll ? "---" : "4043.74 tCO₂"}</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">목표 배출량(tCO₂)</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{isSiteAll ? "---" : "3832 tCO₂"}</div>
                        </div>
                    </div>
                </div>
            </Card>
            <Card noborder>
                <div className="flex justify-between items-center mb-5">
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData}
                        title={"온실가스 감축성과"}
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
        </div>
    )
};

export default GhgReductionPerformance