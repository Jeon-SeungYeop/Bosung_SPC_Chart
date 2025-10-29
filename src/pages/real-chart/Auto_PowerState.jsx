import React, { useState, useEffect } from "react";
import HomeBredCurbs from "@/components/partials/widget/chart/HomeBredCurbs";
import ReLineChart from "@/components/partials/widget/chart/ReLineChart";
import Card from "@/components/ui/Card";
import { useApiUrl } from "@/context/APIContext";   
import axios from "axios";

const Dashboard = () => {
    const [filterMap, setFilterMap] = useState("usa");
    const [count, setCount] = useState(0);
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
            const url = `${apiUrl}/power-state`;
            const response = await axios.get(url, {params : "power-state"});

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
                    <HomeBredCurbs title="전력 현황" />
                    <div className="grid grid-cols-12 gap-5">
                        <div className="lg:col-span-12 col-span-12">
                            <Card title="상 변압 변동 추이">
                                <ReLineChart data= {jbody.ReLineData1} />
                            </Card>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 gap-5" style={{marginTop:10}}>
                        <div className="lg:col-span-12 col-span-12">
                            <Card title="3상 변압 변동 추이">
                                <ReLineChart data= {jbody.ReLineData2} />
                            </Card>
                        </div>
                    </div>
                    <div>
                        <div>페이지 리셋 확인용 : {count}</div>
                    </div>
                </div>
            )
        } catch (error) {
            console.error("Data lookup error : ", error)
        }
    }
};

export default Dashboard;
