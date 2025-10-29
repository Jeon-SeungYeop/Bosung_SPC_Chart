import React, { useState, useEffect } from "react";
import HomeBredCurbs from "@/components/partials/widget/chart/HomeBredCurbs";
import ReLineChart from "@/components/partials/widget/chart/ReLineChart";
import Card from "@/components/ui/Card";
import { ReLine_data_Power } from "@/services/constant/data";
import { ReLine_data_Power_2 } from "@/services/constant/data";


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
      }, []
    );

    return (
      <div>
        <HomeBredCurbs title="전력 현황" /> 
        <div className="grid grid-cols-12 gap-5">
            <div className="lg:col-span-12 col-span-12">
                <Card title="상 변압 변동 추이">
                    <ReLineChart data={ReLine_data_Power}/>
                </Card>
            </div>
        </div>
        
        <div className="grid grid-cols-12 gap-5" style={{marginTop:10}}>
            <div className="lg:col-span-12 col-span-12">
                <Card title="3상 변압 변동 추이">
                    <ReLineChart data={ReLine_data_Power_2}/>
                </Card>
            </div>
        </div>
        <div>
            <div>페이지 리셋 확인용  : {count}</div>
        </div>
      </div>
        
    );
  };
  
  export default Dashboard;
  