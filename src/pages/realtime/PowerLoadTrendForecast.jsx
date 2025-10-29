import {
  Auto_LabelPopup_Set, CommonFunction, Auto_Popup_CodeName, Auto_GridCellButtonRenderer,
  Auto_AgGrid, TitleBar, Auto_SearchDropDown, DropDownItemGetter,
  Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid,
  Auto_Spliter, Auto_Label_Text_Set, Auto_Radio_Useflag, Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid, Auto_Button_Column_State,
  Auto_DateTimePickerF_T
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import LineChart from "@/components/partials/widget/chart/LineChart";
import { colors, hexToRGB } from "@/services/constant/data";

const PowerLoadTrendForecast = () => {
    //////////////////////////////////////////////////////////////////////// 그리드 필수 필드 멤버 ////////////////////////////////////////////////////////////////////////
    const apiUrl = useApiUrl();  // Backend 접속 정보
    const gridRef= useRef();    // 삭제를 위한 참조 행 정보
    const [gridData, setGridData] = useState([]);  // 그리드 매핑 데이터
    const [gridSubData, setGridSubData] = useState([]);  // 그리드 Sub 매핑 데이터
    const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false);  // 저장 이후 재조회
    const originalDataRef = useRef(new Map());  // U 업데이트위한 useRef
    const [addDdata, setAddData] = useState([]);  // 추가 대상 리스트
    //////////////////////////////////////////////////////////////////////// 화면 별 유동 설정 필드 멤버 ////////////////////////////////////////////////////////////////////////
    // Default Chart Data(페이지 로드시 오류 방지)
    const [chartData, setChartData] = useState({
        label: "default",
        labels: [
            
        ],
        datasets: [
            
        ]
    });
    const primaryKeys_g2 = ["plantcode"];

    // 차트데이터로 변환
    const formatChartData = (rawData) => {
        // 인덱스를 이용해 "HH:MM" 라벨 생성
        const labels = rawData.map((_, idx) => {
            const totalMinutes = idx * 15;
            const h = Math.floor(totalMinutes / 60);
            const m = totalMinutes % 60;
            const hh = String(h).padStart(2, '0');
            const mm = String(m).padStart(2, '0');
            return `${hh}:${mm}`;
        });

        // 각 시계열 데이터 추출
        // kw_total과 kw_total_max는 마지막 12개 데이터를 제외하고 추출
        const kw_total = rawData.map((item, idx) => {
            if (idx >= rawData.length - 12) {
                return null;
            }
            return item.kw_total;
        });
        
        const kw_total_max = rawData.map((item, idx) => {
            if (idx >= rawData.length - 12) {
                return null;
            }
            return item.kw_total_max;
        });
        const demand_kw_total_prediction = rawData.map(item => item.demand_kw_total_prediction);

        return {
            label: "powerloadtrend",
            labels,
            datasets: [
                {
                    label: "유효전력",
                    data: kw_total,
                    backgroundColor : hexToRGB(colors.primary, 1),
                    borderColor : colors.primary,
                },
                {
                    label: "최대부하",
                    data: kw_total_max,
                    backgroundColor: hexToRGB("#6B7280", 1),
                    borderColor: "#6B7280",
                },
                {
                    label: "전력부하예측",
                    data: demand_kw_total_prediction,
                    backgroundColor : hexToRGB(colors.danger, 1),
                    borderColor : colors.danger,
                }
            ]
        };
    };

    // 컴포넌트 상단(또는 formatChartData 옆)에 추가
    const pivotForAgGrid = (data) => {
        const metrics = [
            { key: 'kw_total', metric: '유효전력' },
            { key: 'kw_total_max', metric: '최대부하' },
            { key: 'demand_kw_total_prediction', metric: '전력부하예측' },
        ];

        return metrics.map(({ key, metric }) => {
            const row = { metric };

            data.forEach((item, idx) => {
                // 인덱스로부터 분 단위 필드명 생성
                const minutes = idx * 15;
                row[minutes.toString()] = item[key];
            });

            return row;
        });
    };


    // 조회 변수
    const [searchParams, setSearchParams] = useState({
        plantcode: "",
        sitecode: "",
    });
    // 검색조건 변경 즉시 반영 (setSearchParams 이후 선언할 것)
    const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
    // 조회 조건 및 조회 정보
    const searchinfo = useMemo(
        () => ({
            address: "realtime/powerloadtrendforecast-r",
            params: {
                plantcode: searchParams.plantcode?.value ?? "",
                sitecode: searchParams.sitecode?.value ?? "",
            },
        }),
        [searchParams]
    );

    // 드롭다운 데이터 상태
    const [dropdownData, setDropdownData] = useState({
        plantcode: { items: [], mappings: {} },
        sitecode: { items: [], mappings: {} },
    });

    // 드롭다운 데이터 로드
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [plantcodeAll, plantcodeRequired, sitecodeRequired] =
                    await Promise.all([
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode" }),  // 조회부 콤보박스  
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }),  // 그리드 콤보박스 ( 필수 선택 ) 
                        DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "sitecode", param4: "X" }),
                    ]);
                setDropdownData({
                    plantcode: { items: plantcodeAll, mappings: CommonFunction.convertData(plantcodeRequired)},
                    sitecode: { items: sitecodeRequired, mappings: CommonFunction.convertData(sitecodeRequired)},
                });
            }catch(error){
            }
        };
        loadDropdownData();
    }, [apiUrl]);

    // 컬럼 정의
    const columnDefs = useMemo(() => {
        const hours = Array.from({ length: 24 }, (_, i) => i);

        const timeGroups = hours.map(hour => {
            const minutes = [0, 15, 30, 45];
            const childColumns = minutes
            .filter(min => hour * 60 + min <= 1440)
            .map(min => {
                const fieldKey = (hour * 60 + min).toString();
                return {
                field: fieldKey,
                headerName: min.toString().padStart(2, '0'),
                cellClass: 'text-right',
                cellClassRules: {
                    'text-red-700': params => {
                        const numericKeys = Object.keys(params.data)
                            .filter(k => k !== 'metric')
                            .map(k => parseInt(k, 10))
                            .sort((a, b) => a - b);
                        const threshold = numericKeys[numericKeys.length - 12];
                        return parseInt(params.colDef.field, 10) >= threshold;
                    }
                },
                minWidth: 80,
                valueFormatter: params => {
                    const v = params.value;
                    return v != null && !isNaN(v) ? v.toFixed(2) : '';
                },
                };
            });

            return {
            headerName: hour.toString().padStart(2, '0'),
            headerClass: 'text-center',
            children: childColumns,
            };
        });

        return [
            {
            field: 'metric',
            headerName: '구분',
            cellClass: 'text-center',
            minWidth: 160,
            pinned: 'left',
            },
            ...timeGroups,
        ];
    }, []);

    return (
        <div className="space-y-5">
            <Card noborder>
                <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-y-6">
                    <div className="flex flex-col gap-y-1">
                        <div className="flex flex-wrap gap-x-24 items-end gap-y-1">
                            <Auto_SearchDropDown
                                label="사업장"
                                id="plantcode"
                                onChange={item => updateSearchParams("plantcode", item)}
                                inputWidth="217px"
                                horizontal
                                dropDownData={dropdownData.plantcode.items}
                                labelSpacing=""
                            />
                            <Auto_SearchDropDown
                                label="동"
                                id="factoryid"
                                onChange={item => updateSearchParams("sitecode", item)}
                                inputWidth="217px"
                                horizontal
                                dropDownData={dropdownData.sitecode.items}
                                labelSpacing=""
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-end h-full">
                        <Auto_Button_Search_AGgrid
                            searchinfo={searchinfo}
                            setGridData={rawData => {
                                // 차트용 데이터 세팅
                                setChartData(formatChartData(rawData));
                                // 그리드용으로 pivot 변환 후 세팅
                                setGridData(pivotForAgGrid(rawData));
                            }}
                            excuteSuccesAndSearch={excuteSuccesAndSearch}
                            originalDataRef={originalDataRef} // 변경 데이터 참조용 원본 데이터 복사 Map
                            primaryKeys={primaryKeys_g2} // 복사 세트를 만들 Key 정보 
                            setAddData={setAddData}
                        />
                    </div>
                </div>
            </Card>
            <Card noborder>
                <div className="flex justify-between mb-5">
                    <div className="flex space-x-2">
                        <Auto_Button_Export_Excel
                            columnDefs={columnDefs}
                            gridData={gridData}
                            title={"전력 부하 트랜드-예측"}
                        />
                    </div>
                </div>
                <Auto_AgGrid
                    gridType="sender"
                    primaryKeys={primaryKeys_g2}
                    gridData={gridData}
                    gridRef={gridRef}
                    columnDefs={columnDefs}
                    originalDataRef={originalDataRef}
                    height="243"
                />
                <div className="mt-5">
                    <LineChart line_data={chartData} height={300}/>
                </div>
            </Card>
        </div>
    )
};

export default PowerLoadTrendForecast;