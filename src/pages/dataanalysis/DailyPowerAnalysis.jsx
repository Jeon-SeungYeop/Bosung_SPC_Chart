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

const DailyPowerAnalysis = () => {
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

    const search_address = "dataanalysis/dailypoweranalysis-r";

    // 계산된 값들
    const calculatedValues = useMemo(() => {
        if (rawData.length === 0) {
            return {
                totalUsagePower: 0,
                maxLoad: 0,
                targetUsage: 0,
                targetRatio: 0,
                isExceeded: false
            };
        }

        // 총 사용전력: usage_kwh의 총합
        const totalUsagePower = rawData.reduce((sum, item) => sum + (item.usage_kwh || 0), 0);
        
        // 최대 부하: kw_total_max 중 최대값
        const maxLoad = Math.max(...rawData.map(item => item.kw_total_max || 0));
        
        // 목표 사용량: sum_powerusage 값 (첫 번째 데이터에서 가져오기, 모든 데이터가 동일한 값)
        const targetUsage = rawData[0]?.sum_powerusage || 0;
        
        // 목표 대비: 총사용전력/목표사용량*100
        const targetRatio = targetUsage > 0 ? (totalUsagePower / targetUsage * 100) : 0;
        const isExceeded = targetRatio > 100;

        return {
            totalUsagePower,
            maxLoad,
            targetUsage,
            targetRatio,
            isExceeded
        };
    }, [rawData]);

    const formatChartData = (data) => {
        const labels = data.map(item => (item.collecthour || 0).toString());
        const usage_kwh_data = data.map(item => item.usage_kwh);
        const kw_total_max_data = data.map(item => item.kw_total_max);
        const kw_total_min_data = data.map(item => item.kw_total_min);

        return {
            label: "RealtimeElectricityForecast",
            labels: labels,
            datas: [
                {
                    name: '사용전력',
                    type: "line",
                    data: usage_kwh_data
                },
                {
                    name: '최대부하',
                    type: "column",
                    data: kw_total_max_data
                },
                {
                    name: '최소부하',
                    type: "column",
                    data: kw_total_min_data
                },
            ]
        };
    };

    // 그리드 데이터 변환 (pivot)
    function pivotForAgGrid(data) {
        if (data.length === 0) return [];
        const usage_kwh_Row = { metric: "사용전력(kWh)" };
        const kw_total_max_Row = { metric: "최대부하(kWh)" };
        const kw_total_min_Row = { metric: "최소부하(kWh)" };

        data.forEach((item) => {
            const hour = (item.collecthour || 0).toString();
            usage_kwh_Row[hour] = item.usage_kwh;
            kw_total_max_Row[hour] = item.kw_total_max; 
            kw_total_min_Row[hour] = item.kw_total_min; 
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

    // 1~24 컬럼 고정
    const columnDefs = useMemo(() => {
        const fixedKeys = Array.from({ length: 24 }, (_, i) => (i).toString());

        return [
            {
            field: 'metric',
            headerName: '',
            cellClass: 'text-center',
            minWidth: 80,
            pinned: 'left',
            },
            ...fixedKeys.map((key) => ({
            field: key,
            headerName: key,           // "01"처럼 보이게 하려면: key.padStart(2, '0')
            cellClass: 'text-right',
            editable: false,
            minWidth: 110,
            valueFormatter: (params) => {
                const v = params.value;
                if (typeof v === 'number') return v.toFixed(2);
                const n = Number(v);
                return Number.isFinite(n) ? n.toFixed(2) : '';
            },
            })),
        ];
    }, []);

    return (
        <div className="space-y-5">
            <Bosung_equipmentid_search
                adress={search_address}
                setGridData={setRawData}
                excuteSuccesAndSearch={excuteSuccesAndSearch}
                isDate={true}
                oneDate={true}
                daily={true}
            />
            <Card noborder>
                <div className="ltr:pr-4 rtl:pl-4 flex item-center">
                    <span className="mr-2 font-medium lg:text-xl capitalize ">
                        일간 전력 분석
                    </span>
                    <Auto_Button_Question
                        description="조회 기간의 전력 데이터를 바탕으로 총 사용 전력, 최대부하, 목표 사용량, 목표 대비 사용량을 나타냅니다."
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
                        <span className="mr-2">시간별 전력 추이</span>
                        <Auto_Button_Question
                            description={"각 시간별 전력 추이를 나타냅니다."}
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
}

export default DailyPowerAnalysis;