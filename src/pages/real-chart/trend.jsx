import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import HomeBredCurbs from "@/components/partials/widget/chart/HomeBredCurbs";
import ReLineChart from "@/components/partials/widget/chart/ReLineChart";
import { trend_1 } from "@/services/constant/data";
import { trend_2 } from "@/services/constant/data";


const Dashboard = () => {
    const [filterMap, setFilterMap] = useState("usa");
    const [count, setCount] = useState(0);
    useEffect(() => {
            // 1분(60초)마다 페이지 상태를 리셋
            const interval = setInterval(() => {
               setCount((prev) => prev + 1);
            }, 10000); // 60000ms = 1분
        
            // 컴포넌트 언마운트 시 interval을 정리
            return () => clearInterval(interval);
          }, []);
    
    return (
      <div>
        <HomeBredCurbs title="트랜드" /> 
        <div className="grid grid-cols-12 gap-5">
            <div className="lg:col-span-12 col-span-12">
                <Card title="실효/무효/피상 전력">
                    <div style={{marginLeft: "20px"}}>Power factor</div>
                    <ReLineChart data={trend_1}/>
                </Card>
            </div>
        </div>
        <div>
            <div>페이지 리셋 확인용  : {count}</div>
        </div>
        <div className="grid grid-cols-12 gap-5">
            <div className="lg:col-span-12 col-span-12">
                <Card title="평균전압/전력량/무효전력량">
                    <ReLineChart data={trend_2}/>
                </Card>
            </div>
        </div>
      </div>
    );
  };
  
  export default Dashboard;
  