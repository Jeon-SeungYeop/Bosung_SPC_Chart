import React, { useState, useEffect } from "react";
import HomeBredCurbs from "@/components/partials/widget/chart/HomeBredCurbs";
import useDarkMode from "@/services/hooks/useDarkMode";
import { useApiUrl } from "@/context/APIContext";   
import axios from "axios";
import Auto_ScatterChart from "@/components/autocomponent/areaChart/Auto_ScatterChart";


const DashBoard = () => {
    const [filterMap, setFilterMap] = useState("usa");
    const [count, setCount] = useState(0);
    const [isDark] = useDarkMode();
    const apiUrl = useApiUrl(); // API URL 가져오기

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
            <HomeBredCurbs title="제품 모니터링 현황" /> 
            <div className="grid grid-cols-12 gap-5">
                <div className="lg:col-span-12 col-span-12">
                    <Auto_ScatterChart/>
                </div>
            </div>
            <div>
                <div>페이지 리셋 확인용  : {count}</div>
            </div>
        </div>
    )
}


export default DashBoard;
