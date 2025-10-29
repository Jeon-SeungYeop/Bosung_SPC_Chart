import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import HomeBredCurbs from "@/components/partials/widget/chart/HomeBredCurbs";
import useDarkMode from "@/services/hooks/useDarkMode";
import GaugeChart from 'react-gauge-chart'
import ProgressBarComponent from "@/components/autocomponent/areaChart/Auto_ProgressBar";
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
            const url = `${apiUrl}/monitoring`
            const response = await axios.get(url, {params : "monitoring"});


            if(!response?.data){
                console.error("No server response data.");
                return
            }

            const { jhedher, jbody } = response.data;

            // 서버 응답 상태 체크
            if(jhedher?.status !== "S") {
                console.warn("The server returned an error response.", jhedher);
                return
            }

            return (
                <div>
                    <HomeBredCurbs title="모니터링 현황"/>
                    <div className="grid grid-cols-12 gap-5">
                        <div className="lg:col-span-12 col-span-12">
                            <h3>DATE : {jbody.monitor_data.date}</h3>
                            <h6>Summary : 평균 전압 {jbody.monitor_data.Average_V}V  //  부하 A,B,C상 {jbody.monitor_data.load_1A}% {jbody.monitor_data.load_2B}% {jbody.monitor_data.load_3C}%  //  평균 전력 사용량 {jbody.monitor_data.Average_P}Kw 이며, 누전전력 사용량은 {jbody.monitor_data.Sum_P}Mw/h</h6>
                        </div>
                    </div>
                    <div>
                        <div>페이지 리셋 확인용 : {count}</div>
                    </div>
                    <div className="grid grid-cols-12 gap-5">
                        <div className="lg:col-span-3 col-span-12" >
                            <Card title="부하율">
                                <div style={{display:'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                                    <div style={{width: '30%',  }}>
                                        <h3>L1A상</h3>
                                    </div>
                                    <div style={{width:'50%'}}>
                                        <GaugeChart id="gauge-chart1"
                                                    nrOfLevels={420}
                                                    arcsLength={[0.1, 0.6, 0.3]}    // 게이지 바 길이
                                                    colors={['#5BE12C', '#F5CD19', '#EA4228']}
                                                    percent={jbody.monitor_data.load_1A}
                                                    textColor={isDark ? "#cbd5e1" : "#0f172a"}
                                                    arcWidth={0.3}  // 게이지 바 두께
                                                    arcPadding={0.02} />
                                    </div>
                                </div>
                                <div style={{display:'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                                    <div style={{width: '30%',  }}>
                                        <h3>L2B상</h3>
                                    </div>
                                    <div style={{width:'50%'}}>
                                        <GaugeChart id="gauge-chart1"
                                                    nrOfLevels={420}
                                                    arcsLength={[0.3, 0.5, 0.2]}
                                                    colors={['#00cdff', '#b0a8b9', '#da0000']}   // 게이지 색상
                                                    percent={jbody.monitor_data.load_2B}
                                                    textColor={isDark ? "#cbd5e1" : "#0f172a"}
                                                    arcWidth={0.3}  // 게이지 바 두께
                                                    arcPadding={0.02} />
                                    </div>
                                </div>
                                <div style={{display:'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                                    <div style={{width: '30%',  }}>
                                        <h3>L3C상</h3>
                                    </div>
                                    <div style={{width:'50%'}}>
                                        <GaugeChart id="gauge-chart1"
                                                    nrOfLevels={420}
                                                    arcsLength={[0.3, 0.5, 0.2]}
                                                    colors={['#5BE12C', '#F5CD19', '#EA4228']}
                                                    percent={jbody.monitor_data.load_3C}
                                                    textColor={isDark ? "#cbd5e1" : "#0f172a"}
                                                    arcWidth={0.3}  // 게이지 바 두께
                                                    arcPadding={0.02} />
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="lg:col-span-3 col-span-12" >
                            <Card title="전력부하">
                                <div style={{display:'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                                    <div style={{width: '30%',  }}>
                                        <h3>전압</h3>
                                    </div>
                                    <div style={{width:'50%'}}>
                                        <GaugeChart id="gauge-chart1"
                                                    nrOfLevels={420}
                                                    arcsLength={[0.3, 0.5, 0.2]}
                                                    colors={['#5BE12C', '#F5CD19', '#EA4228']}
                                                    percent={jbody.monitor_data.power_V}
                                                    textColor={isDark ? "#cbd5e1" : "#0f172a"}
                                                    arcWidth={0.3}  // 게이지 바 두께
                                                    arcPadding={0.02} />
                                    </div>
                                </div>
                                <div style={{display:'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                                    <div style={{width: '30%',  }}>
                                        <h3>부하</h3>
                                    </div>
                                    <div style={{width:'50%'}}>
                                        <GaugeChart id="gauge-chart1"
                                                    nrOfLevels={420}
                                                    arcsLength={[0.3, 0.5, 0.2]}
                                                    colors={['#5BE12C', '#F5CD19', '#EA4228']}
                                                    percent={jbody.monitor_data.power_L}
                                                    textColor={isDark ? "#cbd5e1" : "#0f172a"}
                                                    arcWidth={0.3}  // 게이지 바 두께
                                                    arcPadding={0.02} />
                                    </div>
                                </div>
                                <div style={{display:'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                                    <div style={{width: '30%',  }}>
                                        <h3>누적</h3>
                                    </div>
                                    <div style={{width:'50%'}}>
                                        <GaugeChart id="gauge-chart1"
                                                    nrOfLevels={420}
                                                    arcsLength={[0.3, 0.5, 0.2]}
                                                    colors={['#5BE12C', '#F5CD19', '#EA4228']}
                                                    percent={jbody.monitor_data.power_S}
                                                    textColor={isDark ? "#cbd5e1" : "#0f172a"}
                                                    arcWidth={0.3}  // 게이지 바 두께
                                                    arcPadding={0.02} />
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="lg:col-span-3 col-span-12" >
                            <Card title="전류부하">
                                <div style={{display:'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                                    <div style={{width: '30%',  }}>
                                        <h3>L1A상</h3>
                                    </div>
                                    <div style={{width:'50%'}}>
                                        <GaugeChart id="gauge-chart1"
                                                    nrOfLevels={420}
                                                    arcsLength={[0.3, 0.5, 0.2]}
                                                    colors={['#5BE12C', '#F5CD19', '#EA4228']}
                                                    percent={jbody.monitor_data.current_1A}
                                                    textColor={isDark ? "#cbd5e1" : "#0f172a"}
                                                    arcWidth={0.3}  // 게이지 바 두께
                                                    arcPadding={0.02}
                                                    needleColor={ // 값에 따라 바늘 색 변경
                                                        jbody.monitor_data.current_1A <= 0.3 ? '#5BE12C'
                                                        : jbody.monitor_data.current_1A <= 0.8 ? '#F5CD19'
                                                        : '#EA4228'}
                                                    needleBaseColor = { 
                                                        jbody.monitor_data.current_1A <= 0.3 ? '#5BE12C'
                                                        : jbody.monitor_data.current_1A <= 0.8 ? '#F5CD19'
                                                        : '#EA4228'} />
                                    </div>
                                </div>
                                <div style={{display:'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                                    <div style={{width: '30%',  }}>
                                        <h3>L2B상</h3>
                                    </div>
                                    <div style={{width:'50%'}}>
                                        <GaugeChart id="gauge-chart1"
                                                    nrOfLevels={420}
                                                    arcsLength={[0.3, 0.5, 0.2]}
                                                    colors={['#5BE12C', '#F5CD19', '#EA4228']}
                                                    percent={jbody.monitor_data.current_2B}
                                                    textColor={isDark ? "#cbd5e1" : "#0f172a"}
                                                    arcWidth={0.3}  // 게이지 바 두께
                                                    arcPadding={0.02}
                                                    needleColor={ 
                                                        jbody.monitor_data.current_2B <= 0.3 ? '#5BE12C'
                                                        : jbody.monitor_data.current_2B <= 0.8 ? '#F5CD19'
                                                        : '#EA4228'}
                                                    needleBaseColor = { 
                                                        jbody.monitor_data.current_2B <= 0.3 ? '#5BE12C'
                                                        : jbody.monitor_data.current_2B <= 0.8 ? '#F5CD19'
                                                        : '#EA4228'} />
                                    </div>
                                </div>
                                <div style={{display:'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                                    <div style={{width: '30%',  }}>
                                        <h3>L3C상</h3>
                                    </div>
                                    <div style={{width:'50%'}}>
                                        <GaugeChart id="gauge-chart1"
                                                    nrOfLevels={420}
                                                    arcsLength={[0.3, 0.5, 0.2]}
                                                    colors={['#5BE12C', '#F5CD19', '#EA4228']}
                                                    percent={jbody.monitor_data.current_3C}
                                                    textColor={isDark ? "#cbd5e1" : "#0f172a"}
                                                    arcWidth={0.3}  // 게이지 바 두께
                                                    arcPadding={0.02}
                                                    needleColor={ 
                                                        jbody.monitor_data.current_3C <= 0.3 ? '#5BE12C'
                                                        : jbody.monitor_data.current_3C <= 0.8 ? '#F5CD19'
                                                        : '#EA4228'}
                                                    needleBaseColor = { 
                                                        jbody.monitor_data.current_3C <= 0.3 ? '#5BE12C'
                                                        : jbody.monitor_data.current_3C <= 0.8 ? '#F5CD19'
                                                        : '#EA4228'} />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 gap-5">
                        <div className="lg:col-span-6 col-span-12" style={{marginTop:10}} >
                            <Card title="부가정보">
                                <div style={{display:'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                                    <div style={{width: '10%',  }}><h6>역률</h6></div>
                                    <div style={{width: '10%',  }}><h5>{jbody.progressBar_data.value}{jbody.progressBar_data.unit}</h5></div>
                                    <div style={{width: '80%',  }}><ProgressBarComponent data={jbody.progressBar_data}/></div>
                                </div>
                                <div style={{display:'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                                    <div style={{width: '10%',  }}><h6>주파수</h6></div>
                                    <div style={{width: '10%',  }}><h5>{(jbody.progressBar_data2.value * 100).toFixed(2)}{jbody.progressBar_data2.unit}</h5></div>
                                    <div style={{width: '80%',  }}><ProgressBarComponent data={jbody.progressBar_data2}/></div>
                                </div>
                            </Card>
                        </div>
                        <div className="lg:col-span-6 col-span-12" style={{marginTop:10}} >
                            <Card title="환경정보">
                                <div style={{display:'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                                    <div style={{width: '10%',  }}><h6>온도</h6></div>
                                    <div style={{width: '10%',  }}><h5>{(jbody.progressBar_data3.value * 100).toFixed(1)}{jbody.progressBar_data3.unit}</h5></div>
                                    <div style={{width: '80%',  }}><ProgressBarComponent data={jbody.progressBar_data3}/></div>
                                </div>
                                <div style={{display:'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                                    <div style={{width: '10%',  }}><h6>습도</h6></div>
                                    <div style={{width: '10%',  }}><h5>{(jbody.progressBar_data4.value * 100).toFixed(1)}{jbody.progressBar_data4.unit}</h5></div>
                                    <div style={{width: '80%',  }}><ProgressBarComponent data={jbody.progressBar_data4}/></div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            )
        } catch (error) {
            console.error("Data lookup error : ", error);
        }
    }
}

export default DashBoard;