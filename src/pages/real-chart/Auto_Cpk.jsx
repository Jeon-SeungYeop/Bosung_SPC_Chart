import React, { useState, useEffect } from "react";
import HomeBredCurbs from "@/components/partials/widget/chart/HomeBredCurbs";
import Histogram from "@/components/autocomponent/areaChart/Auto_histogram";
import useDarkMode from "@/services/hooks/useDarkMode";
import { useApiUrl } from "@/context/APIContext";   
import axios from "axios";

const Dashboard = () => {
    const [filterMap, setFilterMap] = useState("usa");
    const [count, setCount] = useState(0);
    const [isDark] = useDarkMode();
    const tableBorderColor = isDark ? "#CBD5E1" : "#475569";
    const apiUrl = useApiUrl(); // API URL 가져오기

    useEffect(() => {
        // 1분(60초)마다 페이지 상태를 리셋
        const interval = setInterval(() => {
            setCount((prev) => prev + 1);
            importData();
        }, 10000); // 60000ms = 1분
                    
        // 컴포넌트 언마운트 시 interval을 정리
        return () => clearInterval(interval);
        }, []
    );

    const importData = async() => {
        try {
            const url = `${apiUrl}/cpk`;
            const response = await axios.get(url, {params : "cpk"});

            if(!response?.data){
                console.error("No server response data");
                return
            }

            const { jhedher, jbody } = response.data;

            // 서버 응답 상태 체크
            if(jhedher?.status !=="S") {
                console.warn("The server returned an error response.", jhedher);
                return
            }
            
            return (
                <div>
                    <HomeBredCurbs title="공정능력 분석 CPK" /> 
                    <div className="grid grid-cols-12 gap-5">
                        <div className="lg:col-span-12 col-span-12">
                            <Histogram histogram_data={jbody.histogram_data} distri_data={jbody.distri_data}/>
                        </div>
                    </div>
                    <div>
                        <div>페이지 리셋 확인용 : {count}</div>
                    </div>
                    <div className="grid grid-cols-12 gap-5" style={{marginTop:10}}>
                        <table className="lg:col-span-6" style={{widtdh: parent, border : '2px solid'+tableBorderColor, alignItems: 'center', justifyContent: 'center', textAlign: 'center',  }}>
                            <tbody>
                                <tr style={{height : 50, fontSize : 23, fontWeight : "bold"}}>
                                    <td style={{border: '1px solid'+tableBorderColor, width :'30%'}}>공정능력 판정</td>
                                    <td style={{border: '1px solid'+tableBorderColor, 
                                                background : (1.00 < jbody.table_data.CPK && jbody.table_data.CPK<= 1.33) ? "#FCFF00" 
                                                            : (0.67<jbody.table_data.CPK && jbody.table_data.CPK <=1.00) ? "#FF5C00" 
                                                            : jbody.table_data.CPK <= 0.67 ? "#FF0000" : (isDark ? "#0f172a": "#f1f5f9")}}>
                                        {(1.67 < jbody.table_data.CPK) ? "매우 안정"
                                        : (1.33 < jbody.table_data.CPK && jbody.table_data.CPK <= 1.67) ? "안정"
                                        : (1.00 < jbody.table_data.CPK && jbody.table_data.CPK <= 1.33) ? "보통"
                                        : (0.67 < jbody.table_data.CPK && jbody.table_data.CPK <= 1.00) ? "불안정"
                                        : "매우 불안정"}
                                    </td>
                                </tr>
                                <tr style={{height : 45}}>
                                    <td colspan="2" style={{border: '2px solid'+tableBorderColor, fontWeight : "bold", fontSize : 20}}>주요 공정 능력 지수</td>
                                </tr>
                                <tr style={{height : 40}}>
                                    <td style={{border: '1px solid'+tableBorderColor}}>CPK</td>
                                    <td style={{border: '1px solid'+tableBorderColor}}>{jbody.table_data.CPK}</td>
                                </tr>
                                    <tr style={{height : 40}}>
                                    <td style={{border: '1px solid'+tableBorderColor}}>PPK</td>
                                    <td style={{border: '1px solid'+tableBorderColor}}>{jbody.table_data.PPK}</td>
                                </tr>
                                <tr style={{height : 40}}>
                                    <td style={{border: '1px solid'+tableBorderColor}}>CP</td>
                                    <td style={{border: '1px solid'+tableBorderColor}}>{jbody.table_data.CP}</td>
                                </tr>
                                    <tr style={{height : 40}}>
                                    <td style={{border: '1px solid'+tableBorderColor}}>PP</td>
                                    <td style={{border: '1px solid'+tableBorderColor}}>{jbody.table_data.PP}</td>
                                </tr>
                            </tbody>
                        </table>
                        <table className="lg:col-span-6" style={{widtdh: parent, border : '2px solid'+tableBorderColor, alignItems: 'center', justifyContent: 'center', textAlign: 'center',  }}>
                                <tbody>
                                  <tr style={{height : 50, border : '2px solid'+tableBorderColor}}>
                                    <td style={{border: '1px solid'+tableBorderColor, width :'50%', fontSize : 25, fontWeight : "bold"}}>CPK</td>
                                    <td style={{border: '1px solid'+tableBorderColor, fontSize : 25, fontWeight : "bold"}}>판정 기준</td>
                                  </tr>
                                  <tr style={{height : 40}}>
                                    <td style={{border: '1px solid'+tableBorderColor}}>1.67＜ CPK </td>
                                    <td style={{border: '1px solid'+tableBorderColor}}>매우 안정</td>
                                  </tr>
                                  <tr style={{height : 40}}>
                                    <td style={{border: '1px solid'+tableBorderColor}}>1.33＜CPK ≤ 1.67</td>
                                    <td style={{border: '1px solid'+tableBorderColor}}>안정</td>
                                  </tr>
                                  <tr style={{height : 40}}>
                                    <td style={{border: '1px solid'+tableBorderColor}}>1.00＜CPK ≤ 1.33</td>
                                    <td style={{border: '1px solid'+tableBorderColor, background : "#FCFF00"}}>보통</td>
                                  </tr>
                                  <tr style={{height : 40}}>
                                    <td style={{border: '1px solid'+tableBorderColor}}>0.67＜CPK ≤ 1.00</td>
                                    <td style={{border: '1px solid'+tableBorderColor, background : "#FF5C00"}}>불안정</td>
                                  </tr>
                                  <tr style={{height : 40}}>
                                    <td style={{border: '1px solid'+tableBorderColor}}>CPK ＜ 0.67</td>
                                    <td style={{border: '1px solid'+tableBorderColor, background : "#FF0000"}}>매우 불안정</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                </div>
            )
        } catch (error){
            console.error("Data lookup error : ", error);
        }       
    }
}

export default Dashboard;

