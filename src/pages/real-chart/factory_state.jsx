import React, { useState, useEffect, useMemo, useRef } from "react";
import HomeBredCurbs from "@/components/partials/widget/chart/HomeBredCurbs";
import useDarkMode from "@/services/hooks/useDarkMode";
import { useApiUrl } from "@/context/APIContext";
import Card from "@/components/ui/Card";
import axios from "axios";
import HeatMapChart from "@/components/autocomponent/areaChart/Auto_HeatMapChart";
import { heat_data } from "@/services/constant/data";
import {
    Auto_Button_Search,
    Auto_Card_Grid,
    Auto_Label_Text_Set,
    Auto_Radio_Useflag,
    TitleBar,
    Auto_SearchDropDown,
    DropDownItemGetter,
    Auto_AgGrid
} from "@/components/autocomponent";

const DashBoard = () => {
    const [filterMap, setFilterMap] = useState("usa");
    const [count, setCount] = useState(0);
    const [isDark] = useDarkMode();
    const apiUrl = useApiUrl(); // API URL 가져오기
    const [gridData, setGridData] = useState([]); // 그리드에 셋팅할 데이터
    const primaryKeys_g2 = []; // 그리드 2의 기본 키
    const gridRef = useRef(); //
    const originalDataRef = useRef(new Map()); // U 업데이트위한 useRef

    useEffect(() => {
        // 1분(60초)마다 페이지 상태를 리셋
        const interval = setInterval(() => {
            setCount((prev) => prev + 1);
        }, 10000); // 60000ms = 1분

        // 컴포넌트 언마운트 시 interval을 정리
        return () => clearInterval(interval);
        }, []
    );

    // column 부분
    const gridColumns = useMemo(() => {
        const baseColumns = [
            {
                headerName: "",
                field: "item",
                cellClass: "text-center",
                minWidth: 250,
            },
            {
                headerName: "일자",
                field: "date",
                cellStyle: {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                },
                minWidth: 100,
                spanRows: true,
            },
            {
                headerName: "품목",
                field: "product",
                cellStyle: {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                },
                minWidth: 100,
                spanRows: (params) => {
                    const { nodeA, nodeB, } = params;
                    if (nodeA && nodeB) {
                        const isSameItem = nodeA.data.product === nodeB.data.product;
                        const isSameDate = nodeA.data.date === nodeB.data.date;

                        // 품목이 동일하고 날짜가 다른 경우에는 병합하지 않음
                        if (isSameItem && !isSameDate) {
                            return false;
                        }
                        // 품목이 동일하고 날짜도 동일하면 병합
                        if (isSameItem && isSameDate) {
                            return true;
                        }
                    }
                    return false;
                }
            }
        ];

        const labelColumns = heat_data[0]?.data.map((item) => ({
            headerName: item.x,
            field: item.x,
            cellClass: "text-center",
            minWidth: 100, 
        }));

        return [...baseColumns, ...labelColumns];
    }, []);

    // griddata 변환 부분
    useEffect(() => {
        const transformedData = heat_data.map((data) => {
            const newItem = { item: data.name, product: data.product, date: data.date };
            data.data.forEach((unitData) => {
                newItem[unitData.x] = unitData.y;
            });
            return newItem;
        });
        setGridData(transformedData);
    }, []);

    return (
        <div className="space-y-5">
            <HomeBredCurbs title="공장 모니터링 현황" />
            <div className="grid grid-cols-12 gap-5">
                <div className="lg:col-span-12 col-span-12">
                    <Card title="가동 시간 현황">
                        <HeatMapChart data={heat_data}/>
                    </Card>
                </div>
            </div>
            <Card noborder>
                <Auto_AgGrid
                  gridType="sender" // 데이터를 전달받아 처리하는 그리드
                  primaryKeys={primaryKeys_g2}
                  gridData={gridData}
                  gridRef={gridRef}
                  columnDefs={gridColumns}
                  originalDataRef={originalDataRef}
                  height="263"
                />
            </Card>
        </div>
    )
}

export default DashBoard;