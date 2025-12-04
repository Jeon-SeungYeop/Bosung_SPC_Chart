import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Card from "@/components/ui/Card";
import LineChart from "@/components/partials/widget/chart/LineChart";
import Icon from "@/components/ui/Icon";
import Auto_MessageModal from "@/components/autocomponent/common/Auto_MessageModal";
import {
    Auto_Label_Text_Set, CommonFunction, Auto_SearchDropDown, Auto_Spliter
} from "@/components/autocomponent";
import { AgGridReact } from "ag-grid-react";
import html2canvas from "html2canvas";

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
    // 선 위 label 간격
    const labelInterval = useMemo(() => {
        const len = line_data.labels?.length || 0;

        if (len === 0) return 1;
        return Math.floor(len / 3);
    }, [line_data]);

    const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);
    const fileInputRef = useRef(null);

    // Modal창 오픈
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    // gridData Default
    const makeDefaultGrid = () =>
        Array.from({ length: 10 }, (_, i) => ({
            temperature: "",
            time: "",
            variable: "",
            division: i === 0 ? "start" : "unavailable"
        }));

    const [gridData1, setGridData1] = useState(makeDefaultGrid);
    const [gridData2, setGridData2] = useState(makeDefaultGrid);
    const [gridData3, setGridData3] = useState(makeDefaultGrid);
    const [gridData4, setGridData4] = useState(makeDefaultGrid);
    const [gridData5, setGridData5] = useState(makeDefaultGrid);
    const [gridData6, setGridData6] = useState(makeDefaultGrid);

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
    );

    // 시간 포맷 함수 (초 -> 시:분:초)
    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    // griddata에서 division !== 'unavailable' 인 마지막 행의 온도 반환
    function getLastValidTemperature(griddata) {
        for (let i = griddata.length - 1; i >= 0; i--) {
            const row = griddata[i];
            if (row.division !== 'unavailable') {
                const temp = Number(row.temperature);
                if (!Number.isFinite(temp)) return null;
                return temp;
            }
        }
        return null; // 유효한 행이 없는 경우
    }

    // 차트 생성
    const STEP_SECONDS = 30; // 30초당 1개의 점

    // amplitude(진폭) 값에 따른 랜덤 변동 함수
    function applyAmplitude(temp, amplitude) {
        if (!amplitude || amplitude === 0) return temp;
        const range = Number(amplitude);
        const randomOffset = (Math.random() * 2 - 1) * range; // -range ~ +range
        return temp + randomOffset;
    }

    function make_chart(griddata, cycleCount = 1, amplitude = 0) {
        const start_point = Number(griddata[0].temperature);
        if (!start_point && start_point !== 0) return null;

        const chartData = [];
        const labels = [];
        let currentTemp = start_point;
        let currentTime = 0; // 초 단위

        // 사이클 반복
        for (let cycle = 0; cycle < cycleCount; cycle++) {
            // 첫 사이클의 시작점만 추가 (이후 사이클은 이전 마지막점과 연결)
            if (cycle === 0) {
                chartData.push(start_point);
                labels.push(formatTime(currentTime));
            }

            for (let i = 1; i < griddata.length; i++) {
                const row = griddata[i];

                if (row.division === 'unavailable') continue;
                const targetTemp = Number(row.temperature);
                const timeValue = Number(row.time);      // 분 단위
                const variable = Number(row.variable);   // 시간당 온도 변화량(℃/h)

                if (row.division === 'maintain') {
                    // 유지: time(분) 동안 targetTemp 유지
                    if (!targetTemp && targetTemp !== 0) continue;
                    if (!timeValue) continue;

                    const totalSeconds = timeValue * 60;  // 초
                    const dataPoints = Math.max(
                        1,
                        Math.round(totalSeconds / STEP_SECONDS)
                    );

                    for (let j = 0; j < dataPoints; j++) {
                        currentTime += STEP_SECONDS; // 30초씩 증가
                        chartData.push(applyAmplitude(targetTemp, amplitude));
                        labels.push(formatTime(currentTime));
                    }
                    currentTemp = targetTemp;
                } else if (row.division === 'heat' || row.division === 'freeze') {
                    if (!targetTemp && targetTemp !== 0) continue;
                    if (!variable) continue; // variable 없으면 계산 불가

                    // 가변량 = 1시간당 변화량(℃/h)
                    // 실제 소요 시간(h) = (목표온도 - 현재온도) / 가변량
                    let variablePerHour = variable; // 기본은 1시간당 variable
                    const baseHours = Number(row.time); // heat/freeze일 때 time은 "시간(h)" 단위로 사용

                    if (baseHours && baseHours > 0) {
                        variablePerHour = variable / baseHours;
                    }

                    if (!variablePerHour) continue;

                    // 가변량(℃/h) 기준으로 실제 걸리는 시간 계산
                    const tempDiff = targetTemp - currentTemp;
                    const actualHours = Math.abs(tempDiff) / variablePerHour;
                    const totalSeconds = actualHours * 3600; // h -> sec
                    const dataPoints = Math.max(
                        1,
                        Math.round(totalSeconds / STEP_SECONDS)
                    );

                    const tempPerPoint = tempDiff / dataPoints; // STEP_SECONDS(30초)마다 변화량

                    for (let j = 0; j < dataPoints; j++) {
                        currentTime += STEP_SECONDS; // 30초씩 증가
                        currentTemp += tempPerPoint;
                        chartData.push(applyAmplitude(currentTemp, amplitude));
                        labels.push(formatTime(currentTime));
                    }
                    currentTemp = targetTemp;
                }
            }
        }

        return {
            labels: labels,
            data: chartData,
        };
    }

    const btn_make_chart = () => {
        // 적용 체크 하나도 없으면 모달
        if (!searchParams.grid1 && !searchParams.grid2 && !searchParams.grid3 && !searchParams.grid4 && !searchParams.grid5 && !searchParams.grid6) {
            setIsModalOpen(true);
            return;
        }

        // 적용 체크된 온도계들 모으기
        const selectedGrids = [];
        if (searchParams.grid1) selectedGrids.push({ label: "온도계1", data: gridData1 });
        if (searchParams.grid2) selectedGrids.push({ label: "온도계2", data: gridData2 });
        if (searchParams.grid3) selectedGrids.push({ label: "온도계3", data: gridData3 });
        if (searchParams.grid4) selectedGrids.push({ label: "온도계4", data: gridData4 });
        if (searchParams.grid5) selectedGrids.push({ label: "온도계5", data: gridData5 });
        if (searchParams.grid6) selectedGrids.push({ label: "온도계6", data: gridData6 });

        // Cycle 값 (없으면 1)
        const cycleCount = Number(searchParams.cycle) || 1;

        // Amplitude 값 (없으면 0)
        const amplitudeValue = Number(searchParams.amplitude) || 0;

        // 각 griddata의 "unavailable이 아닌 마지막 행" 온도 구하기
        const lastTemps = [];
        const missingTemps = [];

        selectedGrids.forEach(({ label, data }) => {
            const t = getLastValidTemperature(data);
            if (t === null) {
                missingTemps.push(label);
            } else {
                lastTemps.push({ label, temp: t });
            }
        });

        // 마지막 온도 제대로 안 들어간 온도계가 있으면 먼저 알림
        if (missingTemps.length > 0) {
            alert(
                "다음 온도계의 사용안함이 아닌 마지막 행의 온도를 입력해 주세요.\n\n" +
                missingTemps.join(", ")
            );
            return;
        }

        // cycle이 2 이상일 때만 마지막 온도 비교
        if (cycleCount >= 2 && lastTemps.length > 1) {
            const base = lastTemps[0];
            const different = lastTemps.filter((x) => x.temp !== base.temp);

            if (different.length > 0) {
                const baseText = `${base.label}(${base.temp}℃)`;
                const diffText = different
                    .map((x) => `${x.label}(${x.temp}℃)`)
                    .join(", ");

                alert(
                    "적용된 온도계의 사용안함이 아닌 마지막 행 온도 값이 서로 다릅니다.\n\n" +
                    `기준: ${baseText}\n` +
                    `다른 온도: ${diffText}`
                );
                return; // 차트 생성 중단
            }
        }

        const tempResults = [];

        // 각 선택된 그리드의 차트 생성
        selectedGrids.forEach(({ label, data }) => {
            const result = make_chart(data, cycleCount, amplitudeValue);
            if (result) {
                tempResults.push({
                    label,
                    ...result,
                });
            }
        });

        if (tempResults.length === 0) {
            return;
        }

        // 동기화 없이 그대로 표시
        setChartDatasets(tempResults);
    };

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
    const TH_KEYS = ["온도계1", "온도계2", "온도계3", "온도계4", "온도계5", "온도계6"];

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
    const divRef = useRef();
    const title = "차트 생성";

    // 여러 장의 페이지를 지원하는 프린트 미리보기
    const openPrintPreviewWithBlobs = ({ blobUrls, title, pageW, pageH, isLandscape }) => {
        const pagesHtml = blobUrls
            .map(
            (url, idx) => `
                <div class="page">
                <img src="${url}" alt="${title} - ${idx + 1}" />
                </div>
            `
            )
            .join("\n");

        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8" />
                    <title>${title}</title>
                    <style>
                        :root { --page-w:${pageW}; --page-h:${pageH}; }
                        html, body { margin:0; padding:0; }
                        body {
                            background:#f5f5f5;
                            display:flex;
                            flex-direction:column;
                            align-items:center;
                            gap:16px;
                            padding:20px;
                        }
                        .print-btn {
                            padding:10px 20px;
                            border:none; border-radius:6px;
                            cursor:pointer;
                            background:#10b981; color:#fff; font-size:16px;
                        }
                        .print-btn:hover { background:#059669; }
                        .page {
                            width:var(--page-w);
                            height:var(--page-h);
                            background:#fff;
                            box-shadow:0 2px 8px rgba(0,0,0,.1);
                            display:flex; align-items:center; justify-content:center;
                            page-break-after: always;
                        }
                        .page:last-child {
                            page-break-after: auto;
                        }
                        .page > img {
                            width:100%;
                            height:100%;
                            display:block;
                            object-fit:contain;
                            page-break-inside: avoid;
                            break-inside: avoid;
                        }
                        @media print {
                            html, body { margin:0; padding:0; background:#fff; }
                            .print-btn { display:none; }
                            .page { box-shadow:none; margin:0; }
                        }
                        @page {
                            size: A4 ${isLandscape ? "landscape" : "portrait"};
                            margin: 0;
                        }
                    </style>
                </head>
                <body>
                    ${pagesHtml}
                    <button class="print-btn" onclick="window.print()">🖨️ 프린트</button>
                    <script>
                    window.addEventListener('beforeunload', () => {
                        try {
                        const urls = ${JSON.stringify(blobUrls)};
                        urls.forEach(function(u) {
                            try { URL.revokeObjectURL(u); } catch(e) {}
                        });
                        } catch(e){}
                    });
                    </script>
                </body>
            </html>`;

        const htmlBlob = new Blob([html], { type: "text/html" });
        const htmlUrl = URL.createObjectURL(htmlBlob);

        const w = window.open(htmlUrl, "_blank", "noopener");
        if (w) w.name = htmlUrl;

        const timer = setInterval(() => {
            if (!w || w.closed) {
                clearInterval(timer);
                try { URL.revokeObjectURL(htmlUrl); } catch(e){}
                try {
                    blobUrls.forEach(function(u) {
                        try { URL.revokeObjectURL(u); } catch(e){}
                    });
                } catch(e){}
            }
        }, 1000);
    };

    const handleDownload = async (orientation = "portrait") => { // portrait : 세로로 긴 , landscape : 가로로 긴
        if (!divRef.current) return;

        // 차트 크기 조절 후 잠시 대기
        setLeftPanelHeight(1500);
        await new Promise(r => setTimeout(r, 100));

        // Chart.js가 그린 실제 canvas 가져오기
        const canvas = divRef.current.querySelector("canvas");
        if (!canvas) {
            console.error("차트 canvas를 찾을 수 없습니다.");
            return;
        }

        // 원본 캔버스를 복사해서 작업용으로 사용
        const srcCanvas = document.createElement("canvas");
        srcCanvas.width = canvas.width;
        srcCanvas.height = canvas.height;
        const srcCtx = srcCanvas.getContext("2d");
        if (!srcCtx) return;
        srcCtx.drawImage(canvas, 0, 0);

        try {
            const DPI = 300;
            const A4_PX = {
                portrait: {
                    w: Math.round(8.27 * DPI),
                    h: Math.round(11.69 * DPI),
                },
                landscape: {
                    w: Math.round(11.69 * DPI),
                    h: Math.round(8.27 * DPI),
                },
            };
            const size = A4_PX[orientation] || A4_PX.portrait;
            const A4W = size.w;
            const A4H = size.h;

            const MARGIN_MM = 10;
            const mmToPx = (mm) => Math.round((mm / 25.4) * DPI);
            const margin = mmToPx(MARGIN_MM);
            const contentW = A4W - margin * 2;
            const contentH = A4H - margin * 2;

            // 세로 기준 scale (축소만)
            const scale = Math.min(contentH / srcCanvas.height, 1);
            const sliceWidth = contentW / scale; // 원본 기준 한 장 폭
            const totalWidth = srcCanvas.width;

            // 왼쪽→오른쪽으로 겹치지 않는 구간 계산
            const segments = [];
            if (totalWidth <= sliceWidth) {
                segments.push({ sx: 0, sWidth: totalWidth });
            } else {
                const remainder = totalWidth % sliceWidth; // 왼쪽 짧은 구간
                let x = 0;

                if (remainder > 0) {
                    segments.push({ sx: 0, sWidth: remainder });
                    x = remainder;
                }
                for (; x < totalWidth; x += sliceWidth) {
                    const w = Math.min(sliceWidth, totalWidth - x);
                    segments.push({ sx: x, sWidth: w });
                }
            }

            // 오른쪽(마지막 구간)이 첫 페이지가 되도록 역순
            segments.reverse();

            const blobUrls = [];

            for (let i = 0; i < segments.length; i++) {
                const seg = segments[i];
                const sx = seg.sx;
                const sWidth = seg.sWidth;
                const sHeight = srcCanvas.height;

                const out = document.createElement("canvas");
                out.width = A4W;
                out.height = A4H;
                const ctx = out.getContext("2d");
                if (!ctx) continue;

                // 배경 흰색
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, A4W, A4H);

                const dWidth = sWidth * scale;
                const dHeight = contentH;

                // 오른쪽 정렬
                const extraSpace = contentW - dWidth; // 남는 공간
                const dx = margin + Math.max(0, extraSpace);
                const dy = margin;

                ctx.drawImage(
                    srcCanvas,
                    sx,
                    0,
                    sWidth,
                    sHeight,
                    dx,
                    dy,
                    dWidth,
                    dHeight
                );

                const blob = await new Promise((resolve) =>
                    out.toBlob(function (b) {
                        resolve(b);
                    }, "image/png")
                );

                if (blob) {
                    const blobUrl = URL.createObjectURL(blob);
                    blobUrls.push(blobUrl);
                }
            }

            if (blobUrls.length === 0) return;

            const isLandscape = orientation === "landscape";
            const pageW = isLandscape ? "297mm" : "210mm";
            const pageH = isLandscape ? "210mm" : "297mm";

            openPrintPreviewWithBlobs({
                blobUrls,
                title,
                pageW,
                pageH,
                isLandscape,
            });
        } catch (error) {
            console.error("Error converting chart to multi-page A4:", error);
        }
    };

    // 각 계 초기화
    const resetGrid1 = () => {
        setGridData1(makeDefaultGrid());
        setSearchParams(prev => ({ ...prev, grid1: false }));
    };
    const resetGrid2 = () => {
        setGridData2(makeDefaultGrid());
        setSearchParams(prev => ({ ...prev, grid2: false }));
    };
    const resetGrid3 = () => {
        setGridData3(makeDefaultGrid());
        setSearchParams(prev => ({ ...prev, grid3: false }));
    };
    const resetGrid4 = () => {
        setGridData4(makeDefaultGrid());
        setSearchParams(prev => ({ ...prev, grid4: false }));
    };
    const resetGrid5 = () => {
        setGridData5(makeDefaultGrid());
        setSearchParams(prev => ({ ...prev, grid5: false }));
    };
    const resetGrid6 = () => {
        setGridData6(makeDefaultGrid());
        setSearchParams(prev => ({ ...prev, grid6: false }));
    };

    // 차트 크기 초기화
    const reset_chart_size = () => {
        setLeftPanelHeight(400);
        setSplitKey((prev) => prev + 1);
    }
    // Spliter 높이 설정
    const [leftPanelHeight, setLeftPanelHeight] = useState(400);
    const [splitKey, setSplitKey] = useState(0);
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
                    activeModal={isModalOpen}
                    onClose={handleCancel}
                    title="적용 실패"
                    message={"적용된 데이터가 없습니다."}
                    answertype="OK"
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
                    key={splitKey}
                    vertical={true}
                    left_width={20}
                    onResize={handleSplitterResize}
                    leftContent={
                        <div ref={divRef} className="w-full sm:w-full lg:pr-4 text-[0.8vw]">
                            <Card noborder>
                                <LineChart line_data={line_data} height={leftPanelHeight} label={searchParams.date} labelInterval={labelInterval}/>
                            </Card>
                        </div>
                    }
                    rightContent={
                        <div className="w-full sm:w-full lg:pr-4 text-[0.8vw]">
                            <Card noborder>
                                <div className="flex flex-wrap gap-x-12 items-center gap-y-1">
                                    <Auto_Label_Text_Set
                                        label="실시일시"
                                        value={searchParams.date}
                                        onChange={(e) => updateSearchParams("date", e.target.value)}
                                        labelSpacing={"-mr-2"}
                                        inputWidth="210px"
                                    />
                                    <Auto_SearchDropDown
                                        label="Cycle"
                                        onChange={(item) => updateSearchParams("cycle", item?.value || item)}
                                        inputWidth="100px"
                                        horizontal
                                        dropDownData={dropdownData.cycle.items}
                                        labelSpacing={'-mr-2'}
                                        value={searchParams.cycle}
                                    />
                                    <Auto_Label_Text_Set
                                        label="진폭(±)"
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
                                        onClick={() => handleDownload("landscape")}
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
                                    <button
                                        onClick={reset_chart_size}
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
                                            <span className="ml-2">차트 크기 초기화</span>
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
    );
};

export default ProcessQualityTrand;