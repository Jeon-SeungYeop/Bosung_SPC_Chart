import React from "react";
import { HeatMapGrid } from "react-grid-heatmap";

const Auto_HeatMapChart2 = ({ gridData = [] }) => {
    const xLabels = new Array(24).fill(0).map((_, i) => `${i}`);
    
    // gridData에서 equipmentname 추출
    const yLabels = gridData.map(item => item.equipmentname || "");
    
    // gridData에서 시간대별 usage_per 데이터 추출
    const data = gridData.map(item => {
        const hourlyData = [];
        for (let hour = 0; hour < 24; hour++) {
            let perValue = item[`hour_${hour}_per`];
            // % 기호 제거 및 숫자로 변환
            if (typeof perValue === 'string') {
                perValue = perValue.replace('%', '');
            }
            const numValue = perValue ? parseFloat(perValue) : 0;
            hourlyData.push(isNaN(numValue) ? 0 : numValue);
        }
        return hourlyData;
    });
    
    // 데이터가 없는 경우 빈 상태 표시
    if (!gridData || gridData.length === 0) {
        return (
            <div style={{ width: "100%", textAlign: "center", padding: "20px", color: "#777" }}>
                데이터가 없습니다.
            </div>
        );
    }
    
    return (
        <div
            style={{
                width: "100%",
                fontFamily: "sans-serif"
            }}
        >
            <HeatMapGrid
                data={data}
                xLabels={xLabels}
                yLabels={yLabels}
                cellRender={(x, y, ratio) => {
                    const value = data[x]?.[y];
                    return <div>{value !== undefined && value !== null ? value.toFixed(1) : '0.0'}</div>;
                }}
                xLabelsStyle={index => ({
                    color: "#777",
                    fontSize: ".65rem"
                })}
                yLabelsStyle={() => ({
                    fontSize: "1.0rem",
                    textTransform: "uppercase",
                    color: "#777"
                })}
                cellStyle={(_x, _y, ratio) => ({
                    background: `rgba(220, 38, 38, ${ratio})`,
                    fontSize: "1.0rem",
                    color: `rgb(0, 0, 0, ${ratio / 2 + 0.4})`
                })}
                cellHeight="1.7rem"
                xLabelsPos="bottom"
            />
        </div>
    );
};

export default Auto_HeatMapChart2;