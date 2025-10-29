import {
  Auto_LabelPopup_Set, CommonFunction, Auto_Popup_CodeName, Auto_GridCellButtonRenderer,
  Auto_AgGrid, TitleBar, Auto_SearchDropDown, DropDownItemGetter,
  Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid,
  Auto_Spliter, Auto_Label_Text_Set, Auto_Radio_Useflag, Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid, Auto_Button_Column_State,
  Auto_DateTimePickerF_T
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import MixedChart from "@/components/partials/widget/chart/Mixed";
import axios from "axios";
import FullButton from "@/components/autocomponent/areaGrid/Auto_Button_FullScreen";

const TemperatureStatus_F1 = () => {
    const apiUrl = useApiUrl();  // Backend 접속 정보
    // DB에서 받아온 Data 공정별 Array
    const [heatArray, setHeatArray] = useState([]);
    const [tempArray, setTempArray] = useState([]);
    const [cleanArray, setCleanArray] = useState([]);
    // 공정별 Array의 동별 Array
    const [heatArray_A, setHeatArray_A] = useState([]);
    const [heatArray_B, setHeatArray_B] = useState([]);
    const [heatArray_C, setHeatArray_C] = useState([]);
    const [tempArray_A, setTempArray_A] = useState([]);
    const [tempArray_B, setTempArray_B] = useState([]);
    const [tempArray_C, setTempArray_C] = useState([]);
    const [cleanArray_A, setCleanArray_A] = useState([]);
    const [cleanArray_B, setCleanArray_B] = useState([]);
    const [cleanArray_C, setCleanArray_C] = useState([]);
    const searchAddress = "monitoring/temperaturestatus_f1-r";
    const searchinfo = {
        params: {
            plantcode: "1000",
        }
    };
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
    const fetchAndSetData = useCallback(async () => {
        const rawData = await do_search(apiUrl, searchinfo, searchAddress);
        if (rawData) {
            // heatArray 설정 및 sitecode별 분류
            if (rawData.heatArray?.jbody && Array.isArray(rawData.heatArray.jbody)) {
                const heatData = rawData.heatArray.jbody;
                setHeatArray(heatData);
                
                // sitecode별로 분류
                const heatA = heatData.filter(item => item.sitecode === 'A');
                const heatB = heatData.filter(item => item.sitecode === 'B');
                const heatC = heatData.filter(item => item.sitecode === 'C');
                
                setHeatArray_A(heatA);
                setHeatArray_B(heatB);
                setHeatArray_C(heatC);
                
            } else {
                setHeatArray([]);
                setHeatArray_A([]);
                setHeatArray_B([]);
                setHeatArray_C([]);
            }

            // tempArray 설정 및 sitecode별 분류
            if (rawData.tempArray?.jbody && Array.isArray(rawData.tempArray.jbody)) {
                const tempData = rawData.tempArray.jbody;
                setTempArray(tempData);
                
                // sitecode별로 분류
                const tempA = tempData.filter(item => item.sitecode === 'A');
                const tempB = tempData.filter(item => item.sitecode === 'B');
                const tempC = tempData.filter(item => item.sitecode === 'C');
                
                setTempArray_A(tempA);
                setTempArray_B(tempB);
                setTempArray_C(tempC);
                
            } else {
                setTempArray([]);
                setTempArray_A([]);
                setTempArray_B([]);
                setTempArray_C([]);
            }

            // cleanArray 설정 및 sitecode별 분류
            if (rawData.cleanArray?.jbody && Array.isArray(rawData.cleanArray.jbody)) {
                const cleanData = rawData.cleanArray.jbody;
                setCleanArray(cleanData);
                
                // sitecode별로 분류
                const cleanA = cleanData.filter(item => item.sitecode === 'A');
                const cleanB = cleanData.filter(item => item.sitecode === 'B');
                const cleanC = cleanData.filter(item => item.sitecode === 'C');
                
                setCleanArray_A(cleanA);
                setCleanArray_B(cleanB);
                setCleanArray_C(cleanC);
                
            } else {
                setCleanArray([]);
                setCleanArray_A([]);
                setCleanArray_B([]);
                setCleanArray_C([]);
            }
        } else {
            setHeatArray([]);
            setHeatArray_A([]);
            setHeatArray_B([]);
            setHeatArray_C([]);
            setTempArray([]);
            setTempArray_A([]);
            setTempArray_B([]);
            setTempArray_C([]);
            setCleanArray([]);
            setCleanArray_A([]);
            setCleanArray_B([]);
            setCleanArray_C([]);
        }
    }, [apiUrl]);

    // 컴포넌트 마운트 시 최초 데이터 로드
    useEffect(() => {
        fetchAndSetData();
    }, [fetchAndSetData]);

    // 10초마다 데이터 갱신
    useEffect(() => {
        const interval = setInterval(() => {
            fetchAndSetData();
        }, 10000);

        return () => {
            clearInterval(interval);
        };
    }, [fetchAndSetData]);
    // 차트데이터로 변환 - 가열로
    const formatChartData = (data) => {
        const labels = data.map((_, idx) => (idx+1).toString());
        const carburtemppv_Data = data.map(item => item.carburtemppv);
        const battemppv_Data = data.map(item => item.bathtemppv);

        return {
            label: "TemperatureStatus",
            labels: labels,
            datas: [
                { name: "침탄", type: "line", data: carburtemppv_Data },
                { name: "유조", type: "line", data: battemppv_Data },
            ]
        };
    };
    // 차트데이터로 변환 - 템퍼링
    const formatChartData_t = (data) => {
        const labels = data.map((_, idx) => (idx+1).toString());
        const soaktemppv_Data = data.map(item => item.soaktemppv);

        return {
            label: "TemperatureStatus",
            labels: labels,
            datas: [
                { name: "소려", type: "line", data: soaktemppv_Data },
            ]
        };
    };
    // 차트데이터로 변환 - 세척기
    const formatChartData_c = (data) => {
        const labels = data.map((_, idx) => (idx+1).toString());
        const wash_Data = data.map(item => item.washroomtemp);
        const storage_Data = data.map(item => item.storageroomtemp);
        const regenerator_Data = data.map(item => item.regeneratortemp);

        return {
            label: "TemperatureStatus",
            labels: labels,
            datas: [
                { name: "세척실", type: "line", data: wash_Data },
                { name: "보관실", type: "line", data: storage_Data },
                { name: "재생기", type: "line", data: regenerator_Data },
            ]
        };
    };
    return (
        <div className="space-y-5">
            <Card noborder>
                <h3 className="font-medium lg:text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">A동</h3>
                <div className="flex flex-wrap items-center justify-between">
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((heatArray_A.filter(item => item.equipmentid === 'EQU0018'))[59])?.equipmentname ? ((heatArray_A.filter(item => item.equipmentid === 'EQU0018'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">침탄/소열 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_A.filter(item => item.equipmentid === 'EQU0018'))[59])?.carburtemppv ? ((heatArray_A.filter(item => item.equipmentid === 'EQU0018'))[59])?.carburtemppv : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">유조 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_A.filter(item => item.equipmentid === 'EQU0018'))[59])?.bathtemppv ? ((heatArray_A.filter(item => item.equipmentid === 'EQU0018'))[59])?.bathtemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData((heatArray_A.filter(item => item.equipmentid === 'EQU0018')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((heatArray_A.filter(item => item.equipmentid === 'EQU0021'))[59])?.equipmentname ? ((heatArray_A.filter(item => item.equipmentid === 'EQU0021'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">침탄/소열 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_A.filter(item => item.equipmentid === 'EQU0021'))[59])?.carburtemppv ? ((heatArray_A.filter(item => item.equipmentid === 'EQU0021'))[59])?.carburtemppv : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">유조 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_A.filter(item => item.equipmentid === 'EQU0021'))[59])?.bathtemppv ? ((heatArray_A.filter(item => item.equipmentid === 'EQU0021'))[59])?.bathtemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData((heatArray_A.filter(item => item.equipmentid === 'EQU0021')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((tempArray_A.filter(item => item.equipmentid === 'EQU0031'))[59])?.equipmentname ? ((tempArray_A.filter(item => item.equipmentid === 'EQU0031'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">소려 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((tempArray_A.filter(item => item.equipmentid === 'EQU0031'))[59])?.soaktemppv ? ((tempArray_A.filter(item => item.equipmentid === 'EQU0031'))[59])?.soaktemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData_t((tempArray_A.filter(item => item.equipmentid === 'EQU0031')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((cleanArray_A.filter(item => item.equipmentid === 'EQU0013'))[59])?.equipmentname ? ((cleanArray_A.filter(item => item.equipmentid === 'EQU0013'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">세척실</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((cleanArray_A.filter(item => item.equipmentid === 'EQU0013'))[59])?.washroomtemp ? ((cleanArray_A.filter(item => item.equipmentid === 'EQU0013'))[59])?.washroomtemp : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">보관실</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((cleanArray_A.filter(item => item.equipmentid === 'EQU0013'))[59])?.storageroomtemp ? ((cleanArray_A.filter(item => item.equipmentid === 'EQU0013'))[59])?.storageroomtemp : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">재생기</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((cleanArray_A.filter(item => item.equipmentid === 'EQU0013'))[59])?.regeneratortemp ? ((cleanArray_A.filter(item => item.equipmentid === 'EQU0013'))[59])?.regeneratortemp : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData_c((cleanArray_A.filter(item => item.equipmentid === 'EQU0013')))} height={200} />
                        </div>
                    </div>
                    {/* 세척기 4호 데이터 없음
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((cleanArray_A.filter(item => item.equipmentid === 'EQU0045'))[59])?.equipmentname ? ((cleanArray_A.filter(item => item.equipmentid === 'EQU0045'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">세척실</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((cleanArray_A.filter(item => item.equipmentid === 'EQU0045'))[59])?.washroomtemp ? ((cleanArray_A.filter(item => item.equipmentid === 'EQU0045'))[59])?.washroomtemp : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">보관실</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((cleanArray_A.filter(item => item.equipmentid === 'EQU0045'))[59])?.storageroomtemp ? ((cleanArray_A.filter(item => item.equipmentid === 'EQU0045'))[59])?.storageroomtemp : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">재생기</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((cleanArray_A.filter(item => item.equipmentid === 'EQU0045'))[59])?.regeneratortemp ? ((cleanArray_A.filter(item => item.equipmentid === 'EQU0045'))[59])?.regeneratortemp : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData_c((cleanArray_A.filter(item => item.equipmentid === 'EQU0045')))} height={200} />
                        </div>
                    </div>
                    */}
                </div>
            </Card>
            <Card noborder>
                <h3 className="font-medium lg:text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">B동</h3>
                <div className="flex flex-wrap items-center justify-between">
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0016'))[59])?.equipmentname ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0016'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">침탄/소열 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0016'))[59])?.carburtemppv ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0016'))[59])?.carburtemppv : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">유조 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0016'))[59])?.bathtemppv ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0016'))[59])?.bathtemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData((heatArray_B.filter(item => item.equipmentid === 'EQU0016')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0017'))[59])?.equipmentname ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0017'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">침탄/소열 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0017'))[59])?.carburtemppv ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0017'))[59])?.carburtemppv : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">유조 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0017'))[59])?.bathtemppv ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0017'))[59])?.bathtemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData((heatArray_B.filter(item => item.equipmentid === 'EQU0017')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0020'))[59])?.equipmentname ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0020'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">침탄/소열 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0020'))[59])?.carburtemppv ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0020'))[59])?.carburtemppv : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">유조 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0020'))[59])?.bathtemppv ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0020'))[59])?.bathtemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData((heatArray_B.filter(item => item.equipmentid === 'EQU0020')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0022'))[59])?.equipmentname ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0022'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">침탄/소열 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0022'))[59])?.carburtemppv ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0022'))[59])?.carburtemppv : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">유조 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0022'))[59])?.bathtemppv ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0022'))[59])?.bathtemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData((heatArray_B.filter(item => item.equipmentid === 'EQU0022')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0023'))[59])?.equipmentname ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0023'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">침탄/소열 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0023'))[59])?.carburtemppv ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0023'))[59])?.carburtemppv : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">유조 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0023'))[59])?.bathtemppv ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0023'))[59])?.bathtemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData((heatArray_B.filter(item => item.equipmentid === 'EQU0023')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0024'))[59])?.equipmentname ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0024'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">침탄/소열 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0024'))[59])?.carburtemppv ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0024'))[59])?.carburtemppv : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">유조 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_B.filter(item => item.equipmentid === 'EQU0024'))[59])?.bathtemppv ? ((heatArray_B.filter(item => item.equipmentid === 'EQU0024'))[59])?.bathtemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData((heatArray_B.filter(item => item.equipmentid === 'EQU0024')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((tempArray_B.filter(item => item.equipmentid === 'EQU0028'))[59])?.equipmentname ? ((tempArray_B.filter(item => item.equipmentid === 'EQU0028'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">소려 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((tempArray_B.filter(item => item.equipmentid === 'EQU0028'))[59])?.soaktemppv ? ((tempArray_B.filter(item => item.equipmentid === 'EQU0028'))[59])?.soaktemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData_t((tempArray_B.filter(item => item.equipmentid === 'EQU0028')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((tempArray_B.filter(item => item.equipmentid === 'EQU0029'))[59])?.equipmentname ? ((tempArray_B.filter(item => item.equipmentid === 'EQU0029'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">소려 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((tempArray_B.filter(item => item.equipmentid === 'EQU0029'))[59])?.soaktemppv ? ((tempArray_B.filter(item => item.equipmentid === 'EQU0029'))[59])?.soaktemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData_t((tempArray_B.filter(item => item.equipmentid === 'EQU0029')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((tempArray_B.filter(item => item.equipmentid === 'EQU0030'))[59])?.equipmentname ? ((tempArray_B.filter(item => item.equipmentid === 'EQU0030'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">소려 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((tempArray_B.filter(item => item.equipmentid === 'EQU0030'))[59])?.soaktemppv ? ((tempArray_B.filter(item => item.equipmentid === 'EQU0030'))[59])?.soaktemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData_t((tempArray_B.filter(item => item.equipmentid === 'EQU0030')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((tempArray_B.filter(item => item.equipmentid === 'EQU0032'))[59])?.equipmentname ? ((tempArray_B.filter(item => item.equipmentid === 'EQU0032'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">소려 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((tempArray_B.filter(item => item.equipmentid === 'EQU0032'))[59])?.soaktemppv ? ((tempArray_B.filter(item => item.equipmentid === 'EQU0032'))[59])?.soaktemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData_t((tempArray_B.filter(item => item.equipmentid === 'EQU0032')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((tempArray_B.filter(item => item.equipmentid === 'EQU0033'))[59])?.equipmentname ? ((tempArray_B.filter(item => item.equipmentid === 'EQU0033'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">소려 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((tempArray_B.filter(item => item.equipmentid === 'EQU0033'))[59])?.soaktemppv ? ((tempArray_B.filter(item => item.equipmentid === 'EQU0033'))[59])?.soaktemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData_t((tempArray_B.filter(item => item.equipmentid === 'EQU0033')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((cleanArray_B.filter(item => item.equipmentid === 'EQU0011'))[59])?.equipmentname ? ((cleanArray_B.filter(item => item.equipmentid === 'EQU0011'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">세척실</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((cleanArray_B.filter(item => item.equipmentid === 'EQU0011'))[59])?.washroomtemp ? ((cleanArray_B.filter(item => item.equipmentid === 'EQU0011'))[59])?.washroomtemp : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">보관실</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((cleanArray_B.filter(item => item.equipmentid === 'EQU0011'))[59])?.storageroomtemp ? ((cleanArray_B.filter(item => item.equipmentid === 'EQU0011'))[59])?.storageroomtemp : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">재생기</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((cleanArray_B.filter(item => item.equipmentid === 'EQU0011'))[59])?.regeneratortemp ? ((cleanArray_B.filter(item => item.equipmentid === 'EQU0011'))[59])?.regeneratortemp : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData_c((cleanArray_B.filter(item => item.equipmentid === 'EQU0011')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((cleanArray_B.filter(item => item.equipmentid === 'EQU0012'))[59])?.equipmentname ? ((cleanArray_B.filter(item => item.equipmentid === 'EQU0012'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">세척실</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((cleanArray_B.filter(item => item.equipmentid === 'EQU0012'))[59])?.washroomtemp ? ((cleanArray_B.filter(item => item.equipmentid === 'EQU0012'))[59])?.washroomtemp : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">보관실</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((cleanArray_B.filter(item => item.equipmentid === 'EQU0012'))[59])?.storageroomtemp ? ((cleanArray_B.filter(item => item.equipmentid === 'EQU0012'))[59])?.storageroomtemp : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">재생기</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((cleanArray_B.filter(item => item.equipmentid === 'EQU0012'))[59])?.regeneratortemp ? ((cleanArray_B.filter(item => item.equipmentid === 'EQU0012'))[59])?.regeneratortemp : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData_c((cleanArray_B.filter(item => item.equipmentid === 'EQU0012')))} height={200} />
                        </div>
                    </div>
                </div>
            </Card>
            <Card noborder>
                <h3 className="font-medium lg:text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">C동</h3>
                <div className="flex flex-wrap items-center justify-between">
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((heatArray_C.filter(item => item.equipmentid === 'EQU0025'))[59])?.equipmentname ? ((heatArray_C.filter(item => item.equipmentid === 'EQU0025'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">침탄/소열 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_C.filter(item => item.equipmentid === 'EQU0025'))[59])?.carburtemppv ? ((heatArray_C.filter(item => item.equipmentid === 'EQU0025'))[59])?.carburtemppv : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">유조 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_C.filter(item => item.equipmentid === 'EQU0025'))[59])?.bathtemppv ? ((heatArray_C.filter(item => item.equipmentid === 'EQU0025'))[59])?.bathtemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData((heatArray_C.filter(item => item.equipmentid === 'EQU0025')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((heatArray_C.filter(item => item.equipmentid === 'EQU0026'))[59])?.equipmentname ? ((heatArray_C.filter(item => item.equipmentid === 'EQU0026'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">침탄/소열 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_C.filter(item => item.equipmentid === 'EQU0026'))[59])?.carburtemppv ? ((heatArray_C.filter(item => item.equipmentid === 'EQU0026'))[59])?.carburtemppv : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">유조 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_C.filter(item => item.equipmentid === 'EQU0026'))[59])?.bathtemppv ? ((heatArray_C.filter(item => item.equipmentid === 'EQU0026'))[59])?.bathtemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData((heatArray_C.filter(item => item.equipmentid === 'EQU0026')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((heatArray_C.filter(item => item.equipmentid === 'EQU0027'))[59])?.equipmentname ? ((heatArray_C.filter(item => item.equipmentid === 'EQU0027'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">침탄/소열 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_C.filter(item => item.equipmentid === 'EQU0027'))[59])?.carburtemppv ? ((heatArray_C.filter(item => item.equipmentid === 'EQU0027'))[59])?.carburtemppv : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">유조 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((heatArray_C.filter(item => item.equipmentid === 'EQU0027'))[59])?.bathtemppv ? ((heatArray_C.filter(item => item.equipmentid === 'EQU0027'))[59])?.bathtemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData((heatArray_C.filter(item => item.equipmentid === 'EQU0027')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((tempArray_C.filter(item => item.equipmentid === 'EQU0034'))[59])?.equipmentname ? ((tempArray_C.filter(item => item.equipmentid === 'EQU0034'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">소려 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((tempArray_C.filter(item => item.equipmentid === 'EQU0034'))[59])?.soaktemppv ? ((tempArray_C.filter(item => item.equipmentid === 'EQU0034'))[59])?.soaktemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData_t((tempArray_C.filter(item => item.equipmentid === 'EQU0034')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((tempArray_C.filter(item => item.equipmentid === 'EQU0035'))[59])?.equipmentname ? ((tempArray_C.filter(item => item.equipmentid === 'EQU0035'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">소려 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((tempArray_C.filter(item => item.equipmentid === 'EQU0035'))[59])?.soaktemppv ? ((tempArray_C.filter(item => item.equipmentid === 'EQU0035'))[59])?.soaktemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData_t((tempArray_C.filter(item => item.equipmentid === 'EQU0035')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((tempArray_C.filter(item => item.equipmentid === 'EQU0043'))[59])?.equipmentname ? ((tempArray_C.filter(item => item.equipmentid === 'EQU0043'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">소려 온도</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((tempArray_C.filter(item => item.equipmentid === 'EQU0043'))[59])?.soaktemppv ? ((tempArray_C.filter(item => item.equipmentid === 'EQU0043'))[59])?.soaktemppv : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData_t((tempArray_C.filter(item => item.equipmentid === 'EQU0043')))} height={200} />
                        </div>
                    </div>
                    <div className="w-full lg:w-[50%] sm:w-full lg:pr-4 flex flex-wrap items-center justify-between">
                        <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
                            <h6 className="mb-2">{((cleanArray_C.filter(item => item.equipmentid === 'EQU0015'))[59])?.equipmentname ? ((cleanArray_C.filter(item => item.equipmentid === 'EQU0015'))[59])?.equipmentname : ""}</h6>
                            <div className="w-full bg-slate-200 p-3 place-content-between items-center justify-between text-[0.8vw] dark:text-white dark:bg-slate-600 rounded-xl">
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">세척실</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((cleanArray_C.filter(item => item.equipmentid === 'EQU0015'))[59])?.washroomtemp ? ((cleanArray_C.filter(item => item.equipmentid === 'EQU0015'))[59])?.washroomtemp : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">보관실</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((cleanArray_C.filter(item => item.equipmentid === 'EQU0015'))[59])?.storageroomtemp ? ((cleanArray_C.filter(item => item.equipmentid === 'EQU0015'))[59])?.storageroomtemp : 0} ℃</div>
                                </div>
                                <div className="flex place-content-between items-center justify-between">
                                    <div className="ml-3 mt-2 mb-2">재생기</div>
                                    <div className="font-semibold mr-3 mt-2 mb-2">{((cleanArray_C.filter(item => item.equipmentid === 'EQU0015'))[59])?.regeneratortemp ? ((cleanArray_C.filter(item => item.equipmentid === 'EQU0015'))[59])?.regeneratortemp : 0} ℃</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-[70%] sm:w-full lg:pr-4 ">
                            <MixedChart data={formatChartData_c((cleanArray_C.filter(item => item.equipmentid === 'EQU0015')))} height={200} />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default TemperatureStatus_F1