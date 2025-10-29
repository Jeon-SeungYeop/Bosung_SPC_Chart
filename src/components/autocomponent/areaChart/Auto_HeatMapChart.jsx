import React from "react";
import Chart from "react-apexcharts";
import useDarkMode from "@/services/hooks/useDarkMode";

const HeatMapChart = () => {
    const [isDark] = useDarkMode();
    const series = [
        {
            name: "1동",
            data: [
                { x: "1호기", y: 1500 },
                { x: "2호기", y: 900 },
                { x: "3호기", y: 600 },
                { x: "4호기", y: 456 },
                { x: "5호기", y: 324 },
                { x: "6호기", y: 123 },
                { x: "7호기", y: 56 },
                { x: "8호기", y: 34 },
                { x: "9호기", y: 27 },
                { x: "10호기", y: 0 },
            ]
        },
        {
            name: "2동",
            data: [
                { x: "1호기", y: 900 },
                { x: "2호기", y: 1100 },
                { x: "3호기", y: 789 },
                { x: "4호기", y: 568 },
                { x: "5호기", y: 777 },
                { x: "6호기", y: 468 },
                { x: "7호기", y: 987 },
                { x: "8호기", y: 1200 },
                { x: "9호기", y: 40 },
                { x: "10호기", y: 390 },
            ]
        },
        {
            name: "3동",
            data: [
                { x: "1호기", y: 666 },
                { x: "2호기", y: 777 },
                { x: "3호기", y: 999 },
                { x: "4호기", y: 333 },
                { x: "5호기", y: 222 },
                { x: "6호기", y: 111 },
                { x: "7호기", y: 888 },
                { x: "8호기", y: 444 },
                { x: "9호기", y: 555 },
                { x: "10호기", y: 90 },
            ]
        },
        {
            name: "4동",
            data: [
                { x: "1호기", y: 999 },
                { x: "2호기", y: 888 },
                { x: "3호기", y: 777 },
                { x: "4호기", y: 666 },
                { x: "5호기", y: 555 },
                { x: "6호기", y: 444 },
                { x: "7호기", y: 333 },
                { x: "8호기", y: 222 },
                { x: "9호기", y: 111 },
                { x: "10호기", y: 0 },
            ]
        },
        {
            name: "5동",
            data: [
                { x: "1호기", y: 1500 },
                { x: "2호기", y: 1400 },
                { x: "3호기", y: 1300 },
                { x: "4호기", y: 1300 },
                { x: "5호기", y: 1300 },
                { x: "6호기", y: 1300 },
                { x: "7호기", y: 1300 },
                { x: "8호기", y: 1300 },
                { x: "9호기", y: 1300 },
                { x: "10호기", y: 1300 },
            ]
        },
    ];

    const options = {
        chart: {
            height: 350,
            type: 'heatmap',
            toolbar: {
                show: false,
              },
        },
        dataLabels: {
            enabled: false
        },
        colors: ["#008FFB"],
        xaxis: {
            type: 'category',
            labels: {
                style: {
                    colors: isDark ? "#CBD5E1" : "#000000"
                }
            },
            axisBorder: {
                color: isDark ? "#CBD5E1" : "#000000"
            },
            axisTicks: {
                color: isDark ? "#CBD5E1" : "#000000"
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: isDark ? "#CBD5E1" : "#000000"
                }
            },
            axisBorder: {
                color: isDark ? "#CBD5E1" : "#000000"
            },
            axisTicks: {
                color: isDark ? "#CBD5E1" : "#000000"
            }
        }
    };

    return (
        <div>
            <Chart options={options} series={series} type="heatmap" height={350} />
        </div>
    );
};

export default HeatMapChart;
