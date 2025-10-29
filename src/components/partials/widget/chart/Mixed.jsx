import React from "react";
import Chart from "react-apexcharts";
import useDarkMode from "@/services/hooks/useDarkMode";

const MixedChart = ({ data, height }) => {
  const [isDark] = useDarkMode();
  const series = data.datas;
  var options = {};
  switch (data.label) {
    case "dashboard":
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: [2], // 라인별 두께 (각 라인별 지정시 [1, 2, 3] 길이에 맞게 지정)
          curve: "smooth",
        },
        plotOptions: {
          bar: {
            columnWidth: "50%",
          },
        },
        fill: {
          opacity: [0.85, 0.25, 1],
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: 0,
        },
        xaxis: {
          type: "datetime", // "category" | "datetime" | "numeric"
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        yaxis: {
          min: 0,
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return y.toFixed(0) + " views";
              }
              return y;
            },
          },
        },
        legend: {
          labels: {
            useSeriesColors: true,
          },
        },
        grid: {
          show: true,
          borderColor: isDark ? "#334155" : "#e2e8f0",
          position: "back",
        },
        colors: ["#4669FA", "#50C793", "#0CE7FA"], // series의 값이 4개 이상일 경우 색 순환
      };
      break;

    case "load-ratio":
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: [1, 1, 1, 3], // 라인별 두께 (각 라인별 지정시 [1, 2, 3] 길이에 맞게 지정), column 형일 경우 bar 테두리 두께
          curve: "smooth",
        },
        plotOptions: {
          bar: {
            columnWidth: "10%", // bar 두께
          },
        },
        fill: {
          opacity: [1, 1, 1, 1], // 투명도 설정
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: 0,
        },
        xaxis: {
          type: "category", // "category" | "datetime" | "numeric"
          tickPlacement: "between", // 차트가 간격을 두고 시작
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          title: {
            text: "time",
            style: {
              color: isDark ? "#cbd5e1" : "#0f172a",
              fontFamily: "Inter",
            },
          },
        },
        yaxis: {
          show: true,
          min: 0,
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return y.toFixed(0) + " views";
              }
              return y;
            },
          },
        },
        legend: {
          position: "bottom",
          labels: {
            useSeriesColors: true,
          },
          fontSize: 15,
        },
        grid: {
          show: true,
          borderColor: isDark ? "#334155" : "#e2e8f0",
          position: "back",
        },
        colors: ["#4669FA", "#50C793", "#0CE7FA", "#862400"],
      };
      break;

    case "processdefectrate":
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: [1, 1, 1, 3], // 라인별 두께 (각 라인별 지정시 [1, 2, 3] 길이에 맞게 지정), column 형일 경우 bar 테두리 두께
          curve: "smooth",
        },
        plotOptions: {
          bar: {
            columnWidth: "30%", // bar 두께
          },
        },
        fill: {
          opacity: [1, 1, 1, 1], // 투명도 설정
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: 2,
        },
        xaxis: {
          type: "category", // "category" | "datetime" | "numeric"
          //tickPlacement: "between",     // 차트가 간격을 두고 시작
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        yaxis: {
          show: true,
          min: 0,
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return y.toFixed(0) + " views";
              }
              return y;
            },
          },
        },
        legend: {
          position: "bottom",
          labels: {
            useSeriesColors: true,
          },
          markers: {
            shape: "line",
          },
          fontSize: 15,
        },
        grid: {
          show: true,
          borderColor: isDark ? "#FFFFFF" : "#e2e8f0",
          position: "back",
        },
        title: {
          // text: "불량 현황",
          align: "left",
        },
        colors: ["#4669FA", "#50C793", "#0CE7FA", "#862400"],
      };
      break;

    //======================================================================================================== 위까지 샘플 옵션
    //======================================================================================================== 아래부터 보성 관련 차트 옵션

    case "RealtimeControlStatus":
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: true,
            type: 'x',  
            autoScaleYaxis: false,  
            allowMouseWheelZoom: true,  
            zoomedArea: {
              fill: {
                color: '#90CAF9',
                opacity: 0.4
              },
              stroke: {
                color: '#0D47A1',
                opacity: 0.4,
                width: 1
              }
            }
          }
        },
        stroke: {
          width: [1, 1, 1], // 라인별 두께
          curve: "smooth",
        },
        plotOptions: {
          bar: {
            columnWidth: "30%", // bar 두께
          },
        },
        fill: {
          opacity: [1, 1, 1, 1], // 투명도 설정
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: 0,
        },
        xaxis: {
          type: "category",
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        yaxis: {
          show: true,
          min: 0,
          labels: {
            formatter: function (val) {
              return typeof val === "number" ? val.toFixed(2) : val;
            },
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return y.toFixed(0);
              }
              return y;
            },
          },
        },
        legend: {
          position: "bottom",
          labels: {
            useSeriesColors: true,
          },
          markers: {
            shape: "line",
          },
          fontSize: 15,
        },
        grid: {
          show: true,
          borderColor: isDark ? "#FFFFFF" : "#e2e8f0",
          position: "back",
        },
        title: {
          // text: "불량 현황",
          align: "left",
        },
        colors: ["#4669FA", "#50C793", "#0CE7FA", "#862400"],
      };
      break;

    case "RealtimeInfo":
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: true,
            type: 'x',  
            autoScaleYaxis: false,  
            allowMouseWheelZoom: true,  
            zoomedArea: {
              fill: {
                color: '#90CAF9',
                opacity: 0.4
              },
              stroke: {
                color: '#0D47A1',
                opacity: 0.4,
                width: 1
              }
            }
          }
        },
        stroke: {
          width: [1, 1, 3, 3, 3], // 라인별 두께
          curve: "smooth",
          dashArray: [4, 0, 0, 0, 0],
        },
        plotOptions: {
          bar: {
            columnWidth: "30%", // bar 두께
          },
        },
        fill: {
          opacity: [1, 1, 1, 1], // 투명도 설정
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: 0,
        },
        xaxis: {
          type: "category",
          tickPlacement: "between", // 차트가 간격을 두고 시작
          tickAmount: Math.ceil(data.labels.length / 6),
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          title:{
            text: "",
          }
        },
        yaxis: {
          show: true,
          labels: {
            formatter: function (val) {
              return typeof val === "number" ? val.toFixed(2) : val;
            },
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return y.toFixed(2);
              }
              return y;
            },
          },
        },
        legend: {
          position: "bottom",
          labels: {
            useSeriesColors: true,
          },
          markers: {
            shape: "line",
          },
          fontSize: 15,
        },
        grid: {
          show: true,
          borderColor: isDark ? "#FFFFFF" : "#e2e8f0",
          position: "back",
          //xaxis: {
          //  lines: {
          //    show: true,    // 세로 그리드 라인
          //  },
          //},
          yaxis: {
            lines: {
              show: true,    // 가로 그리드 라인
            },
          },
        },
        title: {
          text: "",
          align: "left",
        },
        colors: ["#747474ff", "#1a0af0ff", "#65fd00ff", "#862400da", "#ff0000ff"],
      };
      break;

    case "RealtimePowerFactorTrend_1point":
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: [3,2,2,2], // 라인별 두께
          curve: "straight",
        },
        plotOptions: {
          bar: {
            columnWidth: "30%", // bar 두께
          },
        },
        fill: {
          opacity: [1, 1, 1, 1], // 투명도 설정
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: [4, 0, 0, 0, 0],
          strokeWidth: [2, 0, 0, 0, 0],
        },

        xaxis: {
          type: "category", // "category" | "datetime" | "numeric"
          tickPlacement: "between",
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          title:{
            text: ""
          }
        },
        yaxis: {
          show: true,
          labels: {
            formatter: function (val) {
              return typeof val === "number" ? val.toFixed(2) : val;
            },
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
        },
        tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (y) {
            if (y != null && !isNaN(y)) {
              return (Math.floor(Number(y) * 1000) / 1000).toString();
            }
            return y;
          },
        },
      },
        legend: {
          position: "bottom",
          labels: {
            useSeriesColors: true,
          },
          markers: {
            shape: "line",
          },
          fontSize: 15,
        },
        grid: {
          show: true,
          borderColor: isDark ? "#FFFFFF" : "#e2e8f0",
          position: "back",
        },
        title: {
          // text: "차트 제목",
          align: "left",
        },
        colors: ["#4669FA", "#50C793", "#c0bd26ff", "#ff0000ff", "#ff8c71"],
      };
      break;
    case "RealtimePowerFactorTrend_4point":
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: [3,2,2,2], // 라인별 두께
          curve: "straight",
        },
        plotOptions: {
          bar: {
            columnWidth: "30%", // bar 두께
          },
        },
        fill: {
          opacity: [1, 1, 1, 1], // 투명도 설정
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: [4, 4, 4, 4],
          strokeWidth: [2, 2, 2, 2],
        },

        xaxis: {
          type: "category", // "category" | "datetime" | "numeric"
          tickPlacement: "between",
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          title:{
            text: ""
          }
        },
        yaxis: {
          show: true,
          labels: {
            formatter: function (val) {
              return typeof val === "number" ? val.toFixed(2) : val;
            },
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
        },
        tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (y) {
            if (y != null && !isNaN(y)) {
              return (Math.floor(Number(y) * 1000) / 1000).toString();
            }
            return y;
          },
        },
      },
        legend: {
          position: "bottom",
          labels: {
            useSeriesColors: true,
          },
          markers: {
            shape: "line",
          },
          fontSize: 15,
        },
        grid: {
          show: true,
          borderColor: isDark ? "#FFFFFF" : "#e2e8f0",
          position: "back",
        },
        title: {
          // text: "차트 제목",
          align: "left",
        },
        colors: ["#4669FA", "#50C793", "#c0bd26ff", "#ff0000ff", "#ff8c71"],
      };
      break;

    case "RealtimePowerFactorTrend":
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: [3,2,2,2], // 라인별 두께
          curve: "straight",
        },
        plotOptions: {
          bar: {
            columnWidth: "30%", // bar 두께
          },
        },
        fill: {
          opacity: [1, 1, 1, 1], // 투명도 설정
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: 0,
        },
        xaxis: {
          type: "category", // "category" | "datetime" | "numeric"
          tickPlacement: "between",
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          title:{
            text: ""
          }
        },
        yaxis: {
          show: true,
          labels: {
            formatter: function (val) {
              return typeof val === "number" ? val.toFixed(2) : val;
            },
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
        },
        tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (y) {
            if (y != null && !isNaN(y)) {
              return (Math.floor(Number(y) * 1000) / 1000).toString();
            }
            return y;
          },
        },
      },
        legend: {
          position: "bottom",
          labels: {
            useSeriesColors: true,
          },
          markers: {
            shape: "line",
          },
          fontSize: 15,
        },
        grid: {
          show: true,
          borderColor: isDark ? "#FFFFFF" : "#e2e8f0",
          position: "back",
        },
        title: {
          // text: "차트 제목",
          align: "left",
        },
        colors: ["#4669FA", "#50C793", "#c0bd26ff", "#ff0000ff", "#ff8c71"],
      };
      break;
    
    case "RealtimeElectricityForecast_1point":
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: [1, 1, 1, 1], // 라인별 두께
          curve: "straight",
        },
        plotOptions: {
          bar: {
            columnWidth: "30%", // bar 두께
          },
        },
        fill: {
          opacity: [1, 1, 1, 0.3], // 투명도 설정
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: [4, 0, 0, 0, 0],
          strokeWidth: [2, 0, 0, 0, 0],
        },
        xaxis: {
          type: "category", // "category" | "datetime" | "numeric"
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          title: {
            text: ""
          }
        },
        yaxis: [
          {
            // 왼쪽 Y축
            show: true,
            min: 0,
            labels: {
              formatter: function (val) {
                return typeof val === "number" ? val.toFixed(2) : val;
              },
              style: {
                colors: isDark ? "#CBD5E1" : "#475569",
                fontFamily: "Inter",
              },
            },
          },
          {
            // 오른쪽 Y축
            opposite: true, // 오른쪽에 표시
            show: true,
            min: 0,
            labels: {
              formatter: function (val) {
                return typeof val === "number" ? val.toFixed(2) : val;
              },
              style: {
                colors: isDark ? "#CBD5E1" : "#475569",
                fontFamily: "Inter",
              },
            },
          }
        ],
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return y.toFixed(2);
              }
              return y;
            },
          },
        },
        legend: {
          position: "bottom",
          labels: {
            useSeriesColors: true,
          },
          markers: {
            shape: "line",
          },
          fontSize: 15,
        },
        grid: {
          show: true,
          borderColor: isDark ? "#FFFFFF" : "#e2e8f0",
          position: "back",
        },
        title: {
          // text: "불량 현황",
          align: "left",
        },
        colors: ["#4669FA", "#50C793", "#862400", "#0CE7FA"],
      };
      break;

    case "RealtimeElectricityForecast_4point":
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: [1, 1, 1, 1], // 라인별 두께
          curve: "straight",
        },
        plotOptions: {
          bar: {
            columnWidth: "30%", // bar 두께
          },
        },
        fill: {
          opacity: [1, 1, 1, 0.3], // 투명도 설정
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: 4,
          strokeWidth: 2,
        },
        xaxis: {
          type: "category", // "category" | "datetime" | "numeric"
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          title: {
            text: ""
          }
        },
        yaxis: [
          {
            // 왼쪽 Y축
            show: true,
            min: 0,
            labels: {
              formatter: function (val) {
                return typeof val === "number" ? val.toFixed(2) : val;
              },
              style: {
                colors: isDark ? "#CBD5E1" : "#475569",
                fontFamily: "Inter",
              },
            },
          },
          {
            // 오른쪽 Y축
            opposite: true, // 오른쪽에 표시
            show: true,
            min: 0,
            labels: {
              formatter: function (val) {
                return typeof val === "number" ? val.toFixed(2) : val;
              },
              style: {
                colors: isDark ? "#CBD5E1" : "#475569",
                fontFamily: "Inter",
              },
            },
          }
        ],
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return y.toFixed(2);
              }
              return y;
            },
          },
        },
        legend: {
          position: "bottom",
          labels: {
            useSeriesColors: true,
          },
          markers: {
            shape: "line",
          },
          fontSize: 15,
        },
        grid: {
          show: true,
          borderColor: isDark ? "#FFFFFF" : "#e2e8f0",
          position: "back",
        },
        title: {
          // text: "불량 현황",
          align: "left",
        },
        colors: ["#4669FA", "#50C793", "#862400", "#0CE7FA"],
      };
      break;

    case "carbonemissionforecast":
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: [1, 1, 1, 1], // 라인별 두께
          curve: "straight",
        },
        plotOptions: {
          bar: {
            columnWidth: "30%", // bar 두께
          },
        },
        fill: {
          opacity: [1, 1, 1, 0.3], // 투명도 설정
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: 4,
          strokeWidth: 2,
        },
        xaxis: {
          type: "category", // "category" | "datetime" | "numeric"
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          title: {
            text: ""
          }
        },
        yaxis: [
          {
            // 왼쪽 Y축
            show: true,
            min: 0,
            labels: {
              formatter: function (val) {
                return typeof val === "number" ? val.toFixed(2) : val;
              },
              style: {
                colors: isDark ? "#CBD5E1" : "#475569",
                fontFamily: "Inter",
              },
            },
          },
          {
            // 오른쪽 Y축
            opposite: true, // 오른쪽에 표시
            show: true,
            min: 0,
            labels: {
              formatter: function (val) {
                return typeof val === "number" ? val.toFixed(2) : val;
              },
              style: {
                colors: isDark ? "#CBD5E1" : "#475569",
                fontFamily: "Inter",
              },
            },
          }
        ],
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return y.toFixed(2);
              }
              return y;
            },
          },
        },
        legend: {
          position: "bottom",
          labels: {
            useSeriesColors: true,
          },
          markers: {
            shape: "line",
          },
          fontSize: 15,
        },
        grid: {
          show: true,
          borderColor: isDark ? "#FFFFFF" : "#e2e8f0",
          position: "back",
        },
        title: {
          // text: "불량 현황",
          align: "left",
        },
        colors: ["#4669FA", "#50C793", "#862400", "#0CE7FA"],
      };
      {
        const labels = data?.labels || [];
        const refX = labels.length >= 3 ? labels[labels.length - 3] : null; // -3 인덱스 라벨

        if (refX != null) {
          options.annotations = {
            xaxis: [
              {
                x: refX, // 카테고리 라벨과 정확히 일치해야 함
                borderColor: "#ff0000ff",
                strokeDashArray: 4,
              },
            ],
          };
        }
      }
      break;

    case "RealtimeElectricityForecast":
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: [1, 1, 1, 1], // 라인별 두께
          curve: "smooth",
        },
        plotOptions: {
          bar: {
            columnWidth: "30%", // bar 두께
          },
        },
        fill: {
          opacity: [1, 1, 1, 0.3], // 투명도 설정
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: 0,
        },
        xaxis: {
          type: "category", // "category" | "datetime" | "numeric"
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          title: {
            text: ""
          }
        },
        yaxis: [
          {
            // 왼쪽 Y축
            show: true,
            min: 0,
            labels: {
              formatter: function (val) {
                return typeof val === "number" ? val.toFixed(2) : val;
              },
              style: {
                colors: isDark ? "#CBD5E1" : "#475569",
                fontFamily: "Inter",
              },
            },
          },
          {
            // 오른쪽 Y축
            opposite: true, // 오른쪽에 표시
            show: true,
            min: 0,
            labels: {
              formatter: function (val) {
                return typeof val === "number" ? val.toFixed(2) : val;
              },
              style: {
                colors: isDark ? "#CBD5E1" : "#475569",
                fontFamily: "Inter",
              },
            },
          }
        ],
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y == "number") {
                return y.toFixed(2);
              } else {
                return y;
              }
              return y;
            },
          },
        },
        legend: {
          position: "bottom",
          labels: {
            useSeriesColors: true,
          },
          markers: {
            shape: "line",
          },
          fontSize: 15,
        },
        grid: {
          show: true,
          borderColor: isDark ? "#FFFFFF" : "#e2e8f0",
          position: "back",
        },
        title: {
          // text: "불량 현황",
          align: "left",
        },
        colors: ["#4669FA", "#50C793", "#862400", "#0CE7FA"],
      };
      break;
      
    case "dashboard_main":
      // 최소값 보정
      const allY = (Array.isArray(series) ? series : [])
        .flatMap(s => (Array.isArray(s?.data) ? s.data : []))
        .map(v => Number(v))
        .filter(v => Number.isFinite(v));

      const dataMin = allY.length ? Math.min(...allY) : 0;
      const pad     = allY.length ? Math.max(Math.abs(dataMin) * 0.1, 1) : 1; // 최소 1 보장
      const yMin    = dataMin - pad;
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: [1, 1, 1, 1], // 라인별 두께
          curve: "straight",
        },
        plotOptions: {
          bar: {
            columnWidth: "30%", // bar 두께
          },
        },
        fill: {
          opacity: [1, 1, 1, 0.3], // 투명도 설정
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: [4, 0],
          strokeWidth: [2, 0],
        },
        xaxis: {
          type: "category", // "category" | "datetime" | "numeric"
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          title: {
            text: ""
          }
        },
        yaxis: [
          {
            // 왼쪽 Y축
            show: true,
            min: yMin,
            labels: {
              formatter: function (val) {
                return typeof val === "number" ? val.toFixed(2) : val;
              },
              style: {
                colors: isDark ? "#CBD5E1" : "#475569",
                fontFamily: "Inter",
              },
            },
          }
        ],
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return y.toFixed(2);
              }
              return y;
            },
          },
        },
        legend: {
          position: "bottom",
          labels: {
            useSeriesColors: true,
          },
          markers: {
            shape: "line",
          },
          fontSize: 15,
        },
        grid: {
          show: true,
          borderColor: isDark ? "#FFFFFF" : "#e2e8f0",
          position: "back",
        },
        title: {
          // text: "불량 현황",
          align: "left",
        },
        colors: ["#4669FA", "#50C793", "#862400", "#0CE7FA"],
      };
      break;
    case "dashboard_chart2":
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: [1, 1, 1, 1], // 라인별 두께
          curve: "straight",
        },
        plotOptions: {
          bar: {
            columnWidth: "30%", // bar 두께
          },
        },
        fill: {
          opacity: [1, 1, 1, 0.3], // 투명도 설정
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: [4, 0, 0, 0],
          strokeWidth: [2, 0, 0, 0]
        },
        xaxis: {
          type: "category", // "category" | "datetime" | "numeric"
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          title: {
            text: ""
          }
        },
        yaxis: [
          {
            // 왼쪽 Y축
            show: true,
            min: 0,
            labels: {
              formatter: function (val) {
                return typeof val === "number" ? val.toFixed(2) : val;
              },
              style: {
                colors: isDark ? "#CBD5E1" : "#475569",
                fontFamily: "Inter",
              },
            },
          }
        ],
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return y.toFixed(2);
              }
              return y;
            },
          },
        },
        legend: {
          position: "bottom",
          labels: {
            useSeriesColors: true,
          },
          markers: {
            shape: "line",
          },
          fontSize: 15,
        },
        grid: {
          show: true,
          borderColor: isDark ? "#FFFFFF" : "#e2e8f0",
          position: "back",
        },
        title: {
          // text: "불량 현황",
          align: "left",
        },
        colors: ["#4669FA", "#50C793", "#862400", "#0CE7FA"],
      };
      break;
    
    case "CarbonEmissionForecast":
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: [1, 1, 1, 1], // 라인별 두께
          curve: "smooth",
        },
        plotOptions: {
          bar: {
            columnWidth: "30%", // bar 두께
          },
        },
        fill: {
          opacity: [1, 1, 1, 0.3], // 투명도 설정
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: 0,
        },
        xaxis: {
          type: "category", // "category" | "datetime" | "numeric"
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          title: {
            text: ""
          }
        },
        yaxis: [
          {
            // 왼쪽 Y축
            show: true,
             min: 0,  
            labels: {
              formatter: function (val) {
                return typeof val === "number" ? val.toFixed(2) : val;
              },
              style: {
                colors: isDark ? "#CBD5E1" : "#475569",
                fontFamily: "Inter",
              },
            },
          },
          {
            // 오른쪽 Y축
            opposite: true, // 오른쪽에 표시
            show: true,
            labels: {
              formatter: function (val) {
                return typeof val === "number" ? val.toFixed(2) : val;
              },
              style: {
                colors: isDark ? "#CBD5E1" : "#475569",
                fontFamily: "Inter",
              },
            },
          }
        ],
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return y.toFixed(2);
              }
              return y;
            },
          },
        },
        legend: {
          position: "bottom",
          labels: {
            useSeriesColors: true,
          },
          markers: {
            shape: "line",
          },
          fontSize: 15,
        },
        grid: {
          show: true,
          borderColor: isDark ? "#FFFFFF" : "#e2e8f0",
          position: "back",
        },
        title: {
          // text: "탄소 배추량 추이 및 예측",
          align: "left",
        },
        colors: ["#4669FA", "#b2dbcaff", "#862400", "#0CE7FA"],
      };
      break;
    case "TemperatureTrend":
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: [1, 1, 1, 1], // 라인별 두께
          curve: "straight",
        },
        plotOptions: {
          bar: {
            columnWidth: "30%", // bar 두께
          },
        },
        fill: {
          opacity: [1, 1, 1, 0.3], // 투명도 설정
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: 4,
          strokeWidth: 2,
        },
        xaxis: {
          type: "category", // "category" | "datetime" | "numeric"
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          title: {
            text: ""
          }
        },
        yaxis: {
          show: true,
          min: 0,
          labels: {
            formatter: function (val) {
              return typeof val === "number" ? val.toFixed(2) : val;
            },
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (y == null || typeof y !== 'number') {
                return y;
              }
              return y.toFixed(2);
            },
          },
        },
        legend: {
          position: "bottom",
          labels: {
            useSeriesColors: true,
          },
          markers: {
            shape: "line",
          },
          fontSize: 15,
        },
        grid: {
          show: true,
          borderColor: isDark ? "#FFFFFF" : "#e2e8f0",
          position: "back",
        },
        title: {
          // text: "불량 현황",
          align: "left",
        },
        colors: ["#4669FA", "#50C793", "#862400", "#0CE7FA", "#e79417ff"],
      };
      break;

    case "PowerQualityAnalysis":
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: [1, 1, 1, 1], // 라인별 두께
          curve: "smooth",
        },
        plotOptions: {
          bar: {
            columnWidth: "30%", // bar 두께
          },
        },
        fill: {
          opacity: [1, 1, 1, 0.3], // 투명도 설정
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: [4, 4, 0, 0],
          strokeWidth: [2, 2, 0, 0],
        },
        xaxis: {
          type: "category", // "category" | "datetime" | "numeric"
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          title: {
            text: ""
          }
        },
        yaxis: [
          {
            // 왼쪽 Y축
            show: true,
            min: 0,
            labels: {
              formatter: function (val) {
                return typeof val === "number" ? val.toFixed(2) : val;
              },
              style: {
                colors: isDark ? "#CBD5E1" : "#475569",
                fontFamily: "Inter",
              },
            },
          },
          {
            // 오른쪽 Y축
            opposite: true, // 오른쪽에 표시
            show: true,
            min: data.yaxis_r_min? data.yaxis_r_min : 0,
            max: data.yaxis_r_max? data.yaxis_r_max : 1000,
            labels: {
              formatter: function (val) {
                return typeof val === "number" ? val.toFixed(1) : val;
              },
              style: {
                colors: isDark ? "#CBD5E1" : "#475569",
                fontFamily: "Inter",
              },
            },
          }
        ],
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return y.toFixed(2);
              }
              return y;
            },
          },
        },
        legend: {
          position: "bottom",
          labels: {
            useSeriesColors: true,
          },
          markers: {
            shape: "line",
          },
          fontSize: 15,
        },
        grid: {
          show: true,
          borderColor: isDark ? "#FFFFFF" : "#e2e8f0",
          position: "back",
        },
        title: {
          // text: "불량 현황",
          align: "left",
        },
        colors: ["#4669FA", "#50C793", "#862400", "#0CE7FA"],
      };
      break;
    case "TemperatureStatus":
      options = {
        chart: {
          stacked: false,
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: [3,2,2,2], // 라인별 두께
          curve: "straight",
        },
        plotOptions: {
          bar: {
            columnWidth: "30%", // bar 두께
          },
        },
        fill: {
          opacity: [1, 1, 1, 1], // 투명도 설정
          gradient: {
            inverseColors: false,
            shade: "light",
            type: "vertical",
            opacityFrom: 0.85,
            opacityTo: 0.55,
            stops: [0, 100, 100, 100],
          },
        },
        labels: data.labels,
        markers: {
          size: 0,
        },
        xaxis: {
          type: "category", // "category" | "datetime" | "numeric"
          tickPlacement: "between",
          tickAmount: Math.floor(data.labels.length / 5),
          labels: {
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          title:{
            text: ""
          }
        },
        yaxis: {
          show: true,
          labels: {
            formatter: function (val) {
              return typeof val === "number" ? val.toFixed(2) : val;
            },
            style: {
              colors: isDark ? "#CBD5E1" : "#475569",
              fontFamily: "Inter",
            },
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return y.toFixed(2);
              }
              return y;
            },
          },
        },
        legend: {
          position: "bottom",
          labels: {
            useSeriesColors: true,
          },
          markers: {
            shape: "line",
          },
          fontSize: 15,
        },
        grid: {
          show: true,
          borderColor: isDark ? "#FFFFFF" : "#e2e8f0",
          position: "back",
        },
        title: {
          // text: "차트 제목",
          align: "left",
        },
        colors: ["#4669FA", "#50C793", "#c0bd26ff", "#ff0000ff", "#ff8c71"],
      };
      break;

    default:
      console.warn(`Unknown chart label: ${data.label}`);
  }

  return (
    <div>
      <Chart options={options} series={series} type="line" height={height} />
    </div>
  );
};

export default MixedChart;
