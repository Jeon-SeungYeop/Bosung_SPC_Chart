import {
  Auto_LabelPopup_Set, CommonFunction, Auto_Popup_CodeName, Auto_GridCellButtonRenderer,
  Auto_AgGrid, TitleBar, Auto_SearchDropDown, DropDownItemGetter,
  Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid,
  Auto_Spliter, Auto_Label_Text_Set, Auto_Radio_Useflag, Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid, Auto_Button_Column_State,
  Auto_DateTimePickerF_T, Auto_Radio_DayMonth
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import MixedChart from "@/components/partials/widget/chart/Mixed";
import axios from "axios";
import FullButton from "@/components/autocomponent/areaGrid/Auto_Button_FullScreen";
import { toast } from "react-toastify";
import GaugeChart from "react-gauge-chart";
import useDarkMode from "@/services/hooks/useDarkMode";
import dayjs from "dayjs";

const ProcessDashboard = () => {
    const apiUrl = useApiUrl();  // Backend 접속 정보
    const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 조회 변수
    const [isDark] = useDarkMode();
    const barW = "w-[68%] sm:w-[70%] lg:w-[66%]";   // 당일 전기 사용량 부분 막대바 가로길이 조정
    // 날짜가 바뀌었을 때 강제로 리렌더하기 위한 tick
    const [dateTick, setDateTick] = useState(0);
    const [gridData, setGridData] = useState([]);
    const [rawData, setRawData] = useState([]);
    const [rawData2, setRawData2] = useState([]);
    const [rawData3, setRawData3] = useState([]);
    const [rawData4, setRawData4] = useState([]);
    const [chartData1, setChartData1] = useState({ label: "load-ratio", labels: [], datas: [] });
    const [chartData2, setChartData2] = useState({ label: "load-ratio", labels: [], datas: [] });

    // 천원 포맷 헬퍼
    const toThousandWon = (v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) return "0";
        return Math.round(n / 1000).toLocaleString('ko-KR');
    };
    const fmtSignedThousandWon = (v) => {
        const n = Number(v);
        const safe = Number.isFinite(n) ? n : 0;
        const value = Object.is(safe, -0) ? 0 : safe; // -0 방지
        const thousand = Math.round(value / 1000);
        try {
            return thousand.toLocaleString('ko-KR', { signDisplay: 'always' });
        } catch {
            const sign = thousand >= 0 ? '+' : '-';
            const abs = Math.abs(thousand).toLocaleString('ko-KR');
            return `${sign}${abs}`;
        }
    };
    // ===============================

    // 오늘기준으로 라벨 생성
    const today = dayjs();
    const currStart = today.subtract(1, "month").date(15).startOf("day"); // 전월 15일
    const currEnd   = today.date(14).endOf("day");                        // 당월 14일
    const prevStart = today.subtract(2, "month").date(15).startOf("day"); // 전전월 15일
    const prevEnd   = today.subtract(1, "month").date(14).endOf("day");   // 전월 14일
    const yearLabel  = `금년(${today.startOf("year").format("MM/DD")} ~ ${today.format("MM/DD")})`;
    const monthLabel = `당월(${currStart.format("MM/DD")} ~ ${currEnd.format("MM/DD")})`;
    const prevMonthLabel = `전월(${prevStart.format("MM/DD")} ~ ${prevEnd.format("MM/DD")})`;
    
    // 차트데이터로 변환
    const formatChartData = (data) => {
        const labels = data.map(item => {
            return item.collectdate != null 
                ? `${item.collectdate.substring(5)} ${String(item.collecthour).padStart(2, '0')}` 
                : `${item.collectmonth}-${item.collectday}`
        });
        const usage_kwh_chart_data = data.map(item => item.usage_kwh);
        const goal_data = data.map(item => item.goal);

        return {
            label: "dashboard_main",
            labels: labels,
            datas: [
                {
                    name: '실전력',
                    type: "line",
                    data: usage_kwh_chart_data
                },
                {
                    name: '목표사용',
                    type: "line",
                    data: goal_data
                },
            ]
        };
    };
    // 차트데이터로 변환
    const formatChartData2 = (data) => {
        const labels = data.map(item => {
            return `${item.collecthour}:${item.collectmin}`
        });
        const kw_total_data = data.map(item => item.kw_total);
        const kw_total_max_data = data.map(item => item.kw_total_max);
        const kw_total_min_data = data.map(item => item.kw_total_min);
        const usage_kwh_data = data.map(item => item.usage_kwh);

        return {
            label: "dashboard_chart2",
            labels: labels,
            datas: [
                {
                    name: '전력평균',
                    type: "line",
                    data: kw_total_data
                },
                {
                    name: '분간사용량',
                    type: "line",
                    data: usage_kwh_data
                },
                {
                    name: '최대부하',
                    type: "column",
                    data: kw_total_max_data
                },
                {
                    name: '최소부하',
                    type: "column",
                    data: kw_total_min_data
                },
            ]
        };
    };
    //날짜 라벨 자동 갱신
    useEffect(() => {
        const now = dayjs();
        const nextMidnight = now.add(1, "day").startOf("day");
        const ms = nextMidnight.diff(now, "millisecond");
        const t = setTimeout(() => setDateTick((v) => v + 1), ms);
        return () => clearTimeout(t);
    }, [dateTick]);
    // 전주 평균 대비 전기 사용량 계산
    const {
        diffKwh,        // now - prev
        diffPct,        // (now - prev) / prev * 100
        arrow,          // ▲ / ▼ / –
        trendColorClass // 증가=red, 감소=blue, 같음=slate
    } = useMemo(() => {
        const now  = Number(rawData?.[0]?.now_usage_kwh ?? 0);
        const prev = Number(rawData?.[0]?.pre_week_usage_kwh ?? 0);

        const dKwh = prev - now;
        const dPct = prev !== 0 ? (dKwh / prev) * 100 : 0;

        const sign = Math.sign(dKwh);
        const arr  = sign > 0 ? "▲" : sign < 0 ? "▼" : "–";
        const color = sign > 0
            ? "text-red-600"
            : sign < 0
            ? "text-blue-600 dark:text-blue-400"
            : "text-slate-500";

        return { diffKwh: dKwh, diffPct: dPct, arrow: arr, trendColorClass: color };
    }, [rawData]);

    // 작년 동일 대비 전기 사용량 계산
    const {
        diffKwh_y, diffPct_y, arrow_y, trendColorClass_y, hasPrevYear
    } = useMemo(() => {
        const prevRaw = rawData?.[0]?.pre_year_usage_kwh;
        const hasPrev = prevRaw != null; // null 또는 undefined 이면 false

        if (!hasPrev) {
            return {
                hasPrevYear: false,
                diffKwh_y: 0,
                diffPct_y: 0,
                arrow_y: "–",
                trendColorClass_y: "text-slate-500",
            };
        }

        const now  = Number(rawData?.[0]?.now_usage_kwh ?? 0);
        const prev = Number(prevRaw);
        const dKwh = prev - now; // 기존 로직 유지
        const dPct = prev !== 0 ? (dKwh / prev) * 100 : 0;
        const sign = Math.sign(dKwh);
        const arr  = sign > 0 ? "▲" : sign < 0 ? "▼" : "–";
        const color = sign > 0
            ? "text-red-600"
            : sign < 0
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-500";

        return {
            hasPrevYear: true,
            diffKwh_y: dKwh,
            diffPct_y: dPct,
            arrow_y: arr,
            trendColorClass_y: color,
        };
    }, [rawData]);
    
    // 전주 평균 대비 (요금)
    const {
        diffCost,        // prev - now
        diffCostPct,     // (prev - now) / prev * 100
        arrowCost,       // ▲ / ▼ / –
        trendColorCost   // 증가=red, 감소=blue, 동일=slate
    } = useMemo(() => {
        const now  = Number(rawData?.[0]?.now_usage_cost_total ?? 0);
        const prev = Number(rawData?.[0]?.pre_week_usage_cost_total ?? 0);

        const d = prev - now;
        const pct = prev !== 0 ? (d / prev) * 100 : 0;

        const sign = Math.sign(d);
        const arr  = sign > 0 ? "▲" : sign < 0 ? "▼" : "–";
        const color = sign > 0
            ? "text-red-600"
            : sign < 0
            ? "text-blue-600 dark:text-blue-400"
            : "text-slate-500";

        return { diffCost: d, diffCostPct: pct, arrowCost: arr, trendColorCost: color };
    }, [rawData]);

    // 작년 동일 대비 (요금) — null 안전 처리
    const {
        diffCost_y, diffCostPct_y, arrowCost_y, trendColorCost_y, hasPrevYearCost
    } = useMemo(() => {
        const prevRaw = rawData?.[0]?.pre_year_usage_cost_total;
        const hasPrev = prevRaw != null;

        if (!hasPrev) {
            return {
            hasPrevYearCost: false,
            diffCost_y: 0, diffCostPct_y: 0,
            arrowCost_y: "–",
            trendColorCost_y: "text-slate-500",
            };
        }

        const now  = Number(rawData?.[0]?.now_usage_cost_total ?? 0);
        const prev = Number(prevRaw);

        const d = prev - now;
        const pct = prev !== 0 ? (d / prev) * 100 : 0;

        const sign = Math.sign(d);
        const arr  = sign > 0 ? "▲" : sign < 0 ? "▼" : "–";
        const color = sign > 0
            ? "text-red-600"
            : sign < 0
            ? "text-blue-600 dark:text-blue-400"
            : "text-slate-500";

        return {
            hasPrevYearCost: true,
            diffCost_y: d, diffCostPct_y: pct,
            arrowCost_y: arr, trendColorCost_y: color,
        };
    }, [rawData]);

    // fmtSigned: 항상 부호(+/-) 표시 + 천단위 콤마 + 소수 자리 지정
    const fmtSigned = (v, digits = 0) => {
        const n = Number(v);
        const safe = Number.isFinite(n) ? n : 0;
        const value = Object.is(safe, -0) ? 0 : safe; // -0 방지

        try {
            // 최신 브라우저: signDisplay 지원
            return value.toLocaleString('ko-KR', {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
            signDisplay: 'always', // 항상 +/-
            });
        } catch {
            // 폴백: 구형 브라우저
            const sign = value >= 0 ? '+' : '-';
            const abs = Math.abs(value).toLocaleString('ko-KR', {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
            });
            return `${sign}${abs}`;
        }
    };


    // 막대바(당일/평균/최대) 값과 폭 계산
    const barStats = useMemo(() => {
        const todayVal = Number(rawData?.[0]?.now_usage_kwh ?? 0);
        const avgVal   = Number(rawData?.[0]?.pre_7day_usage_kwh_avg ?? 0);
        const maxVal   = Number(rawData?.[0]?.pre_7day_usage_kwh_max ?? 0);

        // 모두 0일 때 나눗셈 방지용 최소값 1
        const maxRange = Math.max(todayVal, avgVal, maxVal, 1);
        const toPct = (v) => Math.max(0, Math.min(100, (v / maxRange) * 100));

        return {
            today: { val: todayVal, w: toPct(todayVal) },
            avg:   { val: avgVal,   w: toPct(avgVal)   },
            max:   { val: maxVal,   w: toPct(maxVal)   },
        };
    }, [rawData]);
    // 요금 막대바(당일/평균/최대)
    const costBarStats = useMemo(() => {
        const today = Number(rawData?.[0]?.now_usage_cost_total ?? 0);
        const avg   = Number(rawData?.[0]?.pre_7day_usage_cost_total_avg ?? 0);
        const max   = Number(rawData?.[0]?.pre_7day_usage_cost_total_max ?? 0);

        const maxRange = Math.max(today, avg, max, 1);
        const toPct = (v) => Math.max(0, Math.min(100, (v / maxRange) * 100));

        return {
            today: { val: today, w: toPct(today) },
            avg:   { val: avg,   w: toPct(avg)   },
            max:   { val: max,   w: toPct(max)   },
        };
    }, [rawData]);
    // 검색 조건
    const address1 = "dashboard/processdashboard-r1";
    const address2 = "dashboard/processdashboard-r2";
    const address3 = "dashboard/processdashboard-r3";
    const address4 = "dashboard/processdashboard-r4";

    const [searchParams, setSearchParams] = useState({ 
        plantcode: "", 
        processcode: "",
        filter: "day"
    });
    // 검색조건 변경 즉시 반영
    const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams),[setSearchParams]);
    const searchinfo = useMemo(() => ({ 
        params: { 
            plantcode: searchParams.plantcode?.value ?? "", 
            processcode: searchParams.processcode?.value ?? "" } 
        }),
        [searchParams.plantcode, searchParams.processcode]
    );
    const searchinfo2 = useMemo(() => ({ 
        params: { 
            plantcode: searchParams.plantcode?.value ?? "", 
            processcode: searchParams.processcode?.value ?? "",
            filter: searchParams.filter ?? ""} 
        }),
        [searchParams.filter, searchParams]
    );

    const [dropdownData, setDropdownData] = useState({ 
        plantcode: { items: [], mappings: {} }, 
        processcode: { items: [], mappings: {} } 
    });
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [plantcodeRequired, processcodeRequired] = await Promise.all([
                    DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }),
                    DropDownItemGetter(apiUrl, { param1: "process", param2: "1000", param4: "X" }),
                ]);
                setDropdownData({
                    plantcode: { items: plantcodeRequired, mappings: CommonFunction.convertData(plantcodeRequired) },
                    processcode: { items: processcodeRequired, mappings: CommonFunction.convertData(processcodeRequired) },
                });
            } catch (error) {}
        };
        loadDropdownData();
    }, [apiUrl]);

    const do_search = async (apiUrl, searchinfo, address) => {
        try {
            if (!address) return;
            const accessToken = localStorage.getItem("token");
            const url = `${apiUrl}${address}`;
            const response = await axios.get(url, { params: searchinfo.params, headers: { Authorization: `Bearer ${accessToken}` } })
                .catch(err => {
                    if (err.response?.status === 403) toast.error("조회 권한이 없습니다.");
                    else console.error(err);
                });
            if (!response?.data) {
                console.error("No server response data");
                return;
            }
            const { jhedher, jbody } = response.data;
            if (jhedher?.status !== "S") {
                console.warn("The server returned an error response", jhedher);
                return;
            }

            return jbody;
        } catch (error) {
            console.error(error);
        }
    };

    // 수요전력, 누적 사용량(전력), 당일 전기사용량, 요금 조회
    const fetchAndSetData1 = async () => {
        const jbody = await do_search(apiUrl, searchinfo, address1);
        if (jbody && jbody.length > 0 ) setRawData(jbody);
    };
    // 전기 사용 현황 조회
    const fetchAndSetData2 = async () => {
        const jbody = await do_search(apiUrl, searchinfo2, address2);
        if (jbody && jbody.length > 0 ) {
            setRawData2(jbody);
            setChartData1(formatChartData(jbody));
        };
    };
    // 계측 데이터 추이 조회
    const fetchAndSetData3 = async () => {
        const jbody = await do_search(apiUrl, searchinfo, address3);
        if (jbody && jbody.length > 0 ) {
            setRawData3(jbody);
            setChartData2(formatChartData2(jbody));
        };
    };
    // 알람 이력 조회 (설계 미완 사용시 수정)
    const fetchAndSetData4 = async () => {
        const jbody = await do_search(apiUrl, searchinfo, address4);
        if (jbody && jbody.length > 0) setGridData(jbody);
    }
    // 그리드 컬럼 정의
    const columnDefs = useMemo(
        () => [
            {
                field: "insertdate",
                headerName: "발생 시각",
                editable: false,
                cellClass: "text-center",
                minWidth: 160,
                valueFormatter: params => {
                    const val = params.value;
                    if (!val) return "";
                    // 'T' 제거하고 밀리초 제거
                    return val.split(".")[0].replace("T", " ");
                },
            },
            {
                field: "alarmcode",
                headerName: "알람 내용",
                editable: false,
                cellClass: "text-center",
                minWidth: 160,
            },
            {
                field: "value",
                headerName: "계측값",
                editable: false,
                cellClass: "text-center",
                valueFormatter: params => {
                    const val = params.value;
                    if (val === null || val === undefined) return "";
                    // 'T' 제거하고 밀리초 제거
                    return val.toFixed(2);  // 모든 숫자는 2자리로 포맷
                },
            }
        ]
    )
    // 조회부 변경 시 조회
    useEffect(() => {
        if (searchinfo.params.plantcode == '' || searchinfo.params.processcode == '') return;
        fetchAndSetData1();
        fetchAndSetData2();
        fetchAndSetData3();
        fetchAndSetData4();
    }, [searchinfo]);

    // 라디오 버튼 조작시 재조회
    useEffect(() => {
        if (apiUrl) fetchAndSetData2();
    }, [searchParams.filter]);

    // 1분마다 fetchAndSetData1, 3
    useEffect(() => {
        if (!apiUrl) return;
        const interval1and3 = setInterval(() => {
            fetchAndSetData1();
            fetchAndSetData3();
            fetchAndSetData4();
        }, 1000 * 60 * 1); // 1분 간격
        return () => clearInterval(interval1and3);
    }, [apiUrl, searchinfo]);

    // 1시간마다 fetchAndSetData2 재조회
    useEffect(() => {
        if (!apiUrl) return;
        const interval2 = setInterval(fetchAndSetData2, 1000 * 60 * 60 * 1); // 1시간 간격
        return () => clearInterval(interval2);
    }, [apiUrl, searchinfo2]);

    return (
        <div className="space-y-3">
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
                                label="공정"
                                onChange={item => updateSearchParams("processcode", item)}
                                inputWidth="217px"
                                horizontal
                                dropDownData={dropdownData.processcode.items}
                                labelSpacing=""
                            />
                        </div>
                    </div>
                </div>
            </Card>
            <Card>
                <div className="mb-3 w-[100%] text-right">
                    <FullButton/>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-3 items-stretch">
                    <div className="w-full h-full bg-slate-200 rounded-xl dark:bg-slate-600 dark:text-white flex flex-col">
                        <h6 className="font-medium lg:text-xl text-slate-900 dark:text-white px-5 pt-4 pb-2">
                            {searchParams.processcode?.value == 'OP001' ? '전체 사용전력 대비 세척 공정 사용전력'
                            : searchParams.processcode?.value == 'OP002' ? '전체 사용전력 대비 가열로 공정 사용전력'
                            : searchParams.processcode?.value == 'OP003' ? '전체 사용전력 대비 템퍼링 공정 사용전력'
                            : searchParams.processcode?.value == 'OP004' ? '전체 사용전력 대비 컴프레샤 공정 사용전력'
                            : '전체 사용전력 대비 공정 별 사용전력'}
                        </h6>
                        <div className="flex-1 px-5 pb-4 flex items-center">
                            <div className="w-full flex flex-col items-center gap-4 text-[0.8vw]">
                                <div className="w-full flex justify-center">
                                    <div className="shrink-0">
                                        <GaugeChart
                                            nrOfLevels={420}
                                            arcsLength={[0.45, 0.45, 0.1]}
                                            colors={["#5BE12C", "#F5CD19", "#EA4228"]}
                                            percent={
                                                rawData[0]?.main_kw_total && rawData[0]?.process_kw_total
                                                ? rawData[0]?.process_kw_total / rawData[0]?.main_kw_total
                                                : 0
                                            }
                                            textColor={isDark ? "#cbd5e1" : "#0f172a"}
                                            arcPadding={0.02}
                                        />
                                    </div>
                                </div>
                                <div className="w-full max-w-[260px] space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>전체 :</div>
                                        <div className="font-semibold">
                                            {rawData[0]?.main_kw_total ? rawData[0].main_kw_total.toFixed(2) : 0} kW
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <div>설비 :</div>
                                        <div className="font-semibold">
                                            {rawData[0]?.process_kw_total ? rawData[0].process_kw_total.toFixed(2) : 0} kW
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-full bg-slate-200 rounded-xl dark:bg-slate-600 dark:text-white flex flex-col">
                        <h6 className="font-medium lg:text-xl text-slate-900 dark:text-white px-5 pt-4 pb-2">
                            전력 사용량 대비 부하요금
                        </h6>
                        <div className="flex-1 grid grid-rows-3 px-5 pb-4">
                            <div className="flex items-center justify-between py-3 text-[0.8vw]">
                                <div>{yearLabel}</div>
                                <div className="font-semibold">
                                    <div>{rawData[0]?.now_year_usage_kwh ? Number(rawData[0].now_year_usage_kwh.toFixed(2)).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 0} kWh</div>
                                    <div>
                                        / {rawData[0]?.now_year_usage_cost_total
                                            ? toThousandWon(rawData[0].now_year_usage_cost_total)
                                            : '0'
                                        } 천원
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-3 text-[0.8vw]">
                                <div>{monthLabel}</div>
                                <div className="font-semibold">
                                    <div>{rawData[0]?.now_month_usage_kwh ? Number(rawData[0].now_month_usage_kwh.toFixed(2)).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 0} kWh</div>
                                    <div>
                                        / {rawData[0]?.now_month_usage_cost_total
                                            ? toThousandWon(rawData[0].now_month_usage_cost_total)
                                            : '0'
                                        } 천원
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-3 text-[0.8vw]">
                                <div>{prevMonthLabel}</div>
                                <div className="font-semibold">
                                    <div>{rawData[0]?.pre_month_usage_kwh ? Number(rawData[0].pre_month_usage_kwh.toFixed(2)).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 0} kWh</div>
                                    <div>
                                        / {rawData[0]?.pre_month_cost_total
                                            ? toThousandWon(rawData[0].pre_month_cost_total)
                                            : '0'
                                        } 천원
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-full bg-slate-200 rounded-xl dark:bg-slate-600 dark:text-white flex flex-col">
                        <div className="font-medium lg:text-xl text-slate-900 dark:text-white px-5 pt-4 pb-2 flex items-center justify-between">
                            <div>당일 전기 사용량</div>
                            <div>
                                {rawData[0]?.now_usage_kwh != null
                                    ? Number(rawData[0].now_usage_kwh).toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : (0).toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                } kWh
                            </div>
                        </div>
                        <div className="grid grid-rows-2 px-5 pb-2 gap-y-1 mt-4">
                            <div className="flex items-center justify-between text-[0.8vw] py-1 leading-tight">
                                <div>전주 평균 대비</div>
                                <div className={`font-semibold flex items-center gap-2 ${trendColorClass}`}>
                                    <span>{fmtSigned(diffKwh, 0)} kWh</span>
                                    <span>{fmtSigned(diffPct, 0)}%</span>
                                    <span aria-hidden>{arrow}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[0.8vw] py-1 leading-tight">
                            <div>작년 동일 대비</div>
                                {hasPrevYear ? (
                                    <div className={`font-semibold flex items-center gap-2 ${trendColorClass_y}`}>
                                        <span>{fmtSigned(diffKwh_y, 0)} kWh</span>
                                        <span>{fmtSigned(diffPct_y, 0)}%</span>
                                        <span aria-hidden>{arrow_y}</span>
                                    </div>
                                ) : (
                                    <div className="font-semibold text-slate-500 dark:text-slate-400">---</div>
                                )}
                            </div>
                        </div>
                        <div className="px-5 pb-4 pt-0">
                            <div className="space-y-2">
                                {/* 당일 */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 text-[0.8vw] shrink-0">당일</div>
                                    <div className={`${barW} h-4 rounded-full overflow-hidden bg-slate-300/60 dark:bg-slate-700`}>
                                        <div
                                            className="h-full bg-green-500"
                                            style={{ width: `${barStats.today.w}%` }}
                                            title={`${barStats.today.val.toFixed(0)} kWh`}
                                        />
                                    </div>
                                    <div className="min-w-[7.5rem] text-right text-[0.8vw] whitespace-nowrap shrink-0">
                                        {Number(barStats.today.val.toFixed(0)).toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh
                                    </div>
                                </div>

                                {/* 평균(최근 7일 평균) */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 text-[0.8vw] shrink-0">평균</div>
                                    <div className={`${barW} h-4 rounded-full overflow-hidden bg-slate-300/60 dark:bg-slate-700`}>
                                        <div
                                            className="h-full bg-yellow-500"
                                            style={{ width: `${barStats.avg.w}%` }}
                                            title={`${barStats.avg.val.toFixed(0)} kWh`}
                                        />
                                    </div>
                                    <div className="min-w-[7.5rem] text-right text-[0.8vw] whitespace-nowrap shrink-0">
                                        {Number(barStats.avg.val.toFixed(0)).toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh
                                    </div>
                                </div>

                                {/* 최대(최근 7일 최대) */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 text-[0.8vw] shrink-0">최대</div>
                                    <div className={`${barW} h-4 rounded-full overflow-hidden bg-slate-300/60 dark:bg-slate-700`}>
                                        <div
                                            className="h-full bg-red-500"
                                            style={{ width: `${barStats.max.w}%` }}
                                            title={`${barStats.max.val.toFixed(0)} kWh`}
                                        />
                                    </div>
                                    <div className="min-w-[7.5rem] text-right text-[0.8vw] whitespace-nowrap shrink-0">
                                        {Number(barStats.max.val.toFixed(0)).toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-full bg-slate-200 rounded-xl dark:bg-slate-600 dark:text-white flex flex-col">
                        <div className="font-medium lg:text-xl text-slate-900 dark:text-white px-5 pt-4 pb-2 flex items-center justify-between">
                            <div>당일 전기 사용 요금</div>
                            <div>
                                {rawData[0]?.now_usage_cost_total != null
                                    ? toThousandWon(rawData[0].now_usage_cost_total)
                                    : '0'
                                } 천원
                            </div>

                        </div>

                        {/* 비교(요금 전용) */}
                        <div className="grid grid-rows-2 px-5 pb-2 gap-y-1 mt-4">
                            <div className="flex items-center justify-between text-[0.8vw] py-1 leading-tight">
                                <div>전주 평균 대비</div>
                                <div className={`font-semibold flex items-center gap-2 ${trendColorCost}`}>
                                <span>{fmtSignedThousandWon(diffCost)} 천원</span>
                                <span>{fmtSigned(diffCostPct, 0)}%</span>
                                <span aria-hidden>{arrowCost}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[0.8vw] py-1 leading-tight">
                                <div>작년 동일 대비</div>
                                {hasPrevYearCost ? (
                                <div className={`font-semibold flex items-center gap-2 ${trendColorCost_y}`}>
                                    <span>{fmtSignedThousandWon(diffCost_y)} 천원</span>
                                    <span>{fmtSigned(diffCostPct_y, 0)}%</span>
                                    <span aria-hidden>{arrowCost_y}</span>
                                </div>
                                ) : (
                                <div className="font-semibold text-slate-500 dark:text-slate-400">---</div>
                                )}
                            </div>
                        </div>

                        {/* 막대(요금 전용) */}
                        <div className="px-5 pb-4 pt-0">
                            <div className="space-y-2">
                                {/* 당일 */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 text-[0.8vw] shrink-0">당일</div>
                                    <div className={`${barW} h-4 rounded-full overflow-hidden bg-slate-300/60 dark:bg-slate-700`}>
                                        <div
                                            className="h-full bg-green-500"
                                            style={{ width: `${costBarStats.today.w}%` }}
                                            title={`${toThousandWon(costBarStats.today.val)} 천원`}
                                        />
                                    </div>
                                    <div className="min-w-[7.5rem] text-right text-[0.8vw] whitespace-nowrap shrink-0">{toThousandWon(costBarStats.today.val)} 천원</div>
                                </div>

                                {/* 평균 */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 text-[0.8vw] shrink-0">평균</div>
                                    <div className={`${barW} h-4 rounded-full overflow-hidden bg-slate-300/60 dark:bg-slate-700`}>
                                        <div
                                            className="h-full bg-yellow-500"
                                            style={{ width: `${costBarStats.avg.w}%` }}
                                            title={`${toThousandWon(costBarStats.avg.val)} 천원`}
                                        />
                                    </div>
                                    <div className="min-w-[7.5rem] text-right text-[0.8vw] whitespace-nowrap shrink-0">{toThousandWon(costBarStats.avg.val)} 천원</div>
                                </div>

                                {/* 최대 */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 text-[0.8vw] shrink-0">최대</div>
                                    <div className={`${barW} h-4 rounded-full overflow-hidden bg-slate-300/60 dark:bg-slate-700`}>
                                        <div
                                            className="h-full bg-red-500"
                                            style={{ width: `${costBarStats.max.w}%` }}
                                            title={`${toThousandWon(costBarStats.max.val)} 천원`}
                                        />
                                    </div>
                                    <div className="min-w-[7.5rem] text-right text-[0.8vw] whitespace-nowrap shrink-0">{toThousandWon(costBarStats.max.val)} 천원</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 mt-3 items-stretch">
                    <div className="font-medium lg:text-xl text-slate-900 dark:text-white px-5 pt-4 pb-2 flex items-center justify-between">
                        <div>전력 사용 현황</div>
                        <Auto_Radio_DayMonth
                            useValue={searchParams.filter}
                            setUseValue={(value) => updateSearchParams("filter", value)}
                        />
                    </div>
                    <MixedChart data={chartData1} height={300} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-3 items-stretch">
                    <div className="w-3/4 mx-auto lg:w-full lg:col-span-3 h-full dark:text-white flex flex-col">
                        <div className="font-medium lg:text-xl text-slate-900 dark:text-white px-5 pt-4 pb-2 flex items-center justify-between">
                            <div>계측 데이터 추이</div>
                        </div>
                        <MixedChart data={chartData2} height={300} />
                    </div>
                    <div className="w-1/4 mx-auto lg:w-full lg:col-span-1 h-full bg-slate-200 rounded-xl dark:bg-slate-600 dark:text-white flex flex-col">
                        <h6 className="font-medium lg:text-xl text-slate-900 dark:text-white px-5 pt-4 pb-2">
                            알람 이력
                        </h6>
                        <Auto_AgGrid
                            gridType="sender"
                            gridData={gridData}
                            columnDefs={columnDefs}
                            height={330}
                        />
                    </div>
                </div>
            </Card>
        </div>
    )
};

export default ProcessDashboard;
