import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import useDarkMode from "@/services/hooks/useDarkMode";
import { colors } from "@/services/constant/data";
import { useNavigate } from "react-router-dom";
// CustomTooltip 컴포넌트
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-md">
        {payload.map((entry, index) => (
          <div key={index}>{`${entry.dataKey}: ${entry.value}%`}</div>
        ))}
      </div>
    );
  }
  return null;
};

const ReLineChart = ({ data }) => {
  const [isDark] = useDarkMode();
  const navigate = useNavigate();
  // 점 클릭 시 실행되는 함수
  const handleDotClick = (data, event) => {
    if (data && event) {
      const { dataKey, value } = event;
      navigate(`/CommonCodeGroup?dataKey=${dataKey}&value=${value}`);
    }
  };

  // 공통 Tooltip 설정
  const tooltipProps = {
    content: <CustomTooltip />,
  };

  // 공통 Dot 설정
  const dotProps = {
    cursor: "pointer",
    strokeWidth: 2,
    onClick: handleDotClick,
  };
  const activeDotProps = {
    r: 8,
    cursor: "pointer",
    onClick: handleDotClick,
  };

  const commonLineProps = {
    dot: dotProps,
    activeDot: activeDotProps,
    strokeWidth: 2,
  };

  return (
    <div>
      <ResponsiveContainer height={350}>
        <LineChart data={data.data}>
          <CartesianGrid
            strokeDasharray="1 1"
            stroke={isDark ? "#334155" : "#e2e8f0"}
            vertical={data.label === "trend-2" ? false : undefined}
          />

          <XAxis
            dataKey="time"
            tick={{ fill: isDark ? "#cbd5e1" : "#64748b" }}
            tickLine={{ stroke: isDark ? "#cbd5e1" : "#64748b" }}
            stroke={isDark ? "#334155" : "#e2e8f0"}
            label={
              data.label === "trend-2"
                ? { value: "Time", position: "insideBottom", offset: 0 }
                : undefined
            }
            padding={data.label === "trend-2" ? { left: 50, right: 50 } : undefined}
          />

          <YAxis
            tick={{ fill: isDark ? "#cbd5e1" : "#64748b" }}
            tickLine={{ stroke: isDark ? "#cbd5e1" : "#64748b" }}
            stroke={isDark ? "#334155" : "#e2e8f0"}
            domain={
              data.label === "power-state"
                ? ["dataMin", "dataMax"]
                : data.label === "power-state-2"
                ? [250, 400]
                : data.label === "trend-1" || data.label === "trend-2"
                ? [0, 2]
                : undefined
            }
            axisLine={data.label.startsWith("trend") ? false : undefined}
            label={
              data.label === "trend-2"
                ? { value: "℃%/KW X 10", angle: -90, position: "insideLeft" }
                : undefined
            }
          />

          <Tooltip {...tooltipProps} />

          <Legend
            verticalAlign="top"
            height={36}
            iconType={
              data.label === "power-state-2" || data.label === "trend-2"
                ? "plainline"
                : data.label === "trend-1"
                ? "line"
                : undefined
            }
            iconSize={data.label === "power-state-2" || data.label === "trend-2" ? 20 : undefined}
          />

          {data.label === "dashboard" && (
            <>
              <Line dataKey="Max" stroke={colors.primary} {...commonLineProps} />
              <Line dataKey="Min" stroke={colors.secondary} {...commonLineProps} />
              <Line dataKey="Pred" stroke={colors.info} {...commonLineProps} />
            </>
          )}

          {data.label === "power-state" && (
            <>
              <Line dataKey="R" stroke={colors.primary} {...commonLineProps} />
              <Line dataKey="S" stroke={colors.warning} {...commonLineProps} />
              <Line dataKey="T" stroke="#EF1111" {...commonLineProps} />
            </>
          )}

          {data.label === "power-state-2" && (
            <>
              <Line dataKey="R" stroke={colors.primary} {...commonLineProps} />
              <Line dataKey="S" stroke={colors.warning} {...commonLineProps} />
              <Line
                type="monotone"
                dataKey="T"
                strokeDasharray="3 3 3"
                stroke="#EF1111"
                {...commonLineProps}
              />
            </>
          )}

          {data.label === "trend-1" && (
            <>
              <Line
                dataKey="실효"
                dot={{ stroke: colors.primary, strokeWidth: 8, onClick: handleDotClick, }}
                stroke={colors.primary}
                activeDot={activeDotProps}
                strokeWidth={2}
              />
              <Line
                dataKey="무상"
                dot={{ stroke: colors.warning, strokeWidth: 8, onClick: handleDotClick,}}
                stroke={colors.warning}
                activeDot={activeDotProps}
                strokeWidth={2}
              />
              <Line
                dataKey="피상"
                dot={{ stroke: colors.red, strokeWidth: 8, onClick: handleDotClick, }}
                stroke={colors.red}
                activeDot={activeDotProps}
                strokeWidth={2}
              />
            </>
          )}

          {data.label === "trend-2" && (
            <>
              <Line dataKey="Avg_voltage" stroke={colors.primary} {...commonLineProps} dot={false} />
              <Line dataKey="Active_power" stroke={colors.secondary} {...commonLineProps} dot={false} />
              <Line dataKey="Rctive_power" stroke={colors.info} {...commonLineProps} dot={false} />
              <Line dataKey="Apparent_power" {...commonLineProps} dot={false} />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReLineChart;