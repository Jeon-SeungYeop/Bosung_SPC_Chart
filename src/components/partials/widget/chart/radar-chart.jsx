import React from "react";
import Chart from "react-apexcharts";
import useDarkMode from "@/services/hooks/useDarkMode";

const RadarChart = ( {s_value, label, value} ) => {
  const [isDark] = useDarkMode();
  const series = [s_value];   // 게이지 부분
  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        dataLabels: {
          name: {
            fontSize: "22px",
            color: isDark ? "#E2E8F0" : "#475569",
          },
          value: {
            fontSize: "16px",   // value 사이즈
            color: isDark ? "#E2E8F0" : "#475569",
          },
          total: {
            show: true,
            label: label,  // 중앙 글자 부분
            color: isDark ? "#E2E8F0" : "#475569",
            formatter: function () {
              return value;  // 중앙 값 부분
            },
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        shadeIntensity: 0.15,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 65, 91],
      },
    },
    stroke: {
      dashArray: 0,          // 채우기 구간 설정 0일경우 전체 채우기
    },
    colors: [label == "Temperature"? "#9c2700" : "#4669FA", ],
  };

  return (
    <div>
      <Chart series={series} options={options} type="radialBar" height="350" />
    </div>
  );
};

export default RadarChart;
