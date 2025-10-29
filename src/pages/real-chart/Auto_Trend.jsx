import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import HomeBredCurbs from "@/components/partials/widget/chart/HomeBredCurbs";
import ReLineChart from "@/components/partials/widget/chart/ReLineChart";
import { useApiUrl } from "@/context/APIContext";   
import axios from "axios";

const DashBoard = () => {
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
            const url = `${apiUrl}/trend`;
            const response = await axios.get(url, {params : "trend"});

            if(!response?.data){
                console.error("No server response data");
                return
            }

            const { jhedher, jbody } = response.data;

            //서버 응답 상태 체크
            if(jhedher?.status !=="S"){
                console.warn("The server returned an error response.", jhedher);
                return
            }

            return (
                <div>
                    <HomeBredCurbs title="트랜드"/>
                    <div className="grid grid-cols-12 gap-5">
                        <div className="lg:col-span-12 col-span-12">
                            <Card title="실효/무효/피상 전력">
                                <div style={{marginLeft: "20px"}}>Power factor</div>
                                <ReLineChart data={jbody.ReLineData1}/>
                            </Card>
                        </div>
                    </div>
                    <div>
                        <div>페이지 리셋 확인용 : {count}</div>
                    </div>
                    <div className="grid grid-cols-12 gap-5">
                        <div className="lg:col-span-12 col-span-12">
                            <Card title="평균전압/전력량/무효전력량">
                                <ReLineChart data={jbody.ReLineData2}/>
                            </Card>
                        </div>
                    </div>
                </div>
            );
        } catch (error) {
            console.error("Data lookup error : ", error)
        }
    }
}

export default DashBoard;
