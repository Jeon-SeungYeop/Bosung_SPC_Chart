import {
    Auto_LabelPopup_Set, CommonFunction, Auto_Popup_CodeName, Auto_GridCellButtonRenderer, Auto_AgGrid, TitleBar,
    Auto_SearchDropDown, DropDownItemGetter, Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid,
    Auto_Button_Search_AGgrid, Auto_Spliter, Auto_Label_Text_Set, Auto_Radio_Useflag, Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid,
    Auto_Button_Column_State, Auto_DateTimePickerF_T
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import Bosung_equipmentid_search from "@/components/bosungcomponent/Bosung_equipmentid_search";
import MixedChart from "@/components/partials/widget/chart/Mixed";
import Bosung_equipmentid_search3 from "@/components/bosungcomponent/Bosung_equipmentid_search3";

const RealtimeElectricityCostForecast = () => {
    // 그리드 매핑 데이터
    const [gridData, setGridData] = useState([]);
    // rawData만 저장
    const [rawData, setRawData] = useState([]);

    // Default Chart Data(페이지 로드시 오류 방지)
    const [chartData, setChartData] = useState({
        label: "load-ratio",
        labels: [],
        datas: []
    });

    const search_address = "realtime/realtimeelectricitycostforecast-r";

    // 숫자 포맷 유틸
    const formatNumber = (value) => {
        return value != null
            ? Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '';
    };

    // 차트데이터로 변환
    const formatChartData = (data) => {
        const labels = data.map((_, idx) => (idx).toString());
        const Usage_kwh_Data = data.map(item => item.usage_kwh);
        const Usage_LoadCost_Data = data.map(item => item.usage_loadcost);
        const LoadCostData = data.map(item => item.loadcost);
        const usage_kwh_net_cost_Data = data.map(item => item.usage_kwh_net_cost);

        return {
            label: "carbonemissionforecast",
            labels: labels,
            datas: [
                { name: "전력량", type: "line", data: Usage_kwh_Data },
                { name: "사용 요금", type: "line", data: Usage_LoadCost_Data },
                { name: "부하 요금", type: "line", data: LoadCostData },
                { name: "누적 요금", type: "area", data: usage_kwh_net_cost_Data }
            ]
        };
    };

    // 그리드 데이터 변환 (pivot)
    function pivotForAgGrid(data) {
        if (data.length === 0) return [];
        const Usage_kwh_Row = { metric: "전력량" };
        const Usage_kwh_net_Row = { metric: "누적 사용량" };
        const Load_cost_Row = { metric: "부하 요금" };
        const Usage_LoadCost_Row = { metric: "시간 사용 요금" };
        const Usage_kwh_net_cost_Row = { metric: "누적 사용 요금" };


        data.forEach((item, idx) => {
            const day = (idx).toString();
            Usage_kwh_Row[day] = item.usage_kwh;
            Usage_kwh_net_Row[day] = item.usage_kwh_net; 
            Load_cost_Row[day] = item.loadcost; 
            Usage_LoadCost_Row[day] = item.usage_loadcost; 
            Usage_kwh_net_cost_Row[day] = item.usage_kwh_net_cost;
        });
        return [
            Usage_kwh_Row,
            Usage_kwh_net_Row,
            Load_cost_Row,
            Usage_LoadCost_Row,
            Usage_kwh_net_cost_Row
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
                minWidth: 220,
                pinned: 'left'
            },
            ...keys.map(key => ({
                field: key,
                headerName: key,
                cellClass: "text-right",
                editable: false,
                minWidth: 100,
                valueFormatter: (params) => {
                    const val = params.value;
                    if (val != null && !isNaN(val)) {
                        return Number(val).toLocaleString('ko-KR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });
                    }
                    return '';
                },
                cellClassRules: {
                    'text-red-700': params => {
                        const numericKeys = Object.keys(params.data)
                            .filter(k => k !== 'metric')
                            .map(k => parseInt(k, 10))
                            .sort((a, b) => a - b);
                        const threshold = numericKeys[numericKeys.length - 3];
                        return parseInt(params.colDef.field, 10) >= threshold;
                    }
                },
            }))
        ];
    }, [gridData]);

    // rawData의 마지막 인덱스 요소를 꺼내서 사용
    const lastData = rawData.length ? rawData[rawData.length - 4] : {};

    return (
        <div className="space-y-5">
            <Bosung_equipmentid_search
                adress={search_address}
                setGridData={setRawData}
            />
            <Card noborder className="mt-3">
                <div className="flex flex-wrap items-center justify-between mt-3">
                    <div className="w-full lg:w-[19%] sm:w-full lg:pr-4">
                        실시간 요금
                    </div>

                    <div className="w-full lg:w-[19%] sm:w-full lg:pr-4">
                        [ 기본 요금 : {Number(isNaN(lastData.baseprice) ? 0 : lastData.baseprice).toLocaleString()} (원) ]
                    </div>

                    <div className="w-full lg:w-[19%] sm:w-full lg:pr-4">
                        [ 계약전력 : {Number(isNaN(lastData.contractdemand) ? 0 : lastData.contractdemand).toLocaleString()} (kW) ]
                    </div>

                    <div className="w-full lg:w-[19%] sm:w-full lg:pr-4">
                        [ 월 기본 요금 : {Number(isNaN(lastData.month_price) ? 0 : lastData.month_price).toLocaleString()} (원) ]
                    </div>

                    <div className="w-full lg:w-[24%] sm:w-full lg:pr-4">
                        [ 현시간 부하 요금: {Number(isNaN(lastData.loadratioprice) ? 0 : lastData.loadratioprice).toLocaleString()} (원 / kWh)
                        [
                        {
                            lastData.season === "AU" ? "가을" :
                                lastData.season === "SP" ? "봄" :
                                    lastData.season === "SU" ? "여름" :
                                        lastData.season === "WI" ? "겨울" : "--"
                        },
                        {
                            lastData.loadratio === "LO" ? "경부하" :
                                lastData.loadratio === "MI" ? "중간부하" :
                                    lastData.loadratio === "MX" ? "최대부하" : "--"
                        }
                        ]]
                    </div>
                    <div className="w-full flex justify-end lg:pr-4">
                        <p className="text-sm text-gray-700 text-right">
                            • 월간 전력 요금: 기본 요금 × 계약 전력 + (일별 총 부하요금 합산)&nbsp; &nbsp; &nbsp; &nbsp; * 월 기본요금 : 월간(전월 15일 ~ 금월 14일) 15분 평균 최대 유효전력 * 기본요금
                        </p>
                    </div>

                </div>
                <div className="flex flex-wrap items-center justify-between mt-3">
                    {/* 실시간 소비량 */}
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4">
                        <div className="w-full bg-slate-200 p-3 flex justify-between items-center text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">현시간 전력소비량</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">
                                {formatNumber(lastData.usage_kwh)} kWh
                            </div>
                        </div>
                    </div>


                    {/* 일 누적 요금 */}
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4">
                        <div className="w-full bg-slate-200 p-3 flex justify-between items-center text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">일 누적 사용량</div>
                            <div className="font-semibold mt-2 mb-2">
                                {formatNumber(lastData.usage_kwh_net)} kWh
                            </div>
                        </div>
                    </div>

                    {/* 현재 요금 */}
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4">
                        <div className="w-full bg-slate-200 p-3 flex justify-between items-center text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">현시간 부하 사용요금</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">
                                {formatNumber(lastData.usage_loadcost)} 원
                            </div>
                        </div>
                    </div>

                    {/* 예상 일 총 요금 */}
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4">
                        <div className="w-full bg-slate-200 p-3 flex justify-between items-center text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">누적 사용 요금</div>
                            <div className="font-semibold mt-2 mb-2">
                                {formatNumber(lastData.usage_kwh_net_cost)} 원
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
            <Card noborder>
                <div className="flex items-center justify-between mb-5 space-x-10 h-full">
                    <div>시간별 요금</div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData}
                        title={"실시간 전력 요금 예측"}
                    />
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData}
                    columnDefs={columnDefs}
                    height={"278"}
                />
                <MixedChart data={chartData} height={300} />
            </Card>
        </div>
    );
};

export default RealtimeElectricityCostForecast;
