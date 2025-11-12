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

const LineChart = ({ line_data, height, label = "", labelInterval = 8000 }) => {
  const [isDark] = useDarkMode();

  // 색 지정
  const palette = useMemo(
    () => [
      { bg: hexToRGB(colors.primary, 1), border: colors.primary },
      { bg: hexToRGB(colors.success, 1), border: colors.success },
      { bg: hexToRGB(colors.danger, 1), border: colors.danger },
      { bg: hexToRGB(colors.secondary, 1), border: colors.secondary },
      colors.info ? { bg: hexToRGB(colors.info, 1), border: colors.info } : null,
      colors.warning ? { bg: hexToRGB(colors.warning, 1), border: colors.warning } : null,
    ].filter(Boolean),
    []
  );

  // 차트 data (동적 datasets)
  const data = useMemo(() => {
    const labels = line_data?.labels ?? [];
    const insets = Array.isArray(line_data?.datasets) ? line_data.datasets : [];

    const ds = insets.map((dsItem, i) => {
      const { bg, border } = palette[i % palette.length];
      return {
        label: dsItem.label ?? `Series ${i + 1}`,
        data: dsItem.data ?? [],
        fill: false,
        showLine: false,
        borderWidth: 0,
        backgroundColor: bg,
        borderColor: border,
        barThickness: 40,
        pointRadius: 1,
        pointHoverRadius: 3,
        pointHoverBorderWidth: 3,
        pointBorderColor: "transparent",
        tension: 0.5,
        pointStyle: "circle",
        pointShadowOffsetX: 1,
        pointShadowOffsetY: 1,
        pointShadowBlur: 5,
      };
    });

    return { labels, datasets: ds };
  }, [line_data, palette]);

  // yMin/yMax 먼저 계산 (10 단위로 바닥/천장 맞춤)
  const { yMin, yMax } = useMemo(() => {
    const ds = Array.isArray(line_data?.datasets) ? line_data.datasets : [];
    const all = ds
      .flatMap((d) => (Array.isArray(d?.data) ? d.data : []))
      .filter((v) => typeof v === "number" && !isNaN(v));

    // 데이터 없을 때 기본 범위
    if (all.length === 0) return { yMin: 0, yMax: 100 };

    const min = Math.min(...all);
    const max = Math.max(...all);

    const floor10 = Math.floor(min / 10) * 10;
    const ceil10 = Math.ceil(max / 10) * 10;

    if (floor10 === ceil10) {
      return { yMin: floor10 - 10, yMax: ceil10 + 10 };
    }
    return { yMin: floor10, yMax: ceil10 };
  }, [line_data]);

  // 첫 포인트 상단 라벨
  const datePlugin = useMemo(
    () => ({
      id: "dateDisplay",
      afterDraw: (chart) => {
        const ctx = chart.ctx;
        const dataset = chart.data.datasets?.[0];
        if (!dataset || !dataset.data || dataset.data.length === 0) return;

        const meta = chart.getDatasetMeta(0);
        const firstPoint = meta?.data?.[0];
        if (!firstPoint) return;

        const x = firstPoint.x + 30;
        const y = firstPoint.y - 15;

        ctx.save();
        ctx.font = "bold 13px Arial";
        ctx.fillStyle = isDark ? "#cbd5e1" : "#475569";
        ctx.textAlign = "center";
        ctx.fillText(label, x, y);
        ctx.restore();
      },
    }),
    [label, isDark]
  );

  // 간헐적 라벨
  const pointLegendPlugin = useMemo(
    () => ({
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

            const color =
              ds.borderColor || ds.backgroundColor || (isDark ? "#cbd5e1" : "#475569");
            ctx.fillStyle = Array.isArray(color) ? color[0] : color;

            const offsetY = di % 2 === 0 ? -12 : 12;
            ctx.fillText(labelText, x + 6, y + offsetY);
            ctx.restore();
          }
        });
      },
    }),
    [isDark, labelInterval]
  );

  const options = useMemo(
    () => ({
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
          min: yMin,
          max: yMax,
          bounds: "ticks",
          grid: {
            color: isDark ? "#334155" : "#e2e8f0",
          },
          ticks: {
            autoSkip: false,
            stepSize: 10,      // 그리드/눈금 간격 10
            precision: 0,
            color: isDark ? "#cbd5e1" : "#475569",
            // 라벨은 30° 단위만 표시
            callback: function (value) {
              const v = Math.round(Number(value));
              return v % 30 === 0 ? `${v}°C` : "";
            },
          },
        },
        x: {
          grid: {
            // HH:MM:SS 라벨 기준 30분 간격 그리드만 보이게
            color: (ctx) => {
              const idx = ctx?.tick?.value;
              const labels = ctx?.chart?.data?.labels ?? [];
              const raw = labels[idx];
              const m = /^(\d{2}):(\d{2}):(\d{2})$/.exec(String(raw));
              if (!m) return "transparent";
              const minutes = parseInt(m[2], 10);
              const seconds = parseInt(m[3], 10);
              const show = seconds === 0 && minutes % 30 === 0;
              return show ? (isDark ? "#334155" : "#e2e8f0") : "transparent";
            },
          },
          ticks: {
            color: isDark ? "#cbd5e1" : "#475569",
            maxRotation: 0,
            autoSkip: false,
            callback: function (value) {
              const label = this.getLabelForValue(value);
              if (!label) return "";
              const match = /^(\d{2}):(\d{2}):(\d{2})$/.exec(label);
              if (!match) return "";
              const minutes = parseInt(match[2], 10);
              const seconds = parseInt(match[3], 10);
              return seconds === 0 && minutes % 30 === 0 ? label.substring(0, 5) : "";
            },
          },
        },
      },
    }),
    [isDark, labelInterval, yMin, yMax]
  );

  return (
    <div style={{ height: height ?? 350 }}>
      <Line key={label} options={options} data={data} plugins={[datePlugin, pointLegendPlugin]} />
    </div>
  );
};

export default LineChart;