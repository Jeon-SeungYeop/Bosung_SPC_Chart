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

const PowerQualityAnalysis = () => {
    // 그리드 매핑 데이터
    const [gridData_fre, setGridData_Fre] = useState([]);
    const [gridData_cur, setGridData_Cur] = useState([]);
    const [gridData_thd, setGridData_Thd] = useState([]);
    // rawData만 저장
    const [rawData, setRawData] = useState([]);
    const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
    const apiUrl = useApiUrl();
    // Default Chart Data(페이지 로드시 오류 방지)
    const [chartData_fre, setChartData_Fre] = useState({
        label: "load-ratio",
        labels: [],
        datas: []
    });
    const [chartData_cur, setChartData_Cur] = useState({
        label: "load-ratio",
        labels: [],
        datas: []
    });
    const [chartData_thd, setChartData_Thd] = useState({
        label: "load-ratio",
        labels: [],
        datas: []
    });

    const search_address = "dataanalysis/powerqualityanalysis-r";

    // 전력 품질 통계 계산 함수
    const calculatePowerQualityStats = (data) => {
        if (!data || data.length === 0) {
            return { voltageLnAvg: 0, voltageThdAvg: 0, frequencyAvg: 0, currentAvg : 0 };
        }

        // 평균전압: voltage_ln_avg의 평균값
        const avgVoltageLnValues = data
            .map(item => item.voltage_ln_avg)
            .filter(value => value != null && !isNaN(value));
        
        // 평균 THD: voltage_thd_avg의 평균값
        const avgVoltageThdValues = data
            .map(item => item.voltage_thd_avg)
            .filter(value => value != null && !isNaN(value));
        
        // 평균 주파수: frequency의 평균값
        const avgFrequencyValues = data
            .map(item => item.frequency)
            .filter(value => value != null && !isNaN(value));

        // 평균 전류: current_avg의 평균값
        const avgCurrentValues = data
            .map(item => item.current_avg)
            .filter(value => value != null && !isNaN(value));

        const voltageLnAvg = avgVoltageLnValues.length > 0 
            ? avgVoltageLnValues.reduce((sum, value) => sum + value, 0) / avgVoltageLnValues.length 
            : 0;
        
        const voltageThdAvg = avgVoltageThdValues.length > 0 
            ? avgVoltageThdValues.reduce((sum, value) => sum + value, 0) / avgVoltageThdValues.length 
            : 0;
        
        const frequencyAvg = avgFrequencyValues.length > 0 
            ? avgFrequencyValues.reduce((sum, value) => sum + value, 0) / avgFrequencyValues.length 
            : 0;

        const currentAvg = avgCurrentValues.length > 0 
            ? avgCurrentValues.reduce((sum, value) => sum + value, 0) / avgCurrentValues.length 
            : 0;

        return {
            voltageLnAvg: Number(voltageLnAvg.toFixed(2)),
            voltageThdAvg: Number(voltageThdAvg.toFixed(2)),
            frequencyAvg: Number(frequencyAvg.toFixed(2)),
            currentAvg: Number(currentAvg.toFixed(2))
        };
    };

    // rawData의 전력 품질 통계값 계산
    const powerQualityStats = useMemo(() => {
        return calculatePowerQualityStats(rawData);
    }, [rawData]);

    // 차트데이터로 변환
    const formatChartData_fre = (data) => {
        const labels = data.map(item => {
            return item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);;
        });
        const voltage_ln_avg_data = data.map(item => item.voltage_ln_avg);
        const frequency_data = data.map(item => item.frequency);
        // 상한 하한
        const up_voltage_ln_avg_data =      data.map(item => 220 + 13);
        const down_voltage_ln_avg_data =    data.map(item => 220 - 13);
        const up_frequency_data =           data.map(item => 60 + 0.2);
        const down_frequency_data =         data.map(item => 60 - 0.2);

        return {
            label: "PowerQualityAnalysis",
            labels: labels,
            yaxis_r_min: 59.7,
            yaxis_r_max: 60.3,
            datas: [
                {
                    name: '전압(V)',
                    type: "line",
                    data: voltage_ln_avg_data
                },
                {
                    name: '주파수(Hz)',
                    type: "bar",
                    data: frequency_data
                },
                // {
                //     name: '전압상한',
                //     type: "line",
                //     data: up_voltage_ln_avg_data
                // },
                // {
                //     name: '전압하한',
                //     type: "line",
                //     data: down_voltage_ln_avg_data
                // },
                // {
                //     name: '주파수상한',
                //     type: "line",
                //     data: up_frequency_data
                // },
                // {
                //     name: '주파수하한',
                //     type: "line",
                //     data: down_frequency_data
                // },
            ]
        };
    };
    const formatChartData_cur = (data) => {
        const labels = data.map(item => {
            return item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);;
        });
        const voltage_ln_avg_data = data.map(item => item.voltage_ln_avg);
        const current_avg_data = data.map(item => item.current_avg);
        // 상한 하한
        const up_voltage_ln_avg_data =      data.map(item => 220 + 13);
        const down_voltage_ln_avg_data =    data.map(item => 220 - 13);

        return {
            label: "PowerQualityAnalysis",
            labels: labels,
            yaxis_r_max: 100,
            datas: [
                {
                    name: '전압(V)',
                    type: "line",
                    data: voltage_ln_avg_data
                },
                {
                    name: '전류(A)',
                    type: "bar",
                    data: current_avg_data
                },
                // {
                //     name: '전압상한',
                //     type: "line",
                //     data: up_voltage_ln_avg_data
                // },
                // {
                //     name: '전압하한',
                //     type: "line",
                //     data: down_voltage_ln_avg_data
                // },
            ]
        };
    };
    const formatChartData_thd = (data) => {
        const labels = data.map(item => {
            return item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);;
        });
        const voltage_ln_avg_data = data.map(item => item.voltage_ln_avg);
        const voltage_thd_avg_data = data.map(item => item.voltage_thd_avg);
        // 상한 하한
        const up_voltage_thd_avg_data =      data.map(item => 15);

        return {
            label: "PowerQualityAnalysis",
            labels: labels,
            yaxis_r_max: 15.4,
            datas: [
                {
                    name: '전압(V)',
                    type: "line",
                    data: voltage_ln_avg_data
                },
                {
                    name: '고조파(%)',
                    type: "bar",
                    data: voltage_thd_avg_data
                },
                // {
                //     name: '고조파상한',
                //     type: "line",
                //     data: up_voltage_thd_avg_data
                // },
            ]
        };
    };

    // 그리드 데이터 변환 (pivot)
    function pivotForAgGrid_fre(data) {
        if (data.length === 0) return [];
        const voltage_ln_avg_Row = { metric: "전압(V)" };
        const frequency_Row = { metric: "주파수(Hz)" };
        


        data.forEach((item, idx) => {
            const day = item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);
            voltage_ln_avg_Row[day] = item.voltage_ln_avg;
            frequency_Row[day] = item.frequency;
        });
        return [
            voltage_ln_avg_Row,
            frequency_Row,
        ];
    }
    function pivotForAgGrid_cur(data) {
        if (data.length === 0) return [];
        const voltage_ln_avg_Row = { metric: "전압(V)" };
        const current_avg_Row = { metric: "전류(A)" };


        data.forEach((item, idx) => {
            const day = item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);
            voltage_ln_avg_Row[day] = item.voltage_ln_avg;
            current_avg_Row[day] = item.current_avg;
        });
        return [
            voltage_ln_avg_Row,
            current_avg_Row,
        ];
    }
    function pivotForAgGrid_thd(data) {
        if (data.length === 0) return [];
        const voltage_ln_avg_Row = { metric: "전압(V)" };
        const voltage_thd_avg_Row = { metric: "고조파(%)" };


        data.forEach((item, idx) => {
            const day = item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);
            voltage_ln_avg_Row[day] = item.voltage_ln_avg;
            voltage_thd_avg_Row[day] = item.voltage_thd_avg;
        });
        return [
            voltage_ln_avg_Row,
            voltage_thd_avg_Row,
        ];
    }


    // 조회 후 데이터 변경
    useEffect(() => {
        setGridData_Fre(pivotForAgGrid_fre(rawData));
        setGridData_Cur(pivotForAgGrid_cur(rawData));
        setGridData_Thd(pivotForAgGrid_thd(rawData));
        setChartData_Fre(formatChartData_fre(rawData));
        setChartData_Cur(formatChartData_cur(rawData));
        setChartData_Thd(formatChartData_thd(rawData));
    }, [rawData]);

    const columnDefs = useMemo(() => {
        // 동적 컬럼 생성
        const keys = gridData_fre[0]
            ? Object.keys(gridData_fre[0]).filter(key => key !== 'metric')
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
    }, [gridData_fre]);

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
                        전력 품질 분석
                    </span>
                    <Auto_Button_Question
                        description="조회 기간 내 데이터를 바탕으로 평균 전압, 평균 THD(고조파), 평균 주파수, 평균 전력을 나타냅니다."
                    />
                </div>
                <div className="flex flex-wrap items-center justify-between mt-3">
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">평균 전압</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{powerQualityStats.voltageLnAvg} V</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">평균 THD</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{powerQualityStats.voltageThdAvg} %</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">평균 주파수</div>
                            <div className="font-semibold mt-2 mb-2">{powerQualityStats.frequencyAvg} Hz</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">평균 전류</div>
                            <div className="font-semibold mt-2 mb-2">{powerQualityStats.currentAvg} A</div>
                        </div>
                    </div>
                </div>
            </Card>
            <Card noborder>
                <div className="flex justify-between items-center mb-5">
                    <div className="text-xl flext item-center, justify-between">
                        <span className="mr-2">전압 및 주파수 추이</span>
                        <Auto_Button_Question
                            description={"기간 내 전압과 주파수 추이를 나타냅니다. 조회기간이 2일 이내이면 시간 단위, 7일 이내이면 4시간 단위, 8일 이상이면 일단위로 나타냅니다."}
                        />
                    </div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData_fre}
                        title={"전력 품질 분석 - 전압 및 주파수 추이"}
                    />
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData_fre}
                    columnDefs={columnDefs}
                    height={"153"}
                />
                <div className="flex justify-end items-center mt-3">
                    <div className="font-semibold text-lg mr-5">전압 상한 : {220 + 13}</div>
                    <div className="font-semibold text-lg mr-5">전압 하한 : {220 - 13}</div>
                    <div className="font-semibold text-lg mr-5">주파수 상한 : {60 + 0.2}</div>
                    <div className="font-semibold text-lg mr-5">주파수 하한 : {60 - 0.2}</div>
                </div>
                <MixedChart data={chartData_fre} height={300} />
            </Card>
            <Card noborder>
                <div className="flex justify-between items-center mb-5">
                    <div className="text-xl">
                        <span className="mr-2">전압 및 전류 추이</span>
                        <Auto_Button_Question
                            description={"기간 내 전압과 전류 추이를 나타냅니다. 조회기간이 2일 이내이면 시간 단위, 7일 이내이면 4시간 단위, 8일 이상이면 일단위로 나타냅니다."}
                        />
                    </div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData_cur}
                        title={"전력 품질 분석 - 전압 및 전류 추이"}
                    />
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData_cur}
                    columnDefs={columnDefs}
                    height={"153"}
                />
                <div className="flex justify-end items-center mt-3">
                    <div className="font-semibold text-lg mr-5">전압 상한 : {220 + 13}</div>
                    <div className="font-semibold text-lg mr-5">전압 하한 : {220 - 13}</div>
                </div>
                <MixedChart data={chartData_cur} height={300} />
            </Card>
            <Card noborder>
                <div className="flex justify-between items-center mb-5">
                    <div className="text-xl">
                        <span className="mr-2">전압 및 고조파 추이</span>
                        <Auto_Button_Question
                            description={"기간 내 전압과 고조파 추이를 나타냅니다. 조회기간이 2일 이내이면 시간 단위, 7일 이내이면 4시간 단위, 8일 이상이면 일단위로 나타냅니다."}
                        />
                    </div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData_thd}
                        title={"전력 품질 분석 - 전압 및 고조파 추이"}
                    />
                </div>
                <div className="flex justify-end items-center mt-3">
                    <div className="font-semibold text-lg mr-5">고조파 상한 : {15}</div>
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData_thd}
                    columnDefs={columnDefs}
                    height={"153"}
                />
                <MixedChart data={chartData_thd} height={300} />
            </Card>
        </div>
    )
};

export default PowerQualityAnalysis