import React, { useState, useEffect, useMemo, useRef } from "react";
import useDarkMode from "@/services/hooks/useDarkMode";
import { useApiUrl } from "@/context/APIContext";
import Card from "@/components/ui/Card";
import axios from "axios";
import {
  Auto_LabelPopup_Set, CommonFunction, Auto_Popup_CodeName, Auto_GridCellButtonRenderer, Auto_AgGrid, TitleBar,
  Auto_SearchDropDown, DropDownItemGetter, Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid,
  Auto_Button_Search_AGgrid, Auto_Spliter, Auto_Label_Text_Set, Auto_Radio_Useflag, Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid,
  Auto_Button_Column_State, Auto_DateTimePickerF_T, Auto_Button_Question
} from "@/components/autocomponent";
import Bosung_equipmentid_search from "@/components/bosungcomponent/Bosung_equipmentid_search";
import MixedChart from "@/components/partials/widget/chart/Mixed";

const CarbonEmissionForecast = () => {
    //////////////////////////////////////////////////////////////////////// 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
    const apiUrl = useApiUrl();  // Backend 접속 정보
    const gridRef= useRef();    // 삭제를 위한 참조 행 정보
    const [gridData, setGridData] = useState([]);  // 그리드 매핑 데이터
    // rawData만 저장
    const [rawData, setRawData] = useState([]);
    const originalDataRef = useRef(new Map());  // U 업데이트위한 useRef
    const [addDdata, setAddData] = useState([]);  // 추가 대상 리스트
    //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////
    const [chartData, setChartData] = useState({
        label: "CarbonEmissionForecast",
        labels: [
            
        ],
        datas: [
            
        ]
    });

    // 차트데이터로 변환
    const formatChartData = (rawData) => {
        const labels = rawData.map((_, idx) => (idx).toString());
        const usage_kwhData = rawData.map(item => item.usage_kwh);
        const usage_carbonData = rawData.map(item => (item.usage_kwh) * (0.4747 / 1000));
        const usage_kwh_netData = rawData.map(item => item.usage_kwh_net);
        const total_usage_carbonData = rawData.map(item => (item.usage_kwh_net) * (0.4747 / 1000));

        return {
            label: "carbonemissionforecast",
            labels: labels,
            datas: [
                {
                    name: "전력",
                    type: "line", 
                    data: usage_kwhData,
                },
                // {
                //     name: "누적전력",
                //     type: "line",
                //     data: usage_kwh_netData
                // },
                // {
                //     name: "탄소배출량",
                //     type: "line",
                //     data: usage_carbonData
                // },
                {
                    name: "누적탄소배출량",
                    type: "area",
                    data: total_usage_carbonData,
                },
            ]
        };
    };

    // 그리드 데이터 변환
    function pivotForAgGrid(data) {
        const usage_kwhRow = { metric: '전력' };
        const usage_carbonRow = { metric: '탄소배출량' };
        const usage_kwh_netRow = { metric: '누적전력' };
        const total_usage_carbonRow = { metric : '누적탄소배출량'};

        data.forEach((item, idx) => {
            const day = (idx).toString();
            usage_kwhRow[day] = item.usage_kwh;
            usage_carbonRow[day] = (item.usage_kwh) * (0.4747 / 1000);
            usage_kwh_netRow[day] = item.usage_kwh_net;
            total_usage_carbonRow[day] = (item.usage_kwh_net) * (0.4747 / 1000);
        });

        return [usage_kwhRow, usage_carbonRow, usage_kwh_netRow, total_usage_carbonRow];
    }
    const address = "realtime/carbonemissionforecast-r"

    useEffect(() => {
        setGridData(pivotForAgGrid(rawData));
        setChartData(formatChartData(rawData));
    },[rawData]);

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
                minWidth: 90,
                valueFormatter: (params) => {
                    const v = params.value;
                    if (v == null || isNaN(v)) return '';
                    const r = params.node?.rowIndex ?? -1;
                    const isFourDecimalRow = r === 1 || r === 3; // 2,4행
                    const digits = isFourDecimalRow ? 4 : 2;
                    return Number(v).toLocaleString('ko-KR', {
                        minimumFractionDigits: digits,
                        maximumFractionDigits: digits,
                    });
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

    // 배출량(전력→tCO2) 변환 계수
    const EMISSION_FACTOR = 0.4747 / 1000;

    // 금일 배출량(tCO2)
    const todayCarbon = (lastData?.usage_kwh_net ?? 0) * EMISSION_FACTOR;
    // 목표 배출량(tCO2)
    const targetCarbon = Number(lastData?.carbonemissiontarget ?? 0);

    const diffInfo = useMemo(() => {
    if (!targetCarbon) {
        return {
            text: "목표배출량 미지정",
            className: "text-slate-500",
        };
    }
    // (금일/목표)×100 => +면 초과, -면 미만
    const diff = (todayCarbon / targetCarbon) * 100;

    if (diff < 100) {
        return {
            text: `-${diff.toFixed(0)}% (미만)`,
            className: "text-blue-500",
        };
    } else if (diff > 100) {
        return {
            text: `+${diff.toFixed(0)}% (초과)`,
            className: "text-red-500",
        };
    } else {
        // 정확히 일치
        return {
            text: `100% (일치)`,
            className: "text-emerald-600",
        };
    }
    }, [todayCarbon, targetCarbon]);

    return (
        <>
            <Bosung_equipmentid_search
                adress={address}
                setGridData={setRawData}
            />
            <Card noborder className="mt-3">
                 <div className="flex items-center gap-2 justify-between">
                    <div className="flex">
                        <h6 className="font-medium lg:text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                            탄소 배출량 현황
                        </h6>
                        <Auto_Button_Question
                            description={
                                <>
                                    예측 배출량은 금일 배출량과 3시간 후의 예측 배출량을 합친 배출량입니다. 금일 배출량은 금일 0시부터 현재 시간까지의 배출량입니다. <br/>
                                    목표 배출량은 공장에서 지정한 값을 나타내며 지정된 목표량과 현재 배출량을 비교하여 목표 대비 차이가 보여집니다.
                                </>
                            }
                        />
                    </div>
                    <div>
                        탄소 배출량 = 전력량 X 탄소 배출계수(0.4747) / 1000  (tCO2)
                    </div>
                    <div>
                        목표 대비 차이 = (금일 배출량 / 목표 배출량) X 100 (%)&nbsp; &nbsp; &nbsp; &nbsp; * 목표배출량 : 설비마스터 일간 최대 전력
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between mt-3">
                    <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">예측 배출량</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{lastData.prediction_carbon? (lastData.prediction_carbon + (lastData.usage_kwh_net * (0.4747 / 1000))).toFixed(4) : 0} tCO2</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">금일 배출량</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">{lastData.usage_kwh_net ? (lastData.usage_kwh_net * (0.4747 / 1000)).toFixed(4) : 0} tCO2</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[45%] sm:w-full lg:pr-4 ">
                        <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">목표 배출량</div>
                            <div className="font-semibold mt-2 mb-2">{lastData.carbonemissiontarget ? (lastData.carbonemissiontarget).toFixed(4) : 0} tCO2</div>
                            <div className="ml-2 mt-2 mb-2">목표 대비 차이</div>
                            <div className={`font-semibold mr-3 mt-2 mb-2 ${diffInfo.className}`}>
                                {diffInfo.text}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
            <Card noborder className="mt-3">
                <div className="flex items-center justify-between mb-5 space-x-10 h-full">
                    <div>탄소배출량추이및예측</div>
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData}
                        title={"탄소배출량현황-예측"}
                    />
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData}
                    columnDefs={columnDefs}
                    height={"231"}
                />
                <MixedChart data={chartData} height={350}/>
            </Card>
        </>
    );
};

export default CarbonEmissionForecast;