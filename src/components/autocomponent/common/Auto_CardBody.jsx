import React from "react";
import Card from "@/components/ui/Card";

//화면 을 꽉채우는 기본 Body Card 
function Auto_CardBody({
  title = "이곳에 내용을 추가 하세요",
  height = "853px",
  Content, // body 에 채워질 컴퍼넌트들
}) {

  return (
    <div className="h-full w-full flex flex-col" style={{ height: height }}>
      <Card className="flex-1 h-full w-full p-6">
        <div className="text-left text-slate-600 dark:text-slate-300 -mt-1 -ml-4">
          {title}
        </div>
        {Content}
      </Card>
    </div>


  );
}

export default Auto_CardBody;
