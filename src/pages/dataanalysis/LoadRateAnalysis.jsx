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

const LoadRateAnalysis = () => {
    // 그리드 매핑 데이터
    const [gridData, setGridData] = useState([]);
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

    const search_address = "dataanalysis/loadrateanalysis-r";

    // 상 부하율 통계 계산 함수
    const calculateLoadRateStats = (data) => {
        if (!data || data.length === 0) {
            return { averageLoad: 0, maximumLoad: 0, loadRate: 0 };
        }

        // 평균부하: avg_kw_total의 평균값
        const avgKwTotalValues = data
            .map(item => item.avg_kw_total)
            .filter(value => value != null && !isNaN(value));
        
        // 최대부하: max_kw_total의 최대값
        const maxKwTotalValues = data
            .map(item => item.max_kw_total)
            .filter(value => value != null && !isNaN(value));

        // 부하율: avg_kw_total / max_kw_total * 100
        const loadRateValues = data
            .map(item => item.load_rate)
            .filter(value => value != null && !isNaN(value));

        const averageLoad = avgKwTotalValues.length > 0 
            ? avgKwTotalValues.reduce((sum, value) => sum + value, 0) / avgKwTotalValues.length 
            : 0;
        
        const maximumLoad = maxKwTotalValues.length > 0 
            ? Math.max(...maxKwTotalValues) 
            : 0;

        const loadRate = maxKwTotalValues.length > 0 
            ? averageLoad / maximumLoad * 100
            : 0;

        return {
            averageLoad: Number(averageLoad.toFixed(2)),
            maximumLoad: Number(maximumLoad.toFixed(2)),
            loadRate: Number(loadRate.toFixed(2)),
        };
    };

    // rawData의 상 부하율 통계값 계산
    const loadRateStats = useMemo(() => {
        return calculateLoadRateStats(rawData);
    }, [rawData]);

    // 차트데이터로 변환
    const formatChartData = (data) => {
        const labels = data.map(item => {
            return item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);;
        });
        const avg_kw_total_data = data.map(item => item.avg_kw_total);
        const rated_power_data = data.map(item => item.rated_power);
        const load_rate_data = data.map(item => item.rated_power > 0? item.avg_kw_total / item.rated_power * 100 : 0)

        return {
            label: "RealtimeElectricityForecast",
            labels: labels,
            datas: [
                {
                    name: '평균전력',
                    type: "line",
                    data: avg_kw_total_data
                },
                {
                    name: '최대수용전력',
                    type: "line",
                    data: rated_power_data
                },
                {
                    name: '부하율',
                    type: "line",
                    data: load_rate_data
                },
            ]
        };
    };

    // 그리드 데이터 변환 (pivot)
    function pivotForAgGrid(data) {
        if (data.length === 0) return [];
        const avg_kw_total_Row = { metric: "평균전력(kW)" };
        const rated_power_Row = { metric: "최대수용전력(kW)" };     
        const load_rate_Row = { metric: "부하율(%)" };

        data.forEach((item, idx) => {
            const day = item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);
            avg_kw_total_Row[day] = item.avg_kw_total;
            rated_power_Row[day] = item.rated_power;
            load_rate_Row[day] = item.rated_power > 0? item.avg_kw_total / item.rated_power * 100 : 0;
        });
        return [
            avg_kw_total_Row,
            rated_power_Row,
            load_rate_Row
        ];
    }


    // 조회 후 데이터 변경
    useEffect(() => {
        setGridData(pivotForAgGrid(rawData));
        setChartData(formatChartData(rawData));
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

    return (
        <div className="space-y-5">
            <Bosung_equipmentid_search
                adress={search_address}
                setGridData={setRawData}
                excuteSuccesAndSearch={excuteSuccesAndSearch}
                isDate={true}
            />
            <Card noborder>
                <div className="ltr:pr-4 rtl:pl-4 flex item-center">
                    <span className="mr-2 font-medium lg:text-xl capitalize ">
                        부하 분석 상태
                    </span>
                    <Auto_Button_Question
                        description="조회 기간 내 전력 데이터를 바탕으로 평균 부하, 최대부하와 부하율을 나타냅니다. 값이 높을수록 피크에 덜 치우치고 설비가 고르게 사용되었다는 뜻입니다."
                    />
                </div>
                
                <div className="flex flex-wrap items-center justify-between mt-3">
                    <div className="w-full lg:w-[33%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">평균 부하(kW)</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{loadRateStats.averageLoad} kW</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[33%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">최대 부하(kW)</div>
                            <div className="font-semibold mt-2 mb-2">{loadRateStats.maximumLoad} kW</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[33%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">부하율(%)</div>
                            <div className="font-semibold mt-2 mb-2">{loadRateStats.loadRate} %</div>
                        </div>
                    </div>
                </div>
            </Card>
            <Card noborder>
                <div className="flex justify-between items-center mb-5">
                    <div className="text-xl">
                        <span className="mr-2">상 부하율 추이</span>
                        <Auto_Button_Question
                            description={"기간 내 상부하율을 나타냅니다. 조회기간이 2일 이내이면 시간 단위, 7일 이내이면 4시간 단위, 8일 이상이면 일단위로 나타냅니다."}
                        />
                    </div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData}
                        title={"상 부하율 분석 - 상 부하율 추이"}
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

export default LoadRateAnalysis