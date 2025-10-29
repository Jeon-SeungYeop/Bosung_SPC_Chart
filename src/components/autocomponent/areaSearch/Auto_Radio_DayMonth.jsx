import React, { useState } from "react";
import Radio from "@/components/ui/Radio";

const Auto_Radio_DayMonth = ({ useValue, setUseValue }) => {
  const handleChange = (e) => {
    setUseValue(e.target.value); // 라디오 버튼 변경 시 상태 업데이트
  };

  return (
    <div className="flex items-center space-x-4 min-w-[130px]">
      {/* 라디오 버튼들 */}
      <Radio
        label="당일"
        name="useRadio"
        value="day"
        checked={useValue === "day"}  
        onChange={handleChange}
      />

      <Radio
        label="당월"
        name="useRadio"
        value="month"
        checked={useValue === "month"} 
        onChange={handleChange}
      />
    </div>
  );
};

export default Auto_Radio_DayMonth;
