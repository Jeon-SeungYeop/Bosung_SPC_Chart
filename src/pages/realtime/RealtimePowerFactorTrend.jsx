import {
  Auto_LabelPopup_Set, CommonFunction, Auto_Popup_CodeName, Auto_GridCellButtonRenderer, Auto_AgGrid, TitleBar, Auto_SearchDropDown,
  DropDownItemGetter, Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid, Auto_Spliter, Auto_Label_Text_Set,
  Auto_Radio_Useflag, Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid, Auto_Button_Column_State, Auto_DateTimePickerF_T
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import Bosung_equipmentid_search from "@/components/bosungcomponent/Bosung_equipmentid_search";
import MixedChart from "@/components/partials/widget/chart/Mixed";

const RealtimePowerFactorTrend = () => {
    // 그리드 매핑 데이터
    const [gridData, setGridData] = useState([]);
    // rawData만 저장
    const [rawData, setRawData] = useState([]);
    // 차트용 rawData
    const [chartRawData, setChartRawData] = useState([]);
    const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
    const apiUrl = useApiUrl();
    // Default Chart Data(페이지 로드시 오류 방지)
    const [chartData, setChartData] = useState({
        label: "load-ratio",
        labels: [],
        datas: []
    });

    const search_address = "realtime/realtimepowerfactortrend-r";

    // 차트데이터로 변환
    const formatChartData = (data) => {
        const labels = data.map((_, idx) => (idx ).toString());
        const FactorData = data.map(item => item.power_factor_avg);
        const normal = data.map(() => 0.97);
        const caution = data.map(() => 0.95);
        const warning = data.map(() => 0.92);

        return {
            label: "RealtimePowerFactorTrend_1point",
            labels: labels,
            datas: [
                {
                    name: grid1KeyData.current.equipmentname,
                    type: "line",
                    data: FactorData
                },
                {
                    name: '정상',
                    type: "line",
                    data: normal
                },
                {
                    name: '주의',
                    type: "line",
                    data: caution
                },
                {
                    name: '경고',
                    type: "line",
                    data: warning
                },
            ]
        };
    };

    // 그리드 데이터 변환 (pivot)
    function pivotForAgGrid(data) {
        if (!data || data.length === 0) return [];

        // equipmentname별로 power_factor_avg 목록 그룹화
        const groups = data.reduce((acc, item) => {
            const name = item.equipmentname;
            acc[name] = acc[name] || [];
            acc[name].push(item.power_factor_avg);
            return acc;
        }, {});

        // 행 갯수 계산
        const maxLen = Math.max(...Object.values(groups).map(arr => arr.length));

        // 행 생성: 한 행당 { metric: equipmentname, "1": 값, "2": 값, ... }
        const rows = Object.entries(groups).map(([name, arr]) => {
            const row = { metric: name };
            for (let i = 0; i < maxLen; i++) {
                row[(i).toString()] = (i < arr.length) ? arr[i] : null;
            }
            return row;
        });

        return rows;
    }


    // 조회 후 데이터 변경
    useEffect(() => {
        setGridData(pivotForAgGrid(rawData));
    }, [rawData]);
    useEffect(() => {
        setChartData(formatChartData(chartRawData));
    }, [chartRawData])

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
                cellClass:  "text-right",
                editable: false,
                minWidth: 80,
                valueFormatter: (params) => {
                    const val = params.value;
                    if (val != null && !isNaN(val)) {
                        // 소수점 셋째 자리까지 자르기 (반올림 없음)
                        return (Math.floor(Number(val) * 1000) / 1000).toString();
                    }
                    return '';
                },
                cellClassRules: {
                    "text-yellow-500": params =>
                        params.value != null &&
                        !isNaN(params.value) &&
                        params.value >= 0.92 &&
                        params.value < 0.95,

                    "text-red-700": params =>
                        params.value != null &&
                        !isNaN(params.value) &&
                        params.value < 0.92
                },
            })),
        ];
    }, [gridData]);

    // 그리드에서 데이터 선택 시 차트 호출
    const grid1KeyData = useRef({ equipmentname: ""});
    const afterMainGridSelect = async (event) => {
        const selectedRows = event.api.getSelectedRows();

        if (selectedRows.length === 0) return; // 선택된게 없으면 리턴

        grid1KeyData.current.equipmentname = selectedRows[0].metric

        inquireSubGrid();
    }

    // 차트 데이터 조회
    const inquireSubGrid = async () => {
        await CommonFunction.fetchAndSetGridData({
            apiUrl,
            searchinfo: {
                address: "realtime/realtimepowerfactortrend-r2",
                params: {
                    equipmentname: grid1KeyData.current.equipmentname ?? "",
                },
            },
            setGridData: setChartRawData,
        });
    };


    // 조회시 첫 행 선택
    const isFirstRender = useRef(true); // 최초 1 회 변경(excuteSuccesAndSearch 가 세팅되는 화면 오픈 시점 ) 감지 무시 용 변수
    const [selectedRowindex, setSelectedRowindex] = useState(0); // 선택 처리 하고자 하는  index 
    let matchedIndex = 0;
    useEffect(() => {
        if(isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        // 차트 초기화
        setChartData([])
        // gridData가 비어있으면 조회하지 않음
        if (gridData.length <1) {
            grid1KeyData.current.equipmentname = "";
            return;
        }

        matchedIndex = gridData.findIndex(
            (item) =>
                item.metric === grid1KeyData.current.equipmentname
        );
        if (matchedIndex === -1){
            grid1KeyData.current.equipmentname = gridData[0].metric
            matchedIndex = 0;
        }
        if (selectedRowindex !== matchedIndex) {
            setSelectedRowindex(matchedIndex);
        }
        inquireSubGrid();
    }, [excuteSuccesAndSearch])

    return (
        <div className="space-y-5">
            <TitleBar title={"실시간 역률 추이"}/>
            <Bosung_equipmentid_search
                adress={search_address}
                setGridData={setRawData}
                excuteSuccesAndSearch={excuteSuccesAndSearch}
            />
            <Card noborder>
                <div className="flex items-center mb-5 space-x-10 h-full">
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData}
                        title={"실시간 역률추이"}
                    />
                    <div className="flex justify-between items-center h-full">
                        <div className="border-2 h-full p-2 rounded-lg">
                            역률 관리 기준 | 정상 : 95% &le; 역률 &le; 97% | <span className="text-yellow-500">주의 : 92% &le; 역률 &lt; 95% </span>| <span className="text-red-700">경고 : 역률 &lt; 92% </span> 
                        </div>
                    </div>
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData}
                    columnDefs={columnDefs}
                    onSelectionChanged={afterMainGridSelect}
                    selectedRowindex={selectedRowindex}
                    height={"300"}
                />
                <MixedChart data={chartData} height={300} />
            </Card>
        </div>
    );
};

export default RealtimePowerFactorTrend;
