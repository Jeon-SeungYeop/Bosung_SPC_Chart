import React from "react";
import { VictoryLine, VictoryChart, VictoryTheme, VictoryGroup, VictoryAxis,  VictoryBar, VictoryLabel, VictoryTooltip } from "victory";
import useDarkMode from "@/services/hooks/useDarkMode";

// 정규분포를 그리기 위한 함수
const generateNormalDistributionData = (mean, stddev, xRange, maxY) => {
  const data = [];
  // 정규분포를 계산한 후 최대값을 maxY로 맞추기 위한 스케일링 팩터 계산
  const scaleFactor = maxY / (1 / (stddev * Math.sqrt(2 * Math.PI)));

  for (let x = xRange.start; x <= xRange.end; x += 0.001) {
    const y =
      (1 / (stddev * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * Math.pow((x - mean) / stddev, 2));
    data.push({ x, y: y * scaleFactor }); // y값을 scaleFactor로 스케일링
  }
  return data;
};

const Histogram = ({histogram_data, distri_data}) => {
    // 정규분포 데이터를 생성
    const normalDistributionData = generateNormalDistributionData(distri_data.mean, distri_data.normal_stddev, {start : distri_data.xrange_start, end : distri_data.xrange_end}, distri_data.normal_maxY);  // 공정산포
    const standardDistributionData = generateNormalDistributionData(distri_data.mean, distri_data.std_stddev, {start : distri_data.xrange_start, end : distri_data.xrange_end}, distri_data.std_maxY);   // 규격산포
    const [isDark] = useDarkMode();
    return (
    <div style={{width:'100%'}}>
      <VictoryChart theme={VictoryTheme.clean} domainPadding={{ x: 10 }} width={1100}height={250} >
        <VictoryAxis
            crossAxis    // x축 설정
            style={{
                axis: { stroke: isDark ? "#CBD5E1" : "#475569" , strokeWidth : 2},
                grid: {
                    stroke:  ({ tick }) =>
                        tick === distri_data.xrange_start ? "#FF0000"
                        : tick === distri_data.mean ? ( isDark ? "#CBD5E1" : "#475569" )
                        : tick === distri_data.xrange_end ? "#FF0000"
                        : (isDark ? "#334155" : "#e2e8f0"),
                    strokeDasharray: "2, 1",
                    strokeWidth : 1
                },
                tickLabels: { fontSize: 10, fill: isDark ? "#cbd5e1" : "#64748b" }
            }}
            tickValues={[9.52, 9.53 , 9.54, 9.55, 9.56, 9.57, 9.58, 9.59, 9.6, 9.61, 9.62]}  // value 미설정 시 자동으로 설정, 중간값 tick 표시 안될땐 중간 tickline 표시안되니 지정필수
            />
        <VictoryAxis 
            dependentAxis
            style={{
                axis: { stroke: isDark ? "#CBD5E1" : "#475569" , strokeWidth : 2},
                grid : {
                    stroke : isDark ? "#334155" : "#e2e8f0",
                    strokeDasharray: "2, 1",
                    strokeWidth : 1
                },
                tickLabels: { fontSize: 10, fill: isDark ? "#cbd5e1" : "#64748b" }
            }}
            domain={[20]}  // y축 최대값 설정
             />
        <VictoryGroup>
            <VictoryBar // 아래로 갈 수록 상위 z-index
                data={histogram_data}
                labels = {({datum}) => `불량 : ${datum.y}`}
                labelComponent={<VictoryTooltip flyoutWidth={50} flyoutHeight={25} style={{fontSize : 9}} />}
                style={{ 
                    data: { 
                        width: 8 ,   // bar 두께
                        fill: "#5ab7d4",
                        stroke: "#5ab7d4",
                        strokeWidth: 1,
                    }
                }}
                animate={{ duration : 1000, easing: "bounce" }}
            />
            <VictoryLine     // 공정산포
            interpolation="natural"
            data={normalDistributionData}
            style={{
                data: { stroke: "#0300FF", strokeWidth: 1 },
            }}
            />

            <VictoryLine     // 규격산포
            interpolation="natural"
            data={standardDistributionData}
            style={{
                data: { stroke: "#a96f6d", strokeWidth: 1 , strokeDasharray : "1, 3" },
            }}
            />
            
            <VictoryLabel
                text="규격 하한"
                x={52}
                y={50}
                style={{
                    fontSize: 9,
                    fill: "#FF0000 "
                }}
            />
            <VictoryLabel
                text="규격 상한"
                x={1010}
                y={50}
                style={{
                    fontSize: 9,
                    fill: "#FF0000 "
                }}
            />
            <VictoryLabel
                text="평균 : 9.57"
                x={528}
                y={50}
                style={{
                    fontSize: 9,
                    fill: isDark ? "#cbd5e1" : "#64748b"
                }}
            />
        </VictoryGroup>
      </VictoryChart>
    </div>
  );
};

export default Histogram;
