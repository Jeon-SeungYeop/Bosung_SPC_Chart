import React, { useState, useEffect } from "react";
import { TitleBar, } from "@/components/autocomponent";
import BrushChartExample from "./Brush";
import Card from "@/components/ui/Card";

const BrushChartEx = () => {
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
    <>
      <TitleBar title="Test용"/>
      <Card noborder>
        <BrushChartExample/>
        {count}
      </Card>
    </>
  );
};
  
export default BrushChartEx;