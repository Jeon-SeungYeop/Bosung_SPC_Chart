import React, { useState, useEffect, useMemo, useRef, Children } from "react";
import Card from "@/components/ui/Card";
import HomeBredCurbs from "@/components/partials/widget/chart/HomeBredCurbs";
import DonutChart2 from "@/components/partials/widget/chart/dount-chart2";
import Mixed from "@/components/partials/widget/chart/Mixed";
import { load_ratio_donut, load_ratio_mix } from "@/services/constant/data";
import { Auto_AgGrid } from "@/components/autocomponent";


const Dashboard = () => {
  const gridRef = useRef(null);
  const originalDataRef = useRef(new Map());
  const [gridData, setGridData] = useState([]);

  const columnDefs = useMemo(() => {
    const base = [
      {
        headerName: "항목",
        field: "item",
        cellClass: "text-center",
        minWidth: 200
      },
      {
        headerName: "일자",
        field: "date",
        cellStyle: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        },
        minWidth: 100,
        spanRows: true,
      }
      
    ];

    const timeCols = load_ratio_mix.labels.map(time => ({
      headerName: time,
      field: time,
      cellClass: "text-center",
      minWidth: 100
    }));

    const timeHeader = {
      headerName: "시",
      headerClass: "text-center",
      children: timeCols
    };

    return [...base, timeHeader];
  }, []);


  useEffect(() => {
    const rows = load_ratio_mix.datas.map(series => {
      const row = { item: series.name, date: "2025-06-03" };
      load_ratio_mix.labels.forEach((time, idx) => {
        row[time] = series.data[idx];
      });
      return row;
    });
    setGridData(rows);
  }, []);

  return (
    <div>
      <HomeBredCurbs title="상별 부하율" />
      <div className="grid grid-cols-12 gap-5">
        <div className="lg:col-span-3 col-span-12">
          <DonutChart2 data={load_ratio_donut} height={450} />
        </div>
        <div className="lg:col-span-9 col-span-12">
          <Mixed data={load_ratio_mix} height={450} />
        </div>
      </div>

      <Card noborder>
        <Auto_AgGrid
          gridType="sender"
          primaryKeys={["plantcode", "instrumentid", "calibrationid"]}
          gridData={gridData}
          gridRef={gridRef}
          columnDefs={columnDefs}
          originalDataRef={originalDataRef}
          height="269"
        />
      </Card>
    </div>
  );
};

export default Dashboard;
