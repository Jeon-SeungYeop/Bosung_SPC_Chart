import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { colors, hexToRGB } from "@/services/constant/data";
import useDarkMode from "@/services/hooks/useDarkMode";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ line_data, height, label = "" }) => {
  const [isDark] = useDarkMode();
  var data = {};
  switch (line_data.label) {
    case 'power-predict':  // sample 화면
      data = {
        labels: line_data.labels,
        datasets: [
          {
            label: line_data.datasets[0].label,
            data: line_data.datasets[0].data,
            fill: false,
            backgroundColor: hexToRGB(colors.primary, 1),
            borderColor: colors.primary,
            barThickness: 40,
            pointRadius: 1,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 5,
            pointBorderColor: "transparent",
            tension: 0.5,
            pointStyle: "circle",
            pointShadowOffsetX: 1,
            pointShadowOffsetY: 1,
            pointShadowBlur: 5,
          },
          {
            label: line_data.datasets[1].label,
            data: line_data.datasets[1].data,
            fill: false,
            backgroundColor: hexToRGB(colors.success, 1),
            borderColor: colors.success,
            barThickness: 40,
            pointRadius: 1,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 5,
            pointBorderColor: "transparent",
            tension: 0.5,
            pointStyle: "circle",
            pointShadowOffsetX: 1,
            pointShadowOffsetY: 1,
            pointShadowBlur: 5,
          },
          {
            label: line_data.datasets[2].label,
            data: line_data.datasets[2].data,
            fill: false,
            backgroundColor: hexToRGB(colors.danger, 1),
            borderColor: colors.danger,
            barThickness: 40,
            pointRadius: 1,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 5,
            pointBorderColor: "transparent",
            tension: 0.5,
            pointStyle: "circle",
            pointShadowOffsetX: 1,
            pointShadowOffsetY: 1,
            pointShadowBlur: 5,
          },
          {
            label: line_data.datasets[3].label,
            data: line_data.datasets[3].data,
            fill: false,
            backgroundColor: hexToRGB(colors.secondary, 1),
            borderColor: colors.secondary,
            barThickness: 40,
            pointRadius: 1,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 5,
            pointBorderColor: "transparent",
            tension: 0.5,
            pointStyle: "circle",
            pointShadowOffsetX: 1,
            pointShadowOffsetY: 1,
            pointShadowBlur: 5,
          },
        ],
      };
      break;
    
    default:
      data = {
        labels: [],
        datasets: [],
      };
      break;
  }

  // 입력 표시 플러그인
  const datePlugin = useMemo(() => ({
    id: 'dateDisplay',
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const dataset = chart.data.datasets[0]; // 첫번째 데이터셋
      
      if (!dataset || !dataset.data || dataset.data.length === 0) return;
      
      // 첫번째 데이터 포인트의 메타데이터 가져오기
      const meta = chart.getDatasetMeta(0);
      const firstPoint = meta.data[0];
      
      if (!firstPoint) return;
      
      // 첫번째 포인트의 좌표
      const x = firstPoint.x + 30;
      const y = firstPoint.y - 15; // 포인트 위쪽에 표시
      
      ctx.save();
      ctx.font = 'bold 13px Arial';
      ctx.fillStyle = isDark ? '#cbd5e1' : '#475569';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y);
      ctx.restore();
    }
  }), [label, isDark]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDark ? "#cbd5e1" : "#475569",
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: isDark ? "#334155" : "#e2e8f0",
        },
        ticks: {
          color: isDark ? "#cbd5e1" : "#475569",
        },
      },
      x: {
        grid: {
          color: isDark ? "#334155" : "#e2e8f0",
        },
        ticks: {
          color: isDark ? "#cbd5e1" : "#475569",
        },
      },
    },
  };

  return (
    <div style={{ height: height ?? 350 }}>
      <Line key={label} options={options} data={data} plugins={[datePlugin]} />
    </div>
  );
};

export default LineChart;