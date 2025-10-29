import React from "react";
import Chart from "react-apexcharts";
import useDarkMode from "@/services/hooks/useDarkMode";

const DonutChart2 = ({ height, data }) => {
  const [isDark] = useDarkMode();

  const series = data.series;
  var options = {}
  switch(data.label){
    case 'load-ratio' :
      options = {
        labels: data.labels,
        dataLabels: {
          enabled: true,
        },
    
        colors: ["#A0AEC0", "#50C793", "#6c3c00"],
        legend: {
          position: "top",
          fontSize: "18px",
          fontFamily: "Outfit",
          fontWeight: 400,
          show: true,
          labels: {
            colors : isDark ? "#cbd5e1" : "#0f172a"   // 라벨 폰트 색 지정
          }
        },
    
        plotOptions: {
          pie: {
            donut: {
              size: "40%",      // 구멍 사이즈
              labels: {
                show: true,
                name: {
                  show: false,        // 각 벨류 hover 시 중앙 name 표시
                  fontSize: "14px",
                  fontWeight: "bold",
                  fontFamily: "Inter",
                },
                value: {
                  show: false,            // 중앙 value 표시
                  fontSize: "16px",
                  fontFamily: "Outfit",
                  color: isDark ? "#cbd5e1" : "#0f172a",
                  formatter(val) {
                    return `${parseInt(val)}%`;
                  },
                },
                total: {
                  show: false,
                  fontSize: "10px",
                  label: "",
                  formatter() {
                    return "70";
                  },
                },
              },
            },
          },
        },
      };
  }
  

  return (
    <div>
      <Chart options={options} series={series} type="donut" height={height} />
    </div>
  );
};

export default DonutChart2;
