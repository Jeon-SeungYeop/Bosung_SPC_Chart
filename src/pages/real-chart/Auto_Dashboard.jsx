import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import RadarChart from "@/components/partials/widget/chart/radar-chart";
import Mixed from "@/components/partials/widget/chart/Mixed";
import HomeBredCurbs from "@/components/partials/widget/chart/HomeBredCurbs";
import ReLineChart from "@/components/partials/widget/chart/ReLineChart";
import Cardflex from "@/components/ui/Cardflex";
import GaugeChart from 'react-gauge-chart'
import useDarkMode from "@/services/hooks/useDarkMode";
import { useApiUrl } from "@/context/APIContext";   
import axios from "axios";

const DashBoard = () => {
    const [filterMap, setFilterMap] = useState("usa");
    const [count, setCount] = useState(0);
    const [isDark] = useDarkMode();
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
        try{
            const url = `${apiUrl}/load-ratio`;
            const response = await axios.get(url, {params : "load_ratio"});
            
            if(!response?.data){
                console.error("No server response data");
                return
            }

            const { jhedher, jbody} = response.data;

            // 서버 응답 상태 체크
            if(jhedher?.status !=="S"){
                console.warn("The server returned an error response.", jhedher);
                return
            }

            return (
                <div>
                    <HomeBredCurbs title="Autovation DashBoard"/>
                    <div className="grid grid-cols-12 gap-5">
                        <div className="lg:col-span-6 col-span-12">
                            <Card title="실시간 전력 현황">
                                <ReLineChart data={jbody.ReLineData}/>
                            </Card>
                        </div>
                        <div className="lg:col-span-6 col-span-12">
                            <Card title="온습도 현황(라인)">
                                <Mixed data = {jbody.Mixdata} height={350}/>
                            </Card>
                        </div>
                        <div className="lg:col-span-6 col-span-12">
                            <Cardflex title = "전력 부하">
                                <div style={{display:'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%'}}>
                                    <div style={{width: '33%', display:"block" }}>
                                        <GaugeChart id="gauge-chart1"
                                                    nrOfLevels={420}
                                                    arcsLength={[0.3, 0.5, 0.2]}
                                                    colors={['#5BE12C', '#F5CD19', '#EA4228']}
                                                    percent={jbody.GaugeData.power_S}
                                                    textColor={isDark ? "#cbd5e1" : "#0f172a"}
                                                    arcPadding={0.02} />
                                        <h5>누적</h5>
                                    </div>
                                    <div style={{width: '33%',  }}>
                                        <GaugeChart id="gauge-chart1"
                                                    nrOfLevels={420}
                                                    arcsLength={[0.3, 0.5, 0.2]}
                                                    colors={['#5BE12C', '#F5CD19', '#EA4228']}
                                                    percent={jbody.GaugeData.power_L}
                                                    textColor={isDark ? "#cbd5e1" : "#0f172a"}
                                                    arcPadding={0.02} />
                                        <h5>전력</h5>
                                    </div>
                                    <div style={{width: '33%',  }}>
                                        <GaugeChart id="gauge-chart1"
                                                    nrOfLevels={420}
                                                    arcsLength={[0.3, 0.5, 0.2]}
                                                    colors={['#5BE12C', '#F5CD19', '#EA4228']}
                                                    percent={jbody.GaugeData.power_V}
                                                    textColor={isDark ? "#cbd5e1" : "#0f172a"}
                                                    arcPadding={0.02} />
                                        <h5>전압</h5>
                                    </div>
                                </div>
                            </Cardflex>
                        </div>
                        <div className="lg:col-span-6 col-span-12">
                            <Cardflex title="온습도 현황">
                                <div style={{display:'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%'}}>
                                    {jbody.RadarData.map((data, index) => (
                                    <div style={{width: '33%',  }}>
                                        <RadarChart 
                                            key={index} 
                                            s_value={data.s_value} 
                                            label={data.label} 
                                            value={data.value} 
                                        />
                                    </div>))}
                                </div>
                            </Cardflex>
                        </div>
                    </div>
                </div>
            )
        } catch (error) {
            console.error("Data lookup error :", error);
        }
    }
}


export default DashBoard;
