import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Card from "@/components/ui/Card";
import LineChart from "@/components/partials/widget/chart/LineChart";
import Icon from "@/components/ui/Icon";
import Auto_MessageModal from "@/components/autocomponent/common/Auto_MessageModal";
import {
    Auto_Label_Text_Set, CommonFunction, Auto_SearchDropDown, Auto_Spliter
} from "@/components/autocomponent";
import { AgGridReact } from "ag-grid-react";

const ProcessQualityTrand = () => {
    const [searchParams, setSearchParams] = useState({
        date: "",
        cycle: "",
        amplitude: "",
        grid1: false,
        grid2: false,
        grid3: false,
        grid4: false,
        grid5: false,
        grid6: false,
    });
    
    const [chartDatasets, setChartDatasets] = useState([]);
    
    const line_data = useMemo(() => {
        if (chartDatasets.length === 0) {
            return { labels: [], datasets: [] };
        }
        
        // 가장 긴 labels를 가진 데이터셋 찾기
        const longestDataset = chartDatasets.reduce((longest, current) => {
            return (current.labels?.length || 0) > (longest.labels?.length || 0) ? current : longest;
        }, chartDatasets[0]);
        
        return {
            labels: longestDataset.labels || [],
            datasets: chartDatasets.map((dataset, idx) => ({
                label: dataset.label,
                data: dataset.data,
                borderColor: `hsl(${idx * 60}, 70%, 50%)`,
                backgroundColor: `hsla(${idx * 60}, 70%, 50%, 0.1)`,
                tension: 0.4,
            }))
        };
    }, [chartDatasets]);
    
    const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
    const fileInputRef = useRef(null);
    
    // Modal창 오픈
    const [isModalOpen, setIsModalOpen] = useState(false); // All 적용 X
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    // gridData Default
    const [gridData1, setGridData1] = useState(
        Array.from({ length: 10 }, (_, i) => ({
            temperature: "",
            time: "",
            variable: "",
            division: i === 0 ? "start" : "unavailable"
        }))
    );
    const [gridData2, setGridData2] = useState(
        Array.from({ length: 10 }, (_, i) => ({
            temperature: "",
            time: "",
            variable: "",
            division: i === 0 ? "start" : "unavailable"
        }))
    );
    const [gridData3, setGridData3] = useState(
        Array.from({ length: 10 }, (_, i) => ({
            temperature: "",
            time: "",
            variable: "",
            division: i === 0 ? "start" : "unavailable"
        }))
    );
    const [gridData4, setGridData4] = useState(
        Array.from({ length: 10 }, (_, i) => ({
            temperature: "",
            time: "",
            variable: "",
            division: i === 0 ? "start" : "unavailable"
        }))
    );
    const [gridData5, setGridData5] = useState(
        Array.from({ length: 10 }, (_, i) => ({
            temperature: "",
            time: "",
            variable: "",
            division: i === 0 ? "start" : "unavailable"
        }))
    );
    const [gridData6, setGridData6] = useState(
        Array.from({ length: 10 }, (_, i) => ({
            temperature: "",
            time: "",
            variable: "",
            division: i === 0 ? "start" : "unavailable"
        }))
    );

    // 입력부 dropdownData items 지정
    const [dropdownData, setDropdownData] = useState({
        cycle: { 
            items: [
                { label: "1", value: "1" },
                { label: "2", value: "2" },
                { label: "3", value: "3" },
                { label: "4", value: "4" },
                { label: "5", value: "5" }
            ], 
            mappings: {} 
        },
    });    
    
    // Column 정의
    const columnDefs = useMemo(
        () => [
            {
                field: "temperature",
                headerName: "설정온도(℃)",
                editable: (params) => {
                    const division = params.data.division;
                    return division === 'start' || division === 'heat' || division === 'freeze' || division === 'maintain';
                },
                cellEditor: 'agTextCellEditor',
                cellEditorParams: {
                    useFormatter: true,
                },
                valueParser: params => {
                    const value = params.newValue;
                    return value && !isNaN(value) ? Number(value) : '';
                },
                cellClass: "text-right ag-cell-border"
            },
            {
                field: "time",
                headerName: "시간(/h, min)",
                editable: (params) => {
                    if (params.node.rowIndex === 0) return false;
                    const division = params.data.division;
                    return division === 'heat' || division === 'freeze' || division === 'maintain';
                },
                cellEditor: 'agTextCellEditor',
                cellEditorParams: {
                    useFormatter: true,
                },
                valueParser: params => {
                    const value = params.newValue;
                    return value && !isNaN(value) ? Number(value) : '';
                },
                cellClass: "text-right ag-cell-border"
            },
            {
                field: "variable",
                headerName: "가변량(℃)",
                editable: (params) => {
                    if (params.node.rowIndex === 0) return false;
                    const division = params.data.division;
                    return division === 'heat' || division === 'freeze';
                },
                cellEditor: 'agTextCellEditor',
                cellEditorParams: {
                    useFormatter: true,
                },
                valueParser: params => {
                    const value = params.newValue;
                    return value && !isNaN(value) ? Number(value) : '';
                },
                cellClass: "text-right ag-cell-border"
            },
            {
                field: "division",
                headerName: "구분",
                editable: (params) => params.node.rowIndex !== 0,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: params.node.rowIndex === 0 
                            ? ['start'] 
                            : ['heat', 'maintain', 'freeze', 'unavailable']
                    };
                },
                valueFormatter: params => {
                    const valueMap = {
                        'start': '시작',
                        'heat': '가열',
                        'maintain': '유지',
                        'freeze': '냉각',
                        'unavailable': '사용안함'
                    };
                    return valueMap[params.value] || '';
                },
                cellClass: "ag-cell-border"
            },
        ],
        [dropdownData]
    )

    // 시간 포맷 함수 (초 -> 시:분:초)
    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    // 차트 생성
    function make_chart(griddata) {
        const start_point = Number(griddata[0].temperature);
        if (!start_point && start_point !== 0) return null;

        const chartData = [];
        const labels = [];
        let currentTemp = start_point;
        let currentTime = 0; // 초 단위
        let reachedTime = null; // 180도에 도달한 시간

        // 시작점 추가
        chartData.push(currentTemp);
        labels.push(formatTime(currentTime));

        for (let i = 1; i < griddata.length; i++) {
            const row = griddata[i];
            
            if (row.division === 'unavailable') continue;

            const targetTemp = Number(row.temperature);
            const timeValue = Number(row.time);
            const variable = Number(row.variable);

            if (row.division === 'maintain') {
                // 유지: time(분) 동안 현재온도 유지
                if (!targetTemp && targetTemp !== 0) continue;
                if (!timeValue) continue;

                const totalSeconds = timeValue * 60;
                const dataPoints = totalSeconds * 2;

                for (let j = 0; j < dataPoints; j++) {
                    currentTime += 0.5;
                    chartData.push(targetTemp);
                    labels.push(formatTime(currentTime));
                    
                    // 180도 도달 체크
                    if (reachedTime === null && targetTemp >= 200) {
                        reachedTime = currentTime;
                    }
                }
                currentTemp = targetTemp;

            } else if (row.division === 'heat' || row.division === 'freeze') {
                if (!targetTemp && targetTemp !== 0) continue;
                if (!timeValue || !variable) continue;

                const actualTargetTemp = targetTemp;
                const totalSeconds = timeValue * 3600;
                const dataPoints = totalSeconds * 2;
                const tempDiff = actualTargetTemp - currentTemp;
                const tempPerPoint = tempDiff / dataPoints;

                for (let j = 0; j < dataPoints; j++) {
                    currentTime += 0.5;
                    currentTemp += tempPerPoint;
                    chartData.push(currentTemp);
                    labels.push(formatTime(currentTime));
                    
                    // 180도 도달 체크 (상승 중일 때만)
                    if (reachedTime === null && currentTemp >= 200 && row.division === 'heat') {
                        reachedTime = currentTime;
                    }
                }
                currentTemp = actualTargetTemp;
            }
        }

        return {
            labels: labels,
            data: chartData,
            reachedTime: reachedTime // 180도 도달 시간 반환
        };
    }

    const btn_make_chart = () => {
        if (!searchParams.grid1 && !searchParams.grid2 && !searchParams.grid3 && !searchParams.grid4 && !searchParams.grid5 && !searchParams.grid6) {
            setIsModalOpen(true);
            return;
        }

        const tempResults = [];
        
        // 각 그리드의 차트 데이터 생성
        if (searchParams.grid1) {
            const result = make_chart(gridData1);
            if (result) tempResults.push({ label: '온도계1', ...result });
        }
        if (searchParams.grid2) {
            const result = make_chart(gridData2);
            if (result) tempResults.push({ label: '온도계2', ...result });
        }
        if (searchParams.grid3) {
            const result = make_chart(gridData3);
            if (result) tempResults.push({ label: '온도계3', ...result });
        }
        if (searchParams.grid4) {
            const result = make_chart(gridData4);
            if (result) tempResults.push({ label: '온도계4', ...result });
        }
        if (searchParams.grid5) {
            const result = make_chart(gridData5);
            if (result) tempResults.push({ label: '온도계5', ...result });
        }
        if (searchParams.grid6) {
            const result = make_chart(gridData6);
            if (result) tempResults.push({ label: '온도계6', ...result });
        }

        // 180도에 도달한 차트들만 필터링
        const chartsReaching = tempResults.filter(r => r.reachedTime !== null);
        
        if (chartsReaching.length === 0) {
            // 180도에 도달한 차트가 없으면 그냥 표시
            setChartDatasets(tempResults);
            return;
        }

        // 가장 늦게 180도에 도달하는 시간 찾기
        const maxreachedTime = Math.max(...chartsReaching.map(r => r.reachedTime));

        // 각 차트를 동기화
        const synchronizedResults = tempResults.map(result => {
            if (result.reachedTime === null) {
                // 180도에 도달하지 않는 차트는 그대로 유지
                return result;
            }

            const timeDiff = maxreachedTime - result.reachedTime;
            
            if (timeDiff === 0) {
                // 가장 늦게 도달한 차트는 그대로
                return result;
            }

            // 180도에서 대기하는 포인트 개수 (0.5초마다 1개)
            const waitPoints = Math.floor(timeDiff * 2);
            
            // 180도 도달 시점의 인덱스 찾기
            let reachIndex = -1;
            for (let i = 0; i < result.data.length; i++) {
                const time = i * 0.5;
                if (time >= result.reachedTime) {
                    reachIndex = i;
                    break;
                }
            }

            if (reachIndex === -1) return result;

            // 새로운 데이터와 라벨 배열 생성
            const newData = [];
            const newLabels = [];

            // 180도 도달 전까지 복사
            for (let i = 0; i <= reachIndex; i++) {
                newData.push(result.data[i]);
                newLabels.push(result.labels[i]);
            }

            // 180도에서 대기하는 포인트 추가
            let waitTime = result.reachedTime;
            for (let i = 0; i < waitPoints; i++) {
                waitTime += 0.5;
                newData.push(200);
                newLabels.push(formatTime(waitTime));
            }

            // 나머지 포인트 복사 (시간은 조정)
            for (let i = reachIndex + 1; i < result.data.length; i++) {
                newData.push(result.data[i]);
                const originalTime = i * 0.5;
                const adjustedTime = originalTime + timeDiff;
                newLabels.push(formatTime(adjustedTime));
            }

            return {
                ...result,
                data: newData,
                labels: newLabels
            };
        });

        setChartDatasets(synchronizedResults);
    }

    // JSON 생성(시나리오 저장)
    function downloadJson(data, filename = "scenario.json") { // 한글 깨짐 방지 + JSON 다운로드
        const BOM = new Uint8Array([0xef, 0xbb, 0xbf]);
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([BOM, json], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }
    function ts() {
        // 2025-10-30T09:12:34 -> 2025-10-30-09-12-34
        return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    }
    const make_json = () => {
        // 적용 체크가 하나도 없으면 모달
        if (
            !searchParams.grid1 && !searchParams.grid2 && !searchParams.grid3 && !searchParams.grid4 && !searchParams.grid5 && !searchParams.grid6
        ) {
            setIsModalOpen(true);
            return;
        }

        // grid 데이터 중 division !== 'unavailable' 만 포함
        const pickRows = (rows) => rows.filter((r) => r.division !== "unavailable");

        // 체크된 그리드만 모아 객체 구성
        const payload = {
            meta: {
                date: searchParams.date || null,
                cycle: searchParams.cycle || null,
                amplitude: searchParams.amplitude || null,
                createdAt: new Date().toISOString(),
            },
            scenarios: {
                ...(searchParams.grid1 ? { 온도계1: pickRows(gridData1) } : {}),
                ...(searchParams.grid2 ? { 온도계2: pickRows(gridData2) } : {}),
                ...(searchParams.grid3 ? { 온도계3: pickRows(gridData3) } : {}),
                ...(searchParams.grid4 ? { 온도계4: pickRows(gridData4) } : {}),
                ...(searchParams.grid5 ? { 온도계5: pickRows(gridData5) } : {}),
                ...(searchParams.grid6 ? { 온도계6: pickRows(gridData6) } : {}),
            },
        };

        // 파일명 예: 시나리오 저장-2025-10-30-09-12-34.json
        downloadJson(payload, `시나리오 저장-${ts()}.json`);
    };

    // JSON 불러오기
    const load_json = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                let text = String(reader.result || "");
                if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

                const json = JSON.parse(text);
                const normalized = validateAndNormalizeScenario(json);

                // 상태 반영
                applyScenarioToState(normalized);

                alert("시나리오가 성공적으로 불러와졌습니다.");
            } catch (err) {
                alert(`시나리오 파일 형식이 올바르지 않습니다.`);
            }
        };
        reader.onerror = () => {
            alert("파일을 읽는 중 오류가 발생했습니다.");
        };
        reader.readAsText(file, "utf-8");
    };

    const MAX_ROWS = 10;
    const ALLOWED_DIVISIONS = new Set(["start", "heat", "maintain", "freeze", "unavailable"]);
    const TH_KEYS = ["온도계1","온도계2","온도계3","온도계4","온도계5","온도계6"];

    function normalizeNumber(v, fieldName) {
        if (v === "" || v === null || v === undefined) return "";
        const n = Number(v);
        if (!Number.isFinite(n)) {
            throw new Error(`${fieldName} 값이 숫자가 아닙니다: ${v}`);
        }
        return n;
    }

    function padRows(rows) {
        const copy = rows.slice(0, MAX_ROWS);
        while (copy.length < MAX_ROWS) {
         copy.push({ temperature: "", time: "", variable: "", division: "unavailable" });
        }
        return copy;
    }

    function validateRow(row, idx, thLabel) {
        if (typeof row !== "object" || row === null) {
            throw new Error(`${thLabel}의 ${idx + 1}번째 행이 객체가 아닙니다.`);
        }
        const division = row.division;
        if (!ALLOWED_DIVISIONS.has(division)) {
            throw new Error(`${thLabel}의 ${idx + 1}번째 행 division값이 올바르지 않습니다: ${division}`);
        }
        return {
            temperature: normalizeNumber(row.temperature, `${thLabel} 행${idx + 1} temperature`),
            time: normalizeNumber(row.time, `${thLabel} 행${idx + 1} time`),
            variable: normalizeNumber(row.variable, `${thLabel} 행${idx + 1} variable`),
            division,
        };
    }

    function validateAndNormalizeScenario(json) {
        if (typeof json !== "object" || json === null) {
            throw new Error("최상위가 객체(JSON) 형태가 아닙니다.");
        }
        if (!("meta" in json) || !("scenarios" in json)) {
            throw new Error("필수 키(meta, scenarios)가 없습니다.");
        }

        const meta = json.meta ?? {};
        const normMeta = {
            date: meta.date ?? null,
            cycle: meta.cycle ?? null,
            amplitude: meta.amplitude ?? null,
        };

        const scenarios = json.scenarios;
        if (typeof scenarios !== "object" || scenarios === null) {
            throw new Error("scenarios가 객체가 아닙니다.");
        }

        const normScenarios = {};
        for (const key of TH_KEYS) {
            if (key in scenarios) {
                const arr = scenarios[key];
                if (!Array.isArray(arr)) {
                    throw new Error(`${key} 값이 배열이 아닙니다.`);
                }
                const validated = arr.map((r, i) => validateRow(r, i, key));
                normScenarios[key] = padRows(validated);
            }
        }

        if (Object.keys(normScenarios).length === 0) {
            throw new Error("적용 가능한 온도계 데이터(온도계1~온도계6)가 없습니다.");
        }

        return { meta: normMeta, scenarios: normScenarios };
    }

    function applyScenarioToState({ meta, scenarios }) {
        setSearchParams((prev) => ({
            ...prev,
            date: meta.date ?? "",
            cycle: meta.cycle ?? "",
            amplitude: meta.amplitude ?? "",
            grid1: Boolean(scenarios["온도계1"]),
            grid2: Boolean(scenarios["온도계2"]),
            grid3: Boolean(scenarios["온도계3"]),
            grid4: Boolean(scenarios["온도계4"]),
            grid5: Boolean(scenarios["온도계5"]),
            grid6: Boolean(scenarios["온도계6"]),
    }));

    // 각 그리드 데이터 적용 (없으면 초기 템플릿 유지)
    const makeDefault = () =>
        Array.from({ length: MAX_ROWS }, (_, i) => ({
            temperature: "",
            time: "",
            variable: "",
            division: i === 0 ? "start" : "unavailable",
        }));

        setGridData1(scenarios["온도계1"] ?? makeDefault());
        setGridData2(scenarios["온도계2"] ?? makeDefault());
        setGridData3(scenarios["온도계3"] ?? makeDefault());
        setGridData4(scenarios["온도계4"] ?? makeDefault());
        setGridData5(scenarios["온도계5"] ?? makeDefault());
        setGridData6(scenarios["온도계6"] ?? makeDefault());
    }


    // 차트 프린트
    const handleDownload = () => {
        console.log("C")
    }

    // 각 계 초기화
    const resetGrid1 = () => {
        setGridData1(
            Array.from({ length: 10 }, (_, i) => ({
                temperature: "",
                time: "",
                variable: "",
                division: i === 0 ? "start" : "unavailable"
            }))
        );
        searchParams.grid1 = false;
    }
    const resetGrid2 = () => {
        setGridData2(
            Array.from({ length: 10 }, (_, i) => ({
                temperature: "",
                time: "",
                variable: "",
                division: i === 0 ? "start" : "unavailable"
            }))
        );
        searchParams.grid2 = false;
    }
    const resetGrid3 = () => {
        setGridData3(
            Array.from({ length: 10 }, (_, i) => ({
                temperature: "",
                time: "",
                variable: "",
                division: i === 0 ? "start" : "unavailable"
            }))
        );
        searchParams.grid3 = false;
    }
    const resetGrid4 = () => {
        setGridData4(
            Array.from({ length: 10 }, (_, i) => ({
                temperature: "",
                time: "",
                variable: "",
                division: i === 0 ? "start" : "unavailable"
            }))
        );
        searchParams.grid4 = false;
    }
    const resetGrid5 = () => {
        setGridData5(
            Array.from({ length: 10 }, (_, i) => ({
                temperature: "",
                time: "",
                variable: "",
                division: i === 0 ? "start" : "unavailable"
            }))
        );
        searchParams.grid5 = false;
    }
    const resetGrid6 = () => {
        setGridData6(
            Array.from({ length: 10 }, (_, i) => ({
                temperature: "",
                time: "",
                variable: "",
                division: i === 0 ? "start" : "unavailable"
            }))
        );
        searchParams.grid6 = false;
    }

    // Spliter 높이 설정
    const [leftPanelHeight, setLeftPanelHeight] = useState(400);
    const handleSplitterResize = useCallback((event) => {
        const totalHeight = 1800;
        const panelHeight = (totalHeight * event.sizes[0]) / 100;
        const headerHeight = 10;
        const cardPadding = 10;
        const newHeight = panelHeight - headerHeight - cardPadding;
        setLeftPanelHeight(Math.max(400, newHeight));
    }, []);

    return (
        <div className="space-x-5 p-2">
            {isModalOpen && (
                <Auto_MessageModal
                    activeModal={isModalOpen} // 열림 닫힘 여부 status
                    onClose={handleCancel} // 닫힘 버튼 클릭 액션
                    title="적용 실패" // title 
                    message={"적용된 데이터가 없습니다."} // 메시지
                    answertype="OK"  // 확인 버튼 . 
                    headericon={"failed"}
                />
            )}
            <style>
                {`
                    .ag-cell-border {
                        border-right: 1px solid #d1d5db !important;
                    }
                    .ag-theme-alpine .ag-header-cell {
                        border-right: 1px solid #d1d5db !important;
                    }
                `}
            </style>
            <div className="items-center">
                <Auto_Spliter
                    vertical={true}
                    left_width={20}
                    onResize={handleSplitterResize}
                    leftContent={
                        <div className="w-full  sm:w-full lg:pr-4 text-[0.8vw]">
                            <Card noborder>
                                <LineChart line_data={line_data} height={leftPanelHeight}/>
                            </Card>
                        </div>
                    }
                    rightContent={
                        <div className="w-full  sm:w-full lg:pr-4 text-[0.8vw]">
                            <Card noborder>
                                <div className="flex flex-wrap gap-x-12 items-center gap-y-1">
                                    <Auto_Label_Text_Set
                                        label="실시일시"
                                        value={searchParams.date}
                                        onChange={(e) => updateSearchParams("date", e.target.value)}
                                        labelSpacing={"-mr-2"}
                                        inputWidth="200px"
                                    />
                                    <Auto_SearchDropDown
                                        label="Cycle"
                                        onChange={(item) => updateSearchParams("cycle", item?.value || item)}
                                        inputWidth="100px"
                                        horizontal
                                        dropDownData={dropdownData.cycle.items}
                                        labelSpacing={'-mr-2'}
                                    />
                                    <Auto_Label_Text_Set
                                        label="진폭"
                                        value={searchParams.amplitude}
                                        onChange={(e) => updateSearchParams("amplitude", e.target.value)}
                                        labelSpacing={"-mr-8"}
                                        inputWidth="100px"
                                        endtxt={true}
                                    />
                                    <button
                                        onClick={btn_make_chart}
                                        className={`btn btn-dark shadow-base2 font-normal btn-sm group 
                                                    bg-[#F1F5F9] text-[#141412] 
                                                    dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg h-[38px]`
                                                }
                                    >
                                        <span className="flex items-center">
                                            <span
                                                className={`transition-transform duration-300 ease-in-out group-hover:scale-150 text-lg`}
                                            >
                                                <Icon icon={"heroicons-outline:chart-bar"} />
                                            </span>
                                            <span className="ml-2">차트 생성</span>
                                        </span>
                                    </button>
                                    <button
                                        onClick={make_json}
                                        className={`btn btn-dark shadow-base2 font-normal btn-sm group 
                                                    bg-[#F1F5F9] text-[#141412] 
                                                    dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg h-[38px]`
                                                }
                                    >
                                        <span className="flex items-center">
                                            <span
                                                className={`transition-transform duration-300 ease-in-out group-hover:scale-150 text-lg`}
                                            >
                                                <Icon icon={"heroicons-outline:document-arrow-down"} />
                                            </span>
                                            <span className="ml-2">시나리오 저장</span>
                                        </span>
                                    </button>
                                    <button
                                        onClick={load_json}
                                        className={`btn btn-dark shadow-base2 font-normal btn-sm group 
                                                    bg-[#F1F5F9] text-[#141412] 
                                                    dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg h-[38px]`
                                                }
                                    >
                                        <span className="flex items-center">
                                            <span
                                                className={`transition-transform duration-300 ease-in-out group-hover:scale-150 text-lg`}
                                            >
                                                <Icon icon={"heroicons-outline:document-arrow-up"} />
                                            </span>
                                            <span className="ml-2">시나리오 불러오기</span>
                                        </span>
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className={`btn btn-dark shadow-base2 font-normal btn-sm group 
                                                    bg-[#F1F5F9] text-[#141412] 
                                                    dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg h-[38px]`
                                                }
                                    >
                                        <span className="flex items-center">
                                            <span
                                                className={`transition-transform duration-300 ease-in-out group-hover:scale-150 text-lg`}
                                            >
                                                <Icon icon={"heroicons-outline:printer"} />
                                            </span>
                                            <span className="ml-2">차트 프린트</span>
                                        </span>
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="application/json,.json"
                                        onChange={handleFileChange}
                                        style={{ display: "none" }}
                                    />
                                </div>
                            </Card>
                            <div className="flex flex-wrap items-center justify-between mt-3 w-full">
                                <div className="w-full lg:w-[33%] sm:w-full text-[0.8vw] mb-2">
                                    <Card noborder>
                                        <div className="flex items-center gap-2 justify-between mb-3">
                                            <div>
                                                <h6 className="font-medium lg:text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                                                    온도계 1
                                                </h6>
                                            </div>
                                            <div className="flex space-x-8">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 cursor-pointer"
                                                        checked={searchParams.grid1}
                                                        onChange={(e) => updateSearchParams("grid1", e.target.checked)}
                                                    />
                                                    <span className="text-base font-medium">적용</span>
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={resetGrid1}
                                                        className={`btn btn-dark shadow-base2 font-normal btn-sm group 
                                                                    bg-[#F1F5F9] text-[#141412] 
                                                                    dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg h-[38px]`
                                                                }
                                                    >
                                                        <span className="flex items-center">
                                                            <span
                                                                className={`transition-transform duration-300 ease-in-out group-hover:scale-150 text-lg`}
                                                            >
                                                                <Icon icon={"heroicons-outline:arrow-path"} />
                                                            </span>
                                                            <span className="ml-2">초기화</span>
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ag-theme-alpine" style={{ height: '300px', width: '100%' }}>
                                            <AgGridReact
                                                rowData={gridData1}
                                                columnDefs={columnDefs}
                                                defaultColDef={{
                                                    flex: 1,
                                                    minWidth: 100,
                                                    resizable: true,
                                                }}
                                                domLayout="normal"
                                                singleClickEdit={true}
                                                stopEditingWhenCellsLoseFocus={true}
                                                suppressClickEdit={false}
                                            />
                                        </div>
                                    </Card>
                                </div>
                                <div className="w-full lg:w-[33%] sm:w-full text-[0.8vw] mb-2">
                                    <Card noborder>
                                        <div className="flex items-center gap-2 justify-between mb-3">
                                            <div>
                                                <h6 className="font-medium lg:text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                                                    온도계 2
                                                </h6>
                                            </div>
                                            <div className="flex space-x-8">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 cursor-pointer"
                                                        checked={searchParams.grid2}
                                                        onChange={(e) => updateSearchParams("grid2", e.target.checked)}
                                                    />
                                                    <span className="text-base font-medium">적용</span>
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={resetGrid2}
                                                        className={`btn btn-dark shadow-base2 font-normal btn-sm group 
                                                                    bg-[#F1F5F9] text-[#141412] 
                                                                    dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg h-[38px]`
                                                                }
                                                    >
                                                        <span className="flex items-center">
                                                            <span
                                                                className={`transition-transform duration-300 ease-in-out group-hover:scale-150 text-lg`}
                                                            >
                                                                <Icon icon={"heroicons-outline:arrow-path"} />
                                                            </span>
                                                            <span className="ml-2">초기화</span>
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ag-theme-alpine" style={{ height: '300px', width: '100%' }}>
                                            <AgGridReact
                                                rowData={gridData2}
                                                columnDefs={columnDefs}
                                                defaultColDef={{
                                                    flex: 1,
                                                    minWidth: 100,
                                                    resizable: true,
                                                }}
                                                domLayout="normal"
                                                singleClickEdit={true}
                                                stopEditingWhenCellsLoseFocus={true}
                                                suppressClickEdit={false}
                                            />
                                        </div>
                                    </Card>
                                </div>
                                <div className="w-full lg:w-[33%] sm:w-full text-[0.8vw] mb-2">
                                    <Card noborder>
                                        <div className="flex items-center gap-2 justify-between mb-3">
                                            <div>
                                                <h6 className="font-medium lg:text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                                                    온도계 3
                                                </h6>
                                            </div>
                                            <div className="flex space-x-8">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 cursor-pointer"
                                                        checked={searchParams.grid3}
                                                        onChange={(e) => updateSearchParams("grid3", e.target.checked)}
                                                    />
                                                    <span className="text-base font-medium">적용</span>
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={resetGrid3}
                                                        className={`btn btn-dark shadow-base2 font-normal btn-sm group 
                                                                    bg-[#F1F5F9] text-[#141412] 
                                                                    dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg h-[38px]`
                                                                }
                                                    >
                                                        <span className="flex items-center">
                                                            <span
                                                                className={`transition-transform duration-300 ease-in-out group-hover:scale-150 text-lg`}
                                                            >
                                                                <Icon icon={"heroicons-outline:arrow-path"} />
                                                            </span>
                                                            <span className="ml-2">초기화</span>
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ag-theme-alpine" style={{ height: '300px', width: '100%' }}>
                                            <AgGridReact
                                                rowData={gridData3}
                                                columnDefs={columnDefs}
                                                defaultColDef={{
                                                    flex: 1,
                                                    minWidth: 100,
                                                    resizable: true,
                                                }}
                                                domLayout="normal"
                                                singleClickEdit={true}
                                                stopEditingWhenCellsLoseFocus={true}
                                                suppressClickEdit={false}
                                            />
                                        </div>
                                    </Card>
                                </div>
                                <div className="w-full lg:w-[33%] sm:w-full text-[0.8vw] mb-2">
                                    <Card noborder>
                                        <div className="flex items-center gap-2 justify-between mb-3">
                                            <div>
                                                <h6 className="font-medium lg:text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                                                    온도계 4
                                                </h6>
                                            </div>
                                            <div className="flex space-x-8">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 cursor-pointer"
                                                        checked={searchParams.grid4}
                                                        onChange={(e) => updateSearchParams("grid4", e.target.checked)}
                                                    />
                                                    <span className="text-base font-medium">적용</span>
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={resetGrid4}
                                                        className={`btn btn-dark shadow-base2 font-normal btn-sm group 
                                                                    bg-[#F1F5F9] text-[#141412] 
                                                                    dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg h-[38px]`
                                                                }
                                                    >
                                                        <span className="flex items-center">
                                                            <span
                                                                className={`transition-transform duration-300 ease-in-out group-hover:scale-150 text-lg`}
                                                            >
                                                                <Icon icon={"heroicons-outline:arrow-path"} />
                                                            </span>
                                                            <span className="ml-2">초기화</span>
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ag-theme-alpine" style={{ height: '300px', width: '100%' }}>
                                            <AgGridReact
                                                rowData={gridData4}
                                                columnDefs={columnDefs}
                                                defaultColDef={{
                                                    flex: 1,
                                                    minWidth: 100,
                                                    resizable: true,
                                                }}
                                                domLayout="normal"
                                                singleClickEdit={true}
                                                stopEditingWhenCellsLoseFocus={true}
                                                suppressClickEdit={false}
                                            />
                                        </div>
                                    </Card>
                                </div>
                                <div className="w-full lg:w-[33%] sm:w-full text-[0.8vw] mb-2">
                                    <Card noborder>
                                        <div className="flex items-center gap-2 justify-between mb-3">
                                            <div>
                                                <h6 className="font-medium lg:text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                                                    온도계 5
                                                </h6>
                                            </div>
                                            <div className="flex space-x-8">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 cursor-pointer"
                                                        checked={searchParams.grid5}
                                                        onChange={(e) => updateSearchParams("grid5", e.target.checked)}
                                                    />
                                                    <span className="text-base font-medium">적용</span>
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={resetGrid5}
                                                        className={`btn btn-dark shadow-base2 font-normal btn-sm group 
                                                                    bg-[#F1F5F9] text-[#141412] 
                                                                    dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg h-[38px]`
                                                                }
                                                    >
                                                        <span className="flex items-center">
                                                            <span
                                                                className={`transition-transform duration-300 ease-in-out group-hover:scale-150 text-lg`}
                                                            >
                                                                <Icon icon={"heroicons-outline:arrow-path"} />
                                                            </span>
                                                            <span className="ml-2">초기화</span>
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ag-theme-alpine" style={{ height: '300px', width: '100%' }}>
                                            <AgGridReact
                                                rowData={gridData5}
                                                columnDefs={columnDefs}
                                                defaultColDef={{
                                                    flex: 1,
                                                    minWidth: 100,
                                                    resizable: true,
                                                }}
                                                domLayout="normal"
                                                singleClickEdit={true}
                                                stopEditingWhenCellsLoseFocus={true}
                                                suppressClickEdit={false}
                                            />
                                        </div>
                                    </Card>
                                </div>
                                <div className="w-full lg:w-[33%] sm:w-full text-[0.8vw] mb-2">
                                    <Card noborder>
                                        <div className="flex items-center gap-2 justify-between mb-3">
                                            <div>
                                                <h6 className="font-medium lg:text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
                                                    온도계 6
                                                </h6>
                                            </div>
                                            <div className="flex space-x-8">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 cursor-pointer"
                                                        checked={searchParams.grid6}
                                                        onChange={(e) => updateSearchParams("grid6", e.target.checked)}
                                                    />
                                                    <span className="text-base font-medium">적용</span>
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={resetGrid6}
                                                        className={`btn btn-dark shadow-base2 font-normal btn-sm group 
                                                                    bg-[#F1F5F9] text-[#141412] 
                                                                    dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg h-[38px]`
                                                                }
                                                    >
                                                        <span className="flex items-center">
                                                            <span
                                                                className={`transition-transform duration-300 ease-in-out group-hover:scale-150 text-lg`}
                                                            >
                                                                <Icon icon={"heroicons-outline:arrow-path"} />
                                                            </span>
                                                            <span className="ml-2">초기화</span>
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ag-theme-alpine" style={{ height: '300px', width: '100%' }}>
                                            <AgGridReact
                                                rowData={gridData6}
                                                columnDefs={columnDefs}
                                                defaultColDef={{
                                                    flex: 1,
                                                    minWidth: 100,
                                                    resizable: true,
                                                }}
                                                domLayout="normal"
                                                singleClickEdit={true}
                                                stopEditingWhenCellsLoseFocus={true}
                                                suppressClickEdit={false}
                                            />
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    }
                />
            </div>
        </div>
    )
};

export default ProcessQualityTrand;