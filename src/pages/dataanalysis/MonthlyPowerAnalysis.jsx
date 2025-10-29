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

const MonthlyPowerAnalysis = () => {
    // 그리드 매핑 데이터
    const [gridData, setGridData] = useState([]);
    // rawData만 저장
    const [rawData, setRawData] = useState([]);
    const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
    const apiUrl = useApiUrl();
    
    // Default Chart Data(페이지 로드시 오류 방지)
    const [chartData, setChartData] = useState({
        label: "RealtimeControlStatus",
        labels: [
            
        ],
        datas: [
            
        ]
    });

    const search_address = "dataanalysis/monthlypoweranalysis-r";

    // 계산된 값들
    const calculatedValues = useMemo(() => {
        if (rawData.length === 0) {
            return {
            totalUsagePower: 0,
            maxLoad: 0,
            targetUsage: 0,
            targetRatio: 0,
            isExceeded: false,
            };
        }

        // 총 사용전력: usage_kwh의 총합 (null은 0으로 처리)
        const totalUsagePower = rawData.reduce(
            (sum, item) => sum + (item?.usage_kwh ?? 0),
            0
        );

        // 최대 부하: kw_total_max 중 최대값 (null은 0)
        const maxLoad = Math.max(...rawData.map((item) => item?.kw_total_max ?? 0));

        // 일일 목표 사용량
        const perDayTarget =
            rawData.find((d) => d?.sum_powerusage != null)?.sum_powerusage ?? 0;

        const validDayCount = rawData.filter(
            (d) => d?.usage_kwh != null && !Number.isNaN(d.usage_kwh)
        ).length;

        const targetUsage = perDayTarget * validDayCount;

        // 목표 대비(%)
        const targetRatio = targetUsage > 0 ? (totalUsagePower / targetUsage) * 100 : 0;
        const isExceeded = targetRatio > 100;

        return {
            totalUsagePower,
            maxLoad,
            targetUsage,
            targetRatio,
            isExceeded,
        };
    }, [rawData]);

    // 날짜 헤더 포맷터: "2025-08-25" -> "08-25"
    const formatDateHeader = (key) => {
        if (typeof key !== "string") return key;
        // 가장 흔한 "YYYY-MM-DD"
        if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
            return `${key.slice(5,7)}-${key.slice(8,10)}`;
        }
        // 예외적으로 "YYYY/MM/DD", "YYYY.MM.DD", "YYYYMMDD" 도 대응
        const m = key.match(/^(\d{4})[\/.\-]?(\d{2})[\/.\-]?(\d{2})/);
        return m ? `${m[2]}-${m[3]}` : key;
    };

    const formatChartData = (data) => {
        const labels = data.map(item => formatDateHeader(item.collectdate));
        const usage_kwh_data = data.map(item => item.usage_kwh ? item.usage_kwh : 0);
        const kw_total_max_data = data.map(item => item.kw_total_max ? item.kw_total_max : 0);
        const kw_total_min_data = data.map(item => item.kw_total_min ? item.kw_total_min : 0);

        return {
            label: "RealtimeElectricityForecast",
            labels,
            datas: [
            { name: "사용전력", type: "line",   data: usage_kwh_data },
            { name: "최대부하", type: "column", data: kw_total_max_data },
            { name: "최소부하", type: "column", data: kw_total_min_data },
            ],
        };
    };

    // 그리드 데이터 변환 (pivot)
    function pivotForAgGrid(data) {
        if (data.length === 0) return [];
        const usage_kwh_Row = { metric: "사용전력(kWh)" };
        const kw_total_max_Row = { metric: "최대부하(kWh)" };
        const kw_total_min_Row = { metric: "최소부하(kWh)" };

        data.forEach((item, idx) => {
            const day = item.collectdate;
            usage_kwh_Row[day] = item.usage_kwh;
            kw_total_max_Row[day] = item.kw_total_max; 
            kw_total_min_Row[day] = item.kw_total_min; 
        });
        return [
            usage_kwh_Row,
            kw_total_max_Row,
            kw_total_min_Row,
        ];
    }

    // 조회 후 데이터 변경
    useEffect(() => {
        setGridData(pivotForAgGrid(rawData));
        setChartData(formatChartData(rawData));
    }, [rawData]);

    const columnDefs = useMemo(() => {
        const keys = gridData[0]
            ? Object.keys(gridData[0])
                .filter(k => k !== "metric")
                .sort()
            : [];

        return [
            {
            field: "metric",
            headerName: "",
            cellClass: "text-center",
            minWidth: 220,
            pinned: "left",
            },
            ...keys.map(key => ({
            field: key,
            headerName: formatDateHeader(key),
            cellClass: "text-right",
            editable: false,
            minWidth: 110,
            valueFormatter: params => {
                const val = params.value;
                return val != null && !isNaN(val) ? Number(val).toFixed(2) : "";
            },
            })),
        ];
    }, [gridData]);

    return (
        <div className="space-y-5">
            <Bosung_equipmentid_search
                adress={search_address}
                setGridData={setRawData}
                excuteSuccesAndSearch={excuteSuccesAndSearch}
                isDate={true}
                oneDate={true}
            />
            <Card noborder>
                <div className="ltr:pr-4 rtl:pl-4 flex item-center">
                    <span className="mr-2 font-medium lg:text-xl capitalize ">
                        월간 전력 분석
                    </span>
                    <Auto_Button_Question
                        description="조회된 기간을 기준으로 30일간의 전력 데이터를 바탕으로 총 사용전력, 최대부하, 목표 사용량, 목표대비 사용량을 나타냅니다."
                    />
                </div>
                <div className="flex flex-wrap items-center justify-between mt-3">
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">총 사용전력(kW)</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{calculatedValues.totalUsagePower.toFixed(2)} kW</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">최대 부하(kW)</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{calculatedValues.maxLoad.toFixed(2)} kW</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">목표 사용량</div>
                            <div className="font-semibold mt-2 mb-2">{calculatedValues.targetUsage.toFixed(2)} kWh</div>
                            <div className="ml-2 mt-2 mb-2">목표 대비</div>
                            <div className={`font-semibold mr-3 mt-2 mb-2 ${calculatedValues.isExceeded ? 'text-red-500' : 'text-green-500'}`}>
                                {calculatedValues.targetRatio.toFixed(1)}%({calculatedValues.isExceeded ? "초과" : "달성"})
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
            <Card noborder>
                <div className="flex justify-between items-center mb-5">
                    <div className="text-xl">
                        <span className="mr-2">월간 전력 추이</span>
                        <Auto_Button_Question
                            description={"각 일자별 전력 추이를 나타냅니다."}
                        />
                    </div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData}
                        title={"일간 전력 분석"}
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

export default MonthlyPowerAnalysis;