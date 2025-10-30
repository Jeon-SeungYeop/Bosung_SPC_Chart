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

const LineChart = ({ line_data, height, label = "", labelInterval = 30 }) => {
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
            showLine: false,          // 선 감추고 점만 표시
            borderWidth: 0,           // 안전하게 라인 두께 제거
            backgroundColor: hexToRGB(colors.primary, 1),
            borderColor: colors.primary,
            barThickness: 40,
            pointRadius: 3,
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
            showLine: false,          // 선 감추고 점만 표시
            borderWidth: 0,           // 안전하게 라인 두께 제거
            backgroundColor: hexToRGB(colors.success, 1),
            borderColor: colors.success,
            barThickness: 40,
            pointRadius: 3,
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
            showLine: false,          // 선 감추고 점만 표시
            borderWidth: 0,           // 안전하게 라인 두께 제거
            backgroundColor: hexToRGB(colors.danger, 1),
            borderColor: colors.danger,
            barThickness: 40,
            pointRadius: 3,
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
            showLine: false,          // 선 감추고 점만 표시
            borderWidth: 0,           // 안전하게 라인 두께 제거
            backgroundColor: hexToRGB(colors.secondary, 1),
            borderColor: colors.secondary,
            barThickness: 40,
            pointRadius: 3,
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

  // 각 라인(데이터셋)마다 일정 간격으로 범례 라벨을 점 옆에 표시하는 플러그인
  const pointLegendPlugin = useMemo(() => ({
    id: "pointLegendPlugin",
    afterDatasetsDraw: (chart, _args, pluginOptions) => {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;

      const interval =
        pluginOptions?.interval != null ? pluginOptions.interval : labelInterval;

      chart.data.datasets.forEach((ds, di) => {
        const meta = chart.getDatasetMeta(di);
        if (!meta || meta.hidden) return;

        const labelText = ds.label ?? `Series ${di + 1}`;
        const pts = meta.data || [];

        for (let i = 1; i < pts.length; i += 1) {
          if (i % interval !== 0) continue;

          const el = pts[i];
          if (!el) continue;

          const { x, y } = el.getProps(["x", "y"], true);
          if (
            x < chartArea.left ||
            x > chartArea.right ||
            y < chartArea.top ||
            y > chartArea.bottom
          ) {
            continue;
          }

          ctx.save();
          ctx.font = "bold 11px Arial";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";

          // 라벨 색: borderColor > backgroundColor > 테마 기본
          const color =
            ds.borderColor ||
            ds.backgroundColor ||
            (isDark ? "#cbd5e1" : "#475569");
          ctx.fillStyle = Array.isArray(color) ? color[0] : color;

          // 라벨이 점과 겹치지 않도록 데이터셋별로 교차 오프셋
          const offsetY = di % 2 === 0 ? -12 : 12;

          ctx.fillText(labelText, x + 6, y + offsetY);
          ctx.restore();
        }
      });
    },
  }), [isDark, labelInterval]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Chart NO.EH00001",
        position: "top",
        align: "center",
        color: isDark ? "#cbd5e1" : "#475569",
        font: { size: 16, weight: "bold" },
        padding: { top: 6, bottom: 12 },
      },
      legend: {
        position: "bottom",
        align: "center",
        labels: {
          color: isDark ? "#cbd5e1" : "#475569",
        },
      },
      pointLegendPlugin: {
        interval: labelInterval,
      },
    },
    elements: {
      line: { borderWidth: 0 },
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
      <Line key={label} options={options} data={data} plugins={[datePlugin, pointLegendPlugin]} />
    </div>
  );
};

export default LineChart;