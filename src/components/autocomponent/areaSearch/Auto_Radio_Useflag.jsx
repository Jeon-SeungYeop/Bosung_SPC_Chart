import React, { useState } from "react";
import Radio from "@/components/ui/Radio";

const Auto_Radio_Useflag = ({ useValue, setUseValue }) => {
  const handleChange = (e) => {
    setUseValue(e.target.value); // 라디오 버튼 변경 시 상태 업데이트
  };

  return (
    <div className="flex items-center space-x-4 min-w-[290px]">
      {/* 사용여부 레이블 */}
      <label className="mr-1"> 사용여부 </label>

      {/* 라디오 버튼들 */}
      <Radio
        label="전체"
        name="useRadio"
        value=""
        checked={useValue === ""}  
        onChange={handleChange}
      />

      <Radio
        label="사용"
        name="useRadio"
        value="Y"
        checked={useValue === "Y"} 
        onChange={handleChange}
      />

      <Radio
        label="미사용"
        name="useRadio"
        value="N"
        checked={useValue === "N"} 
        onChange={handleChange}
      />
    </div>
  );
};

export default Auto_Radio_Useflag;
