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

const LineChart = ({ line_data, height, label = "", labelInterval = 100 }) => {
  const [isDark] = useDarkMode();

  // 1cm ≒ 96 / 2.54 px
  const CM_TO_PX = 96 / 2.54;
  const GRID_SPACING_CM = 4;
  const GRID_SPACING_PX = GRID_SPACING_CM * CM_TO_PX; // ≒ 189px
  
  // 차트 타이틀
  const chartTitleText = "CHART NO. EH                                        (0-1200)";

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

  // y 범위: 최소 = min * 0.8 (0보다 작으면 0), 최대 = max * 1.2
  const { yMin, yMax } = useMemo(() => {
    const ds = Array.isArray(line_data?.datasets) ? line_data.datasets : [];
    const all = ds
      .flatMap((d) => (Array.isArray(d?.data) ? d.data : []))
      .filter((v) => typeof v === "number" && !isNaN(v));

    // 데이터 없을 때 기본 범위
    if (all.length === 0) return { yMin: 0, yMax: 90 };

    let min = Math.min(...all);
    let max = Math.max(...all);

    // 전부 같은 값이면 최소 span 확보
    if (min === max) {
      min -= 10;
      max += 10;
    }

    // 스케일 적용
    let scaledMin = min * 0.8;
    let scaledMax = max * 1.1;

    // 최소값 0 이하이면 0까지만
    if (scaledMin < 0) scaledMin = 0;

    // 30 단위로 바닥/천장 정렬
    const floor30 = Math.floor(scaledMin / 30) * 30;
    let ceil30 = Math.ceil(scaledMax / 30) * 30;

    // 최소/최대가 같아지지 않도록 한 칸이라도 확보
    if (ceil30 <= floor30) {
      ceil30 = floor30 + 30;
    }

    return { yMin: floor30, yMax: ceil30 };
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

        const x = firstPoint.x - 30;
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
    () => {
      const datasetIntervals = [100, 103, 106, 109, 112, 115];

      // 정의된 간격 전체 (공배수 체크용)
      const definedIntervals = datasetIntervals.filter((v) => typeof v === "number");

      return {
        id: "pointLegendPlugin",
        afterDatasetsDraw: (chart, _args, pluginOptions) => {
          const { ctx, chartArea } = chart;
          if (!chartArea) return;

          chart.data.datasets.forEach((ds, di) => {
            const meta = chart.getDatasetMeta(di);
            if (!meta || meta.hidden) return;

            const pts = meta.data || [];
            if (!pts.length) return;

            // 각 dataset 별 간격
            const interval =
              datasetIntervals[di] ??
              pluginOptions?.interval ?? // 옵션에서 넘어온 값
              labelInterval; // props 기본값

            // "온도계1"가 아니라 숫자만 (1, 2, 3, ...)
            const labelText = String(di + 1);

            for (let i = 1; i < pts.length; i += 1) {
              if (i % interval !== 0) continue;

              // ---- 공배수(여러 간격에 모두 걸리는 지점)에서는 표시 안 함 ----
              const isCommonMultiple = definedIntervals.some((iv, idx) => {
                if (idx === di) return false;     // 자기 자신의 간격은 제외
                if (!iv) return false;
                return i % iv === 0;              // 다른 간격의 배수도 동시에 되는지
              });
              if (isCommonMultiple) continue;
              // -------------------------------------------------------

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
      };
    },
    [isDark, labelInterval]
  );

  // y축 옆 세로 legend
  const rotatedLegendPlugin = useMemo(
    () => ({
      id: "rotatedLegendPlugin",
      afterDraw: (chart) => {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea) return;

        const yScale = scales?.y;
        if (!yScale) return;

        const datasets = chart.data?.datasets || [];
        if (!datasets.length) return;

        const boxSize = 12;
        const spacing = 70; // 각 legend 간 간격

        const items = datasets.map((ds, idx) => ({
          label: ds.label ?? `Series ${idx + 1}`,
          color: Array.isArray(ds.borderColor)
            ? ds.borderColor[0]
            : ds.borderColor || ds.backgroundColor || (isDark ? "#cbd5e1" : "#475569"),
        }));

        //  세로 중앙 기준으로 배치 (index 0 = 맨 아래)
        const centerY = (chartArea.top + chartArea.bottom) / 2;
        const totalHeight = (items.length - 1) * spacing;
        const bottomY = centerY + totalHeight / 2; // 온도계1(0번)이 위치할 y

        // 우측 x 위치
        const legendX = yScale.right + 6;

        items.forEach((item, index) => {
          // index 0이 맨 아래, 위로 올라가며 쌓임
          const y = bottomY - index * spacing;

          // 색상 박스
          ctx.save();
          ctx.fillStyle = item.color;
          ctx.strokeStyle = isDark ? "#1e293b" : "#cbd5e1";
          ctx.lineWidth = 1;
          ctx.fillRect(legendX, y - boxSize / 2, boxSize, boxSize);
          ctx.strokeRect(legendX, y - boxSize / 2, boxSize, boxSize);
          ctx.restore();

          // 텍스트 (박스 위쪽, 세로)
          ctx.save();

          const cx = legendX + boxSize / 2;
          const cy = y;

          ctx.translate(cx, cy);
          ctx.rotate(-Math.PI / 2);

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "bold 14px Arial";
          ctx.fillStyle = isDark ? "#cbd5e1" : "#475569";

          const labelGap = boxSize + 20; // 박스와 텍스트 사이 간격
          ctx.fillText(item.label, labelGap, 0);

          ctx.restore();
        });
      },
    }),
    [isDark]
  );

  // 0~23 사이 랜덤 시(hour) 생성
  const randomStartHour = useMemo(
    () => Math.floor(Math.random() * 24), // 0 ~ 23 정수
    [line_data]
  );

  const parseTimeToSeconds = (timeStr) => {
    const match = /^(\d+):(\d{2}):(\d{2})$/.exec(String(timeStr));
    if (!match) return null;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // 30분 간격 그리드가 5cm 간격으로 보이도록 차트 width 계산
  const chartWidth = useMemo(() => {
    const labels = line_data?.labels ?? [];
    const times = labels
      .map((lbl) => parseTimeToSeconds(lbl))
      .filter((v) => typeof v === "number");

    if (times.length < 2) {
      // 데이터가 거의 없으면 그냥 100% 폭 사용
      return "100%";
    }

    const minT = Math.min(...times);
    const maxT = Math.max(...times);

    // 30분(1800초) 간 그리드 개수
    const gridCount = Math.max(
      1,
      Math.floor((maxT - minT) / (3600 * 0.5)) + 1 // 0.5h = 1800초
    );

    const widthPx = gridCount * GRID_SPACING_PX;
    return widthPx; // 숫자면 style width에서 px로 인식됨
  }, [line_data]);

  // x축 기준 "표시되는 시간 % 6 === 0" 인 곳에만 온도 축(반복 y라벨) 표시
  const yAxisRepeatLabelPlugin = useMemo(
    () => ({
      id: "yAxisRepeatLabelPlugin",
      afterDraw: (chart, _args, pluginOptions) => {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea) return;

        const xScale = scales?.x;
        const yScale = scales?.y;
        if (!xScale || !yScale) return;

        const labels = chart.data?.labels || [];
        const xPositions = [];

        const timeOffset = pluginOptions?.timeOffset ?? 0;

        labels.forEach((lbl, idx) => {
          const totalSeconds = parseTimeToSeconds(lbl);
          if (totalSeconds === null) return;

          // 정시만 사용 (hh:00:00)
          if (totalSeconds % 3600 !== 0) return;

          const hours = Math.floor(totalSeconds / 3600);
          const displayHour = (hours + timeOffset) % 24;

          // "표시되는 시간 % 6 === 0" 인 곳만
          if (displayHour % 6 !== 0) return;

          const x = xScale.getPixelForValue(idx);
          if (x < chartArea.left || x > chartArea.right) return;
          xPositions.push(x);
        });

        if (!xPositions.length) return;

        const yTicks = yScale.ticks || [];

        ctx.save();
        ctx.font = "12px Arial";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isDark ? "#cbd5e1" : "#475569";

        const offsetX = 3;

        xPositions.forEach((xPos) => {
          yTicks.forEach((tick) => {
            const value = tick.value;
            const y = yScale.getPixelForValue(value);
            if (y < chartArea.top || y > chartArea.bottom) return;

            const v = Math.round(Number(value));
            if (v % 100 !== 0) return;

            const label = `${v}°C`;
            ctx.fillText(label, xPos - offsetX, y);
          });
        });

        ctx.restore();
      },
    }),
    [isDark]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          right: 30,
          top: 25,
        },
      },
      plugins: {
        title: {
          display: false,
          text: chartTitleText,
          //position: "top",
          //align: "center",
          //color: isDark ? "#cbd5e1" : "#475569",
          //font: { size: 16, weight: "bold" },
          //padding: { top: 6, bottom: 12 },
        },
        legend: {
          display: false,
          //position: "right",
          //align: "center",
          //labels: {
          //  color: isDark ? "#cbd5e1" : "#475569",
          //},
        },
        pointLegendPlugin: {
          interval: labelInterval,
        },
        yAxisRepeatLabelPlugin: {
          timeOffset: randomStartHour,
        },
      },
      elements: {
        line: { borderWidth: 0 },
      },
      scales: {
        y: {
          position: "right",
          min: 0,
          max: 1200,
          bounds: "ticks",
          grid: {
            color: (ctx) => {
              const value = ctx?.tick?.value;
              if (typeof value !== "number") {
                return isDark ? "#334155" : "#e2e8f0";
              }

              // 100단위(0, 100, 200, ...) 격자는 조금 더 진하게
              if (value % 100 === 0) {
                return isDark ? "#000000ff" : "#94a3b8";
              }

              // 나머지는 기존 색
              return isDark ? "#334155" : "#e2e8f0";
            },
          },
          ticks: {
            display: false,
            autoSkip: false,
            stepSize: 10,
            precision: 0,
            color: isDark ? "#cbd5e1" : "#475569",
            callback: function (value) {
              const v = Math.round(Number(value));
              return v % 100 === 0 ? `${v}°C` : "";
            },
          },
        },
        x: {
          reverse: true,
          grid: {
            color: (ctx) => {
              const idx = ctx?.tick?.value;
              const labels = ctx?.chart?.data?.labels ?? [];
              const raw = labels[idx];
              const totalSeconds = parseTimeToSeconds(raw);

              if (totalSeconds === null) return "transparent";

              // 30분(1800초) 간격마다 그리드 표시
              const show = totalSeconds % 1800 === 0;
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

              const totalSeconds = parseTimeToSeconds(label);
              if (totalSeconds === null) return "";

              // 1시간(3600초) 간격마다 시간 표시
              if (totalSeconds % 3600 === 0) {
                const hours = Math.floor(totalSeconds / 3600);
                // 랜덤 시작 시각을 기준으로 고정
                const cal_hours = (hours + randomStartHour) % 24;
                return `${cal_hours}`;
              }
              return "";
            },
          },
        },
      },
    }),
    [isDark, labelInterval, yMin, yMax, randomStartHour]
  );

  return (
    <div style={{ overflowX: "auto" }}>
      {/* 실제 chart.js가 차지할 영역: 높이 + 계산된 width */}
      <div style={{ height: height ?? 350, width: chartWidth }}>
        <Line
          key={label}
          options={options}
          data={data}
          plugins={[datePlugin, rotatedLegendPlugin, yAxisRepeatLabelPlugin, pointLegendPlugin]}
        />
      </div>
    </div>
  );
};

export default LineChart;