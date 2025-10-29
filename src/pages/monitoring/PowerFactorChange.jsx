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

const PowerFactorChange = () => {
    // 그리드 매핑 데이터
    const [gridData, setGridData] = useState([]);
    // rawData만 저장
    const [rawData, setRawData] = useState([]);
    // 차트용 rawData
    const [chartRawData, setChartRawData] = useState([]);
    const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 저장 이후 재조회 
    const intervalRef = useRef(null); // interval 참조를 저장하기 위한 ref
    const apiUrl = useApiUrl();
    
    // Default Chart Data(페이지 로드시 오류 방지)
    const [chartData, setChartData] = useState({
        label: "load-ratio",
        labels: [],
        datas: []
    });

    const search_address = "monitoring/powerfactorchange-r";

    // 차트데이터로 변환
    const formatChartData = (data) => {
        const labels = data.map(item => {
            return item.collecthour != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : item.collectdate.substring(5);;
        });
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

        // equipmentname별로 데이터 그룹화
        const groups = data.reduce((acc, item) => {
            const name = item.equipmentname;
            if (!acc[name]) {
                acc[name] = {
                    items: [],
                    startdate: item.startdate,
                    enddate: item.enddate
                };
            }
            acc[name].items.push(item);
            return acc;
        }, {});

        // 각 equipmentname별로 행 생성
        const rows = Object.entries(groups).map(([name, group]) => {
            const row = { 
                metric: name,
                startdate: group.startdate,
                enddate: group.enddate
            };
            
            group.items.forEach((item) => {
                // collecthour가 있으면 날짜+시간, 없으면 날짜만
                const day = item.collecthour != null 
                    ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                    : item.collectdate.substring(5);
                row[day] = item.power_factor_avg;
            });
            
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
        ? Object.keys(gridData[0]).filter(key => 
            key !== 'metric' && 
            key !== 'startdate' && 
            key !== 'enddate'
        )
        : [];

        return [
            {
                field: 'metric',
                headerName: '',
                cellClass: "text-center",
                minWidth: 140,
                pinned: 'left'
            },
            {
                field: 'startdate',
                headerName: 'start',
                cellClass: "text-center",
                minWidth: 140,
                hide: true
            },
            {
                field: 'enddate',
                headerName: 'end',
                cellClass: "text-center",
                minWidth: 140,
                hide: true
            },
            ...keys.map(key => ({
                field: key,
                headerName: key,
                cellClass:  "text-right",
                editable: false,
                minWidth: 110,
                valueFormatter: (params) => {
                    // 소수점 둘째 자리까지 포맷
                    const val = params.value;
                    return val != null && !isNaN(val)
                        ? Number(val).toFixed(2)
                        : '';
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
    const grid1KeyData = useRef({ equipmentname: "", startdate: "", enddate: ""});
    const afterMainGridSelect = async (event) => {
        const selectedRows = event.api.getSelectedRows();

        if (selectedRows.length === 0) return; // 선택된게 없으면 리턴

        grid1KeyData.current.equipmentname = selectedRows[0].metric
        grid1KeyData.current.startdate = selectedRows[0].startdate
        grid1KeyData.current.enddate = selectedRows[0].enddate

        inquireSubGrid();
    }

    // 차트 데이터 조회
    const inquireSubGrid = async () => {
        await CommonFunction.fetchAndSetGridData({
            apiUrl,
            searchinfo: {
                address: "monitoring/powerfactorchange-r2",
                params: {
                    equipmentname: grid1KeyData.current.equipmentname ?? "",
                    startdate: grid1KeyData.current.startdate ?? "",
                    enddate: grid1KeyData.current.enddate ?? "",
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
        // 차트 초기화 (기본 구조 유지)
        setChartData({
            label: "load-ratio",
            labels: [],
            datas: []
        });
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

    // 1분마다 자동 재조회 설정
    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setExcuteSuccesAndSearch(prev => !prev);
        }, 60000); // 60초 (1분)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return (
        <div className="space-y-5">
            <TitleBar title={"실시간 역률 추이"}/>
            <Bosung_equipmentid_search
                adress={search_address}
                setGridData={setRawData}
                excuteSuccesAndSearch={excuteSuccesAndSearch}
                isDate={true}
            />
            <Card noborder>
                <div className="flex items-center mb-5 space-x-2 h-full">
                    <Auto_Button_Export_Excel
                        columnDefs={columnDefs}
                        gridData={gridData}
                        title={"실시간 역률추이"}
                    />
                    <Auto_Button_Question
                        description={"기간 내 공정 별 설비의 역률 추이를 나타냅니다. 조회기간이 2일 이내이면 시간 단위, 7일 이내이면 4시간 단위, 8일 이상이면 일단위로 나타냅니다. 역률은 공급전력 중 실제 일에 쓰인 비율입니다. 1에 가까울수록 효율적입니다."}
                    />
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    gridData={gridData}
                    columnDefs={columnDefs}
                    onSelectionChanged={afterMainGridSelect}
                    selectedRowindex={selectedRowindex}
                    height={"300"}
                />
                <div className="flex justify-between items-center h-full mt-2">
                    <div className="border-2 h-full p-2 rounded-lg">
                        역률 관리 기준 | 정상 : 95% &le; 역률 &le; 97% | <span className="text-yellow-500">주의 : 92% &le; 역률 &lt; 95% </span>| <span className="text-red-700">경고 : 역률 &lt; 92% </span> 
                    </div>
                </div>
                <MixedChart data={chartData} height={300} />
            </Card>
        </div>
    );
};

export default PowerFactorChange;