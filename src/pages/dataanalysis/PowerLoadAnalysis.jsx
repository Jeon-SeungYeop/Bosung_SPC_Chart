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

const PowerLoadAnalysis = () => {
    // 그리드 매핑 데이터
    const [gridData, setGridData] = useState([]);
    const [gridData_sec, setGridData_Sec] = useState([]);
    const [gridData_thd, setGridData_Thd] = useState([]);
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

    const search_address = "dataanalysis/powerloadanalysis-r";

    // 전력 부하 통계 계산 함수
    const calculatePowerLoadStats = (data) => {
        if (!data || data.length === 0) {
            return { averageLoad: 0, maximumLoad: 0, minimumLoad: 0 };
        }

        // 평균부하: avg_kw_total의 평균값
        const avgKwTotalValues = data
            .map(item => item.avg_kw_total)
            .filter(value => value != null && !isNaN(value));
        
        // 최대부하: max_kw_total의 최대값
        const maxKwTotalValues = data
            .map(item => item.max_kw_total)
            .filter(value => value != null && !isNaN(value));
        
        // 최소부하: min_kw_total의 최소값
        const minKwTotalValues = data
            .map(item => item.min_kw_total)
            .filter(value => value != null && !isNaN(value));

        const averageLoad = avgKwTotalValues.length > 0 
            ? avgKwTotalValues.reduce((sum, value) => sum + value, 0) / avgKwTotalValues.length 
            : 0;
        
        const maximumLoad = maxKwTotalValues.length > 0 
            ? Math.max(...maxKwTotalValues) 
            : 0;
        
        const minimumLoad = minKwTotalValues.length > 0 
            ? Math.min(...minKwTotalValues) 
            : 0;

        return {
            averageLoad: Number(averageLoad.toFixed(2)),
            maximumLoad: Number(maximumLoad.toFixed(2)),
            minimumLoad: Number(minimumLoad.toFixed(2))
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
        const avg_kw_total_data = data.map(item => item.avg_kw_total);
        const max_kw_total_data = data.map(item => item.max_kw_total);
        const min_kw_total_data = data.map(item => item.min_kw_total);

        return {
            label: "RealtimePowerFactorTrend",
            labels: labels,
            datas: [
                {
                    name: '평균부하',
                    type: "line",
                    data: avg_kw_total_data
                },
                {
                    name: '최대부하',
                    type: "line",
                    data: max_kw_total_data
                },
                {
                    name: '최소부하',
                    type: "line",
                    data: min_kw_total_data
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
        const voltage_ln_a_data = data.map(item => item.voltage_ln_a);
        const voltage_ln_b_data = data.map(item => item.voltage_ln_b);
        const voltage_ln_c_data = data.map(item => item.voltage_ln_c);

        return {
            label: "RealtimePowerFactorTrend",
            labels: labels,
            datas: [
                {
                    name: 'R상 전압',
                    type: "line",
                    data: voltage_ln_a_data
                },
                {
                    name: 'S상 전압',
                    type: "line",
                    data: voltage_ln_b_data
                },
                {
                    name: 'T상 전압',
                    type: "line",
                    data: voltage_ln_c_data
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
        const avg_kw_total_data = data.map(item => item.avg_kw_total);
        const kw_a_data = data.map(item => item.kw_a);
        const kw_b_data = data.map(item => item.kw_b);
        const kw_c_data = data.map(item => item.kw_c);

        return {
            label: "RealtimePowerFactorTrend",
            labels: labels,
            datas: [
                {
                    name: '평균부하',
                    type: "line",
                    data: avg_kw_total_data
                },
                {
                    name: 'R상 유효전력',
                    type: "line",
                    data: kw_a_data
                },
                {
                    name: 'S상 유효전력',
                    type: "line",
                    data: kw_b_data
                },
                {
                    name: 'T상 유효전력',
                    type: "line",
                    data: kw_c_data
                },
            ]
        };
    };

    // 그리드 데이터 변환 (pivot)
    function pivotForAgGrid(data) {
        if (data.length === 0) return [];
        const avg_kw_total_Row = { metric: "평균부하(kW)" };
        const max_kw_total_Row = { metric: "최대부하(kW)" };
        const min_kw_total_Row = { metric: "최소부하(kW)" };


        data.forEach((item, idx) => {
            const day = item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);
            avg_kw_total_Row[day] = item.avg_kw_total;
            max_kw_total_Row[day] = item.max_kw_total; 
            min_kw_total_Row[day] = item.min_kw_total; 
        });
        return [
            avg_kw_total_Row,
            max_kw_total_Row,
            min_kw_total_Row,
        ];
    }
    function pivotForAgGrid_sec(data) {
        if (data.length === 0) return [];
        const voltage_ln_a_Row = { metric: "R상 전압(V)" };
        const voltage_ln_b_Row = { metric: "S상 전압(V)" };
        const voltage_ln_c_Row = { metric: "T상 전압(V)" };


        data.forEach((item, idx) => {
            const day = item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);
            voltage_ln_a_Row[day] = item.voltage_ln_a;
            voltage_ln_b_Row[day] = item.voltage_ln_b; 
            voltage_ln_c_Row[day] = item.voltage_ln_c; 
        });
        return [
            voltage_ln_a_Row,
            voltage_ln_b_Row,
            voltage_ln_c_Row,
        ];
    }
    function pivotForAgGrid_thd(data) {
        if (data.length === 0) return [];
        const avg_kw_total_Row = { metric: "유효전력평균(kW)" };
        const kw_a_Row = { metric: "R상 유효전력(kW)" };
        const kw_b_Row = { metric: "S상 유효전력(kW)" };
        const kw_c_Row = { metric: "T상 유효전력(kW)" };


        data.forEach((item, idx) => {
            const day = item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);
            avg_kw_total_Row[day] = item.avg_kw_total;
            kw_a_Row[day] = item.kw_a;
            kw_b_Row[day] = item.kw_b; 
            kw_c_Row[day] = item.kw_c; 
        });
        return [
            avg_kw_total_Row,
            kw_a_Row,
            kw_b_Row,
            kw_c_Row,
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

    return (
        <div className="space-y-5">
            <Bosung_equipmentid_search
                adress={search_address}
                setGridData={setRawData}
                excuteSuccesAndSearch={excuteSuccesAndSearch}
                isDate={true}
                AllProcess={true}
            />
            <Card noborder>
                <div className="ltr:pr-4 rtl:pl-4 flex item-center">
                    <span className="mr-2 font-medium lg:text-xl capitalize ">
                        전력 부하 분석
                    </span>
                    <Auto_Button_Question
                        description="조회 기간 내 전력 데이터를 바탕으로 평균부하, 최대부하, 최소부화를 나타냅니다."
                    />
                </div>
                <div className="flex flex-wrap items-center justify-between mt-3">
                    <div className="w-full lg:w-[33%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">평균 부하(kW)</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{powerLoadStats.averageLoad} kW</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[33%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">최대 부하(kW)</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{powerLoadStats.maximumLoad} kW</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[33%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">최소 부하(kW)</div>
                            <div className="font-semibold mt-2 mb-2">{powerLoadStats.minimumLoad} kW</div>
                        </div>
                    </div>
                </div>
            </Card>
            <Card noborder>
                <div className="flex justify-between items-center mb-5">
                    <div className="text-xl">
                        <span className="mr-2">전력 부하 추이</span>
                        <Auto_Button_Question
                            description={"기간 내 전력 부하 추이를 나타냅니다. 조회기간이 2일 이내이면 시간 단위, 7일 이내이면 4시간 단위, 8일 이상이면 일단위로 나타냅니다."}
                        />
                    </div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData}
                        title={"전력 부하 분석 - 젼력 부하 추이"}
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
            <Card noborder>
                <div className="flex justify-between items-center mb-5">
                    <div className="text-xl">
                        <span className="mr-2">상 변압 추이</span>
                        <Auto_Button_Question
                            description={"기간 내 상 변압 추이를 나타냅니다. 조회기간이 2일 이내이면 시간 단위, 7일 이내이면 4시간 단위, 8일 이상이면 일단위로 나타냅니다."}
                        />
                    </div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData_sec}
                        title={"전력 부하 분석 - 상 변압 추이"}
                    />
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData_sec}
                    columnDefs={columnDefs}
                    height={"195"}
                />
                <MixedChart data={chartData_sec} height={300} />
            </Card>
            <Card noborder>
                <div className="flex justify-between items-center mb-5">
                    <div className="text-xl">
                        <span className="mr-2">유효 / 무효 전력</span>
                        <Auto_Button_Question
                            description={"기간 내 유효 / 무효 전력을 나타냅니다. 조회기간이 2일 이내이면 시간 단위, 7일 이내이면 4시간 단위, 8일 이상이면 일단위로 나타냅니다."}
                        />
                    </div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData_thd}
                        title={"전력 부하 분석 - 유효/무효 전력"}
                    />
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData_thd}
                    columnDefs={columnDefs}
                    height={"237"}
                />
                <MixedChart data={chartData_thd} height={300} />
            </Card>
        </div>
    )
};

export default PowerLoadAnalysis