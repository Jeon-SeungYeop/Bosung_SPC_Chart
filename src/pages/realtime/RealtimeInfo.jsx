import {
  Auto_LabelPopup_Set, CommonFunction, Auto_Popup_CodeName, Auto_GridCellButtonRenderer,
  Auto_AgGrid, TitleBar, Auto_SearchDropDown, DropDownItemGetter,
  Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid,
  Auto_Spliter, Auto_Label_Text_Set, Auto_Radio_Useflag, Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid, Auto_Button_Column_State,
  Auto_DateTimePickerF_T
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import MixedChart from "@/components/partials/widget/chart/Mixed";
import axios from "axios";
import FullButton from "@/components/autocomponent/areaGrid/Auto_Button_FullScreen";

const RealtimeInfo = () => {
    const apiUrl = useApiUrl();  // Backend 접속 정보
    const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false); // 조회 변수
    // 전력 현황 변수
    const [goalpeakpower, setGoalpeakpower] = useState("");
    const [actualusingpower, setActualusingpower] = useState("");
    const [controlevalustandard, setControlevalustandard] = useState("");
    const [powerarea, setPowerarea] = useState();
    const [stable, setStable] = useState();
    const [warning, setWarning] = useState();
    const [limit, setLimit]= useState();
    const address1 = "realtime/realtimeinfo-r1";    // 전력 현황 주소
    const address2 = "realtime/realtimeinfo-r2";    // 실시간 전력 현황 차트 주소
    const address3 = "realtime/realtimeinfo-r3";    // 당월 전력 현황 차트 주소
    const address4 = "realtime/realtimeinfo-r4";    // 설비 별 현황 주소(가열로)
    const address5 = "realtime/realtimeinfo-r5";    // 설비 별 현황 주소(템퍼링)
    const address6 = "realtime/realtimeinfo-r6";    // 설비 별 현황 주소(컴프레샤)
    const address7 = "realtime/realtimeinfo-r7";    // 설비 별 현황 주소(세척기)

    // 가열로 변수
    const [heaters, setHeaters] = useState([]);
    // 템퍼링 변수
    const [temperings, setTemperings] = useState([]);
    // 컴프레샤 변수
    const [compressors, setCompressor] = useState([]);
    // 세척기 변수
    const [cleandry, setCleandry] = useState([]);

    // 디폴트 차트값(실시간 전력현황)
    const [chartData1, setChartData1] = useState({ label: "load-ratio", labels: [], datas: [] });
    // 디폴트 차트값(당월 전력현황)
    const [chartData2, setChartData2] = useState({ label: "load-ratio", labels: [], datas: [] });

    // 차트 날짜 변환
    const formatDateLabel = (isoString, condition) => {
        const d = new Date(isoString);
        const yyyy = d.getFullYear();
        const MM   = String(d.getMonth() + 1).padStart(2, '0');
        const dd   = String(d.getDate()).padStart(2, '0');
        const hh   = String(d.getHours()).padStart(2, '0');
        const mm   = String(d.getMinutes()).padStart(2, '0');
        if (condition == "now"){
            return `${hh}:${mm}`;
        }
        else {
            return `${MM}-${dd} ${hh}`;
        }
        
    };
    // 차트데이터 변환
    const formatChartData = (rawData, condition) => {
        const labels = rawData.map(item => formatDateLabel(item.insertdate, condition));
        const kw_total = rawData.map(item => item.kw_total);
        const demand_kw_total_prediction = rawData.map(item => item.demand_kw_total_prediction);
        const stableLine  = rawData.map(() => stable);
        const warningLine = rawData.map(() => warning);
        const limitLine   = rawData.map(() => limit);
        return {
            label: "RealtimeInfo",
            labels,
            datas: [
                { name: "유효전력", type: "line", data: kw_total },
                { name: "예측전력", type: "line", data: demand_kw_total_prediction },
                { name: "Stable", type: "line", data: stableLine },
                { name: "Warning", type: "line", data: warningLine },
                { name: "Limit", type: "line", data: limitLine },
            ]
        };
    };

    const [searchParams, setSearchParams] = useState({ 
        plantcode: "", 
        sitecode: "" 
    });
    // 검색조건 변경 즉시 반영
    const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams),[setSearchParams]);
    const searchinfo = useMemo(() => ({ 
        params: { 
            plantcode: searchParams.plantcode?.value ?? "", 
            sitecode: searchParams.sitecode?.value ?? "" } 
        }),
        [searchParams]
    );

    const [dropdownData, setDropdownData] = useState({ 
        plantcode: { items: [], mappings: {} }, 
        sitecode: { items: [], mappings: {} } 
    });
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [plantcodeRequired, sitecodeRequired] = await Promise.all([
                    DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "plantcode", param4: "X" }),
                    DropDownItemGetter(apiUrl, { param1: "common", param2: "1000", param3: "sitecode", param4: "X" }),
                ]);
                setDropdownData({
                    plantcode: { items: plantcodeRequired, mappings: CommonFunction.convertData(plantcodeRequired) },
                    sitecode: { items: sitecodeRequired, mappings: CommonFunction.convertData(sitecodeRequired) },
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
    // 피크목표전력
    const fetchAndSetData1 = async () => {
        const jbody = await do_search(apiUrl, searchinfo, address1);
        if (jbody && jbody.length > 0) {
            const { goalpeakpower, actualusingpower, controlevalustandard, powerarea, stablearea, warningarea, limitarea } = jbody[0];
            setGoalpeakpower(goalpeakpower.toString());
            setActualusingpower(actualusingpower.toString());
            setControlevalustandard(controlevalustandard);
            setPowerarea(Number(powerarea));
            setStable(Number(stablearea));
            setWarning(Number(warningarea));
            setLimit(Number(limitarea));
        }
    };
    // 실시간 전력현황
    const fetchAndSetData2 = async () => {
        const jbody = await do_search(apiUrl, searchinfo, address2);
        if (jbody && jbody.length > 0) setChartData1(formatChartData(jbody, "now"));
    };
    // 당월 전력현황
    const fetchAndSetData3 = async () => {
        const jbody = await do_search(apiUrl, searchinfo, address3);
        if (jbody && jbody.length > 0) setChartData2(formatChartData(jbody, "month"));
    };
    // 가열로 searchinfo
    const h_searchinfo = useMemo(() => ({ 
        params: { 
            plantcode: searchParams.plantcode?.value ?? "", 
            sitecode: searchParams.sitecode?.value ?? "",
            filter: "heat"},
        }),
        [searchParams]
    );
    // 템퍼링 searchinfo
    const t_searchinfo = useMemo(() => ({ 
        params: { 
            plantcode: searchParams.plantcode?.value ?? "", 
            sitecode: searchParams.sitecode?.value ?? "",
            filter: "temp"},
        }),
        [searchParams]
    );
    // 컴프레샤 searchinfo
    const c_searchinfo = useMemo(() => ({ 
        params: { 
            plantcode: searchParams.plantcode?.value ?? "", 
            sitecode: searchParams.sitecode?.value ?? "",
            filter: "comp"},
        }),
        [searchParams]
    );
    // 세척기 searchinfo
    const cl_searchinfo = useMemo(() => ({ 
        params: { 
            plantcode: searchParams.plantcode?.value ?? "", 
            sitecode: searchParams.sitecode?.value ?? "",
            filter: "clean"},
        }),
        [searchParams]
    );

    // 설비별 현황(가열로)
    const fetchAndSetData4 = async () => {
        const jbody = await do_search(apiUrl, h_searchinfo, address4);
        if (jbody && jbody.length > 0) {
            setHeaters(jbody);
        }
    };
    // 설비별 현황(템퍼링)
    const fetchAndSetData5 = async () => {
        const jbody = await do_search(apiUrl, t_searchinfo, address4)
        if (jbody && jbody.length > 0) {
            setTemperings(jbody);
        }
    };
    // 설비별 현황(컴프레샤)
    const fetchAndSetData6 = async () => {        
        const jbody = await do_search(apiUrl, c_searchinfo, address4)
        if (jbody && jbody.length >0) {
            setCompressor(jbody);
        }
    }
    // 설비별 현황(세척기)
    const fetchAndSetData7 = async () => {
        const jbody = await do_search(apiUrl, cl_searchinfo, address4)
        if (jbody && jbody.length > 0 ) {
            setCleandry(jbody);
        }
    }


    // ----------------------------------------조회부 변경, 시간 별 데이터 조회 부분--------------------------------------------------------
    // 조회부 변경 시 조회
    useEffect(() => {
        if (searchinfo.params.plantcode == '' || searchinfo.params.sitecode == '') return;
        fetchAndSetData1();
        fetchAndSetData2();
        fetchAndSetData3();
        fetchAndSetData4();
        fetchAndSetData5();
        fetchAndSetData6();
        fetchAndSetData7();
    }, [apiUrl, searchinfo]);

    // 차트 구간값 설정을 위한 부분
    useEffect(() => {
        if (searchinfo.params.plantcode == '' || searchinfo.params.sitecode == '') return;
        if (stable !== undefined && warning !== undefined && limit !== undefined) {
            fetchAndSetData2();
            fetchAndSetData3();
        }
    }, [stable, warning, limit, searchinfo]);

    // 1분마다 피크목표전력, 실시간 전력현황 조회
    useEffect(() => {
        if (searchinfo.params.plantcode == '' || searchinfo.params.sitecode == '') return;
        const interval = setInterval(() => { 
            fetchAndSetData1(); 
            fetchAndSetData2(); 
        }, 60000);
        return () => clearInterval(interval);
    }, [apiUrl, searchinfo, stable, warning, limit, searchinfo]);

    // 10초마다 설비별 전력 현황 조회
    useEffect(() => {
        if (searchinfo.params.plantcode == '' || searchinfo.params.sitecode == '') return;
        const interval = setInterval(() => {
            fetchAndSetData4();
            fetchAndSetData5();
            fetchAndSetData6();
            fetchAndSetData7();
        }, 10000);
        return () => clearInterval(interval);
    }, [apiUrl, searchinfo]);
    // --------------------------------------------------------------------------------------------------------------------------------------

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
                                label="동"
                                id="sitecode"
                                onChange={item => updateSearchParams("sitecode", item)}
                                inputWidth="217px"
                                horizontal
                                dropDownData={dropdownData.sitecode.items}
                                labelSpacing=""
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-end h-full">
                        <FullButton/>
                    </div>
                </div>
            </Card>
            <Card noborder>
                <div className="flex flex-wrap items-center justify-between mt-3">
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4">
                        <div className="w-full bg-slate-200 p-3 flex justify-between items-center text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">피크 목표 전력</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">
                                {goalpeakpower} kWH
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4">
                        <div className="w-full bg-slate-200 p-3 flex justify-between items-center text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">현재전력</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">
                                {actualusingpower ? parseFloat(actualusingpower).toFixed(2) : ""}kWh
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4">
                        <div className="w-full bg-slate-200 p-3 flex justify-between items-center text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">제어 기준</div>
                            <div className="font-semibold mr-3 mt-2 mb-2">
                                {controlevalustandard === "C" ? "유효전력" : "예측전력"}
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-[25%] sm:w-full lg:pr-4">
                        <div className="w-full bg-slate-200 p-3 flex justify-between items-center text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
                            <div className="ml-3 mt-2 mb-2">현재 구간</div>
                            <div className={`font-semibold mr-3 mt-2 mb-2 ${powerarea === 50 ? 'text-red-800' : powerarea === 40 ? 'text-red-500' : powerarea === 30 ? 'text-orange-300' : powerarea === 20 ? 'text-green-500' : ''}`}>
                                {powerarea === 10 ? '일반' : powerarea === 20 ? '안정' : powerarea === 30 ? '경고' : powerarea === 40 ? '제어' : '초과'}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
            <Card noborder>
                실시간 전력 현황
                <MixedChart data={chartData1} height={350}/>
            </Card>
            <Card noborder>
                최근 30일 전력 현황
                <MixedChart data={chartData2} height={350}/>
            </Card>
            {(searchParams.plantcode?.value === '1000' && searchParams.sitecode?.value === 'B') && (
                <Card noborder>
                    <div className="w-full grid grid-cols-8 space-x-4">
                        <div className="col-span-6 space-y-6">
                            <div className="flex grid grid-cols-6 space-x-4">
                                {heaters.map((eq) => (
                                    <div key={eq.equipmentid} className="col-span-1 border border-[#181d26] dark:border-[#FFFFFF] p-3 rounded-xl">
                                        <div className="text-2xl font-semibold mb-2">{eq.equipmentname}</div>
                                        <div className="text-xl">상태 : <span className={`${eq.h_runstopstatus == '10' ? 'text-green-400' : ''}`}>{eq.h_runstopstatus == 10 ? "승온" : 
                                                                                                                                                eq.h_runstopstatus == 20 ? "예열" :
                                                                                                                                                eq.h_runstopstatus == 30 ? "침탄" :
                                                                                                                                                eq.h_runstopstatus == 40 ? "확산" :
                                                                                                                                                eq.h_runstopstatus == 50 ? "강온" : 
                                                                                                                                                eq.h_runstopstatus == 60 ? "소입" : "종료"}</span></div>
                                        <div className="text-xl">현재 전류 : {eq.kw_total?.toFixed(2) ?? ""}</div>
                                        <div className="text-xl">제어 오차 범위 : {eq.temperatureholdrange}</div>
                                        <div className="text-xl">침탄 온도 : {eq.carburtemppv}</div>
                                        <div className="text-xl">유조 온도 : {eq.bathtemppv}</div>
                                        <div className="text-xl">카본 농도 : {eq.carboncppv?.toFixed(2) ?? ""}</div>
                                        <div className="text-xl">SCR 신호 : <span className={`${eq.scrcontrolstatus == true ? 'text-green-400' : 'text-red-400'}`}>{eq.scrcontrolstatus == true ? "ON" : "OFF"}</span></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex grid grid-cols-6 space-x-4">
                                {temperings.map((eq) => (
                                    <div key={eq.equipmentid} className="col-span-1 border border-[#181d26] dark:border-[#FFFFFF] text-xl p-3 rounded-xl">
                                        <div className="text-2xl font-semibold mb-2">{eq.equipmentname}</div>
                                        <div className="text-xl">상태 : <span className={`${eq.runstopstatus == '10' ? 'text-green-400' : ''}`}>{eq.runstopstatus == true ? "ON" : "OFF"}</span></div>
                                        <div className="text-xl">현재 전류 : {eq.kw_total?.toFixed(2) ?? ""}</div>
                                        <div className="text-xl">현재 온도 : {eq.soaktemppv}</div>
                                    </div>
                                ))}
                                {compressors.map((eq => (
                                    <div key={eq.equipmentid} className="col-span-1 border border-[#181d26] dark:border-[#FFFFFF] text-xl p-3 rounded-xl">
                                        <div className="text-2xl font-semibold mb-2">{eq.equipmentname}</div>
                                        <div className="text-xl">상태 : <span className={`${eq.runstopstatus == '10' ? 'text-green-400' : ''}`}>{eq.runstopstatus == true ? "ON" : "OFF"}</span></div>
                                        <div className="text-xl">현재 전류 : {eq.kw_total?.toFixed(2) ?? ""}</div>
                                    </div>
                                )))}
                            </div>
                        </div>
                        <div className="col-span-2 space-y-6">
                            <div className="flex grid grid-cols-2 space-x-4 h-full">
                                {cleandry.map((eq => (
                                    <div key={eq.equipmentid} className="col-span-1 h-full border border-[#181d26] dark:border-[#FFFFFF] text-xl p-3 rounded-xl">
                                        <div className="text-2xl font-semibold">{eq.equipmentname}</div>
                                        <div className="text-xl">상태 : <span className={`${eq.washrunstate == '10' ? 'text-green-400' : ''}`}>{eq.washrunstate == true ? "ON" : "OFF"}</span></div>
                                        <div className="text-xl mb-24">현재 전류 : {eq.kw_total?.toFixed(2) ?? ""}</div>

                                        <div className="text-2xl text-blue-500">온도</div>
                                        <div className="text-xl">제어 오차범위 : {eq.temperatureholdrange}</div>
                                        <div className="text-xl">냉각수 입구 : {eq.coolingintemp}</div>
                                        <div className="text-xl">냉각수 출구 : {eq.coolingouttemp}</div>
                                        <div className="text-xl">세척 공간 : {eq.washroomtemp}</div>
                                        <div className="text-xl">보관실 공간 : {eq.storageroomtemp}</div>
                                        <div className="text-xl">재생실 공간 : {eq.regeneratortemp}</div>
                                    </div>
                                )))}
                            </div>
                        </div>
                    </div>
                </Card>
            )}
            
        </div>
    );
};

export default RealtimeInfo;