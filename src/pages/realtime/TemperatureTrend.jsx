import React, { useState, useEffect, useMemo, useRef } from "react";
import useDarkMode from "@/services/hooks/useDarkMode";
import { useApiUrl } from "@/context/APIContext";
import Card from "@/components/ui/Card";
import axios from "axios";
import {
  Auto_LabelPopup_Set, CommonFunction, Auto_Popup_CodeName, Auto_GridCellButtonRenderer, Auto_AgGrid, TitleBar,
  Auto_SearchDropDown, DropDownItemGetter, Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid,
  Auto_Button_Search_AGgrid, Auto_Spliter, Auto_Label_Text_Set, Auto_Radio_Useflag, Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid,
  Auto_Button_Column_State, Auto_DateTimePickerF_T
} from "@/components/autocomponent";
import Bosung_equipmentid_search2 from "@/components/bosungcomponent/Bosung_equipmentid_search2";
import MixedChart from "@/components/partials/widget/chart/Mixed";

const TemperatureTrend = () => {
    //////////////////////////////////////////////////////////////////////// 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
    const [gridData, setGridData] = useState([]);  // 그리드 매핑 데이터
    const [rawData, setRawData] = useState({});
    //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////
    const [chartData, setChartData] = useState({
        label: "load-ratio",
        labels: [
                
        ],
        datas: [
                
        ]
    });
    
    // 차트데이터로 변환
    const formatChartData = (rawData) => {
        // changeArray의 jbody 데이터 사용
        const changeData = rawData?.changeArray?.jbody || [];
        const labels = changeData.map((_, idx) => (idx).toString());
        const usage_kwhData = changeData.map(item => item.usage_kwh);
        const avg_carburtemppvData = changeData.map(item => item.day_avg_carburtemppv);
        const avg_bathtemppvData = changeData.map(item => item.day_avg_bathtemppv);
        const max_carburtemppvData = changeData.map(item => item.day_max_carburtemppv);
        const max_bathtemppvData = changeData.map(item => item.day_max_bathtemppv);

        return {
            label: "TemperatureTrend",
            labels: labels,
            datas: [
                {
                    name: "전력",
                    type: "line", 
                    data: usage_kwhData
                },
                {
                    name: "침탄평균",
                    type: "line",
                    data: avg_carburtemppvData
                },
                {
                    name: "유조평균",
                    type: "line",
                    data: avg_bathtemppvData
                },
                {
                    name: "침탄최대",
                    type: "line",
                    data: max_carburtemppvData
                },
                {
                    name: "유조최대",
                    type: "line",
                    data: max_bathtemppvData
                },
            ]
        };
    };

    // 그리드 데이터 변환
    function pivotForAgGrid(rawData) {
        const data = rawData?.changeArray?.jbody || [];
        const usage_kwhRow = { metric: '전력' };
        const avg_carburtemppvRow = { metric: '침탄평균' };
        const avg_bathtemppvRow = { metric: '유조평균' };
        const max_carburtemppvRow = { metric : '침탄최대'};
        const max_bathtemppvRow = { metric : '유조최대' };

        data.forEach((item, idx) => {
            const day = (idx).toString();
            usage_kwhRow[day] = item.usage_kwh;
            avg_carburtemppvRow[day] = item.day_avg_carburtemppv;
            avg_bathtemppvRow[day] = item.day_avg_bathtemppv;
            max_carburtemppvRow[day] = item.day_max_carburtemppv;
            max_bathtemppvRow[day] = item.day_max_bathtemppv;
        });

        return [usage_kwhRow, avg_carburtemppvRow, avg_bathtemppvRow, max_carburtemppvRow, max_bathtemppvRow];
    }

    const address = "realtime/temperaturetrend-r"
    
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
                minWidth: 140,
                pinned: 'left'
            },
            ...keys.map(key => ({
                field: key,
                headerName: key,
                cellClass: "text-right",
                editable: false,
                minWidth: 80,
                valueFormatter: (params) => {
                    const val = params.value;
                    return val != null && !isNaN(val)
                        ? Number(val).toFixed(2)
                        : '';
                }
            }))
        ];
    }, [gridData]);
    
    // nowArray의 현재 데이터 사용
    const lastData = rawData?.nowArray?.jbody?.[0] || {};

    
    return (
        <>
            <Bosung_equipmentid_search2
                searchAdress={address}
                setGridData={setRawData}
            />
            <Card noborder className="mt-3">
                <h6 className="font-medium lg:text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                    침탄(소입) 온도
                </h6>
                <div className="flex flex-wrap items-center justify-between mt-1">
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">현재온도</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{lastData.current_carburtemppv ? (lastData.current_carburtemppv).toFixed(2) : "--"} ℃</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">평균온도</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{lastData.hour_avg_carburtemppv ? (lastData.hour_avg_carburtemppv).toFixed(2) : "--"} ℃</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">최대온도</div>
                            <div className="font-semibold mt-2 mb-2">{lastData.hour_max_carburtemppv ? (lastData.hour_max_carburtemppv).toFixed(2) : "--"} ℃</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">전력부하</div>
                            <div className="font-semibold mt-2 mb-2">{lastData.current_avg_kw_total ? (lastData.current_avg_kw_total).toFixed(2) : "--"} kW</div>
                        </div>
                    </div>
                </div>
                <h6 className="font-medium lg:text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4 mt-3">
                    유조 온도
                </h6>
                <div className="flex flex-wrap items-center justify-between mt-1">
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">현재온도</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{lastData.current_bathtemppv ? (lastData.current_bathtemppv).toFixed(2) : "--"} ℃</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">평균온도</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{lastData.hour_avg_bathtemppv ? (lastData.hour_avg_bathtemppv).toFixed(2) : "--"} ℃</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">최대온도</div>
                            <div className="font-semibold mt-2 mb-2">{lastData.hour_max_bathtemppv ? (lastData.hour_max_bathtemppv).toFixed(2) : "--"} ℃</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">전력부하</div>
                            <div className="font-semibold mt-2 mb-2">{lastData.current_avg_kw_total ? (lastData.current_avg_kw_total).toFixed(2) : "--"} kW</div>
                        </div>
                    </div>
                </div>
            </Card>
            <Card noborder className="mt-3">
                <div className="flex items-center justify-between mb-5 space-x-10 h-full">
                    <div>온도 추이</div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData}
                        title={"온도트랜드"}
                    />
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData}
                    columnDefs={columnDefs}
                    height={"263"}
                />
                <MixedChart data={chartData} height={350}/>
            </Card>
        </>
    );
};

export default TemperatureTrend;