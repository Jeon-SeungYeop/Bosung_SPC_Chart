import React, { useState, useMemo, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import useDarkmode from "@/services/hooks/useDarkMode";

// 날짜별 시리즈 데이터 생성 함수
function generateDayWiseTimeSeries(baseval, count, yrange) {
  let series = [];
  for (let i = 0; i < count; i++) {
    let x = baseval + i * 86400000; // 하루(24h)를 밀리초로 환산
    let y =
      Math.floor(
        Math.random() * (yrange.max - yrange.min + 1)
      ) + yrange.min;
    series.push({ x, y });
  }
  return series;
}
// data 형식은 (x: ?? , y: ??)
const BrushChartExample = () => {
  const [isDark] = useDarkmode();
  // data 예시
  const chartData = useMemo(() => generateDayWiseTimeSeries(
        new Date("2021-01-01").getTime(),
        30,
        { min: 10, max: 100 }
      ),
    []
  );
  const chartData2 = useMemo(
    () =>
      generateDayWiseTimeSeries(
        new Date("2021-01-01").getTime(),
        30,
        { min: 50, max: 150 }
      ),
    []
  );

  // 메인 차트 옵션
  const options = useMemo(
    () => ({
      chart: {
        id: "mainChart",
        type: "line",
        height: 230,
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      stroke: { width: 2, curve: "straight" },
      xaxis: {
        type: "datetime",
        axisBorder: {
          show: true,
          color: isDark ? "#FFFFFF" : "#000000",
        },
        axisTicks: {
          show: true,
          color: isDark ? "#FFFFFF" : "#000000",
        },
        labels: {
          style: {
            colors: isDark ? "#FFFFFF" : "#000000",
          },
        },
      },
      yaxis : {
        labels: {
          style: {
            colors: isDark ? "#FFFFFF" : "#000000",
          },
        },
      },
      tooltip: { x: { format: "yyyy-MM-dd" } },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "center",
        labels: {
          colors: isDark ? "#FFFFFF" : "#000000",
        },
      },
      grid: {
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
        borderColor: "#e0e0e0",
      },
    }), [isDark, chartData]
  );

  // series에 name 추가
  const [series] = useState([
    { name: "첫 번째 데이터", data: chartData },
    { name: "두 번째 데이터", data: chartData2 },
  ]);

  // 브러시 차트 옵션
  const optionsBrush = useMemo(
    () => ({
      chart: {
        id: "brushChart",
        height: "100px",
        type: "line",
        brush: {
          enabled: true,
          target: "mainChart",
        },
        selection: {
          enabled: true,
          xaxis: {
            min: chartData[8].x,    // 초기 brush 시작 위치
            max: chartData[18].x,   // 초기 brush 끝 위치
          },
          // 선택영역 색상
          fill: {
            color: "#aab8c2",
            opacity: 0.5,
          },
          // 선택영역 테두리 색상
          stroke: {
            color: isDark ? "#263238" : "#aab8c2",
            strokeDashArray: 3,
            width: 1,
          },
        },
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      stroke: { width: 2, curve: "straight" },
      fill: { opacity: 0.3 },
      xaxis: {
        type: "datetime",
        tooltip: { enabled: false },
        offsetY: -3,   // x축 label offset
        axisBorder: {
          show: true,
          offsetY: -44.1,       // 기준 x축 offset
          color: isDark ? "#FFFFFF" : "#000000",
        },
        axisTicks: {
          show: true,
          color: isDark ? "#FFFFFF" : "#000000",
        },
        labels: {
          style: {
            colors: isDark ? "#FFFFFF" : "#000000",
          },
        },
      },
      yaxis: {
        min: -300,   // y축 최소값,
        max: 300,   // y축 최대값
        labels: { show: false },
      },
      grid: {
        yaxis: { lines: { show: false } },
        xaxis: { lines: { show: true } },
        borderColor: "#e0e0e0",
      },
      annotations: {   // 차트 양쪽 끝 선 설정
        xaxis: [
          {
            x: chartData[0].x,
            borderColor: isDark ? "#FFFFFF" : "#000000",
            strokeDashArray: 0,
            label: { show: false },
          },
          {
            x: chartData[chartData.length - 1].x,
            borderColor: isDark ? "#FFFFFF" : "#000000",
            strokeDashArray: 0,
            label: { show: false },
          },
        ],
      },
      legend: {
        show: false,
      },
    }),
    [isDark, chartData]
  );

  return (
    <div>
      {/* 메인 차트 */}
      <div id="chart-main">
        <ReactApexChart
          options={options}
          series={series}
          type="line"
          height={400}
        />
      </div>
      {/* 브러시 차트 */}
      <div id="chart-brush" style={{ marginTop: 10 }}>
        <ReactApexChart
          options={optionsBrush}
          series={series}
          type="line"
          height={"150px"}
        />
      </div>
    </div>
  );
};

export default BrushChartExample;