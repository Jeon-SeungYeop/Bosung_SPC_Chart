import React, { useState } from "react";
import Radio from "@/components/ui/Radio";

const Auto_Radio_Division = ({ useValue, setUseValue }) => {
  const handleChange = (e) => {
    setUseValue(e.target.value); // 라디오 버튼 변경 시 상태 업데이트
  };

  return (
    <div className="flex items-center space-x-4 min-w-[290px]">
      {/* 사용여부 레이블 */}
      <label className="mr-1"> 구분 </label>

      {/* 라디오 버튼들 */}
      <Radio
        label="월별"
        name="useRadio"
        value="month"
        checked={useValue === "month"}  
        onChange={handleChange}
      />

      <Radio
        label="분기별"
        name="useRadio"
        value="quarter"
        checked={useValue === "quarter"} 
        onChange={handleChange}
      />

      <Radio
        label="연간"
        name="useRadio"
        value="year"
        checked={useValue === "year"} 
        onChange={handleChange}
      />
    </div>
  );
};

export default Auto_Radio_Division;
