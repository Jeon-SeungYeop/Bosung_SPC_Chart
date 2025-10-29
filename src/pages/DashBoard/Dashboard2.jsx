import React, { useState } from "react";
import Card from "@/components/ui/Card";
import RadarChart from "@/components/partials/widget/chart/radar-chart";
import Mixed from "@/components/partials/widget/chart/Mixed";
import HomeBredCurbs from "@/components/partials/widget/chart/HomeBredCurbs";
import { Radar_data } from "@/services/constant/data";
import ReLineChart from "@/components/partials/widget/chart/ReLineChart";
import { Mix_data } from "@/services/constant/data";
import { ReLine_data_Dash } from "@/services/constant/data";
import Cardflex from "@/components/ui/Cardflex";
import GaugeChart from "react-gauge-chart";
import { dashboard2_gauge_data } from "@/services/constant/data";
import useDarkMode from "@/services/hooks/useDarkMode";

const Dashboard = () => {
  const [filterMap, setFilterMap] = useState("usa");
  const [isDark] = useDarkMode();
  return (
    <div>
      <HomeBredCurbs title="Autovation DashBoard" />
      <div className="grid grid-cols-12 gap-5">
        <div className="lg:col-span-6 col-span-12">
          <Card title="실시간 전력 현황">
            <ReLineChart data={ReLine_data_Dash} />
          </Card>
        </div>
        <div className="lg:col-span-6 col-span-12">
          <Card title="온습도 현황(라인)">
            <Mixed data={Mix_data} height={350} />
          </Card>
        </div>
        <div className="lg:col-span-6 col-span-12">
          <Cardflex title="전력 부하">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                width: "100%",
              }}
            >
              <div style={{ width: "33%", display: "block" }}>
                <GaugeChart
                  id="gauge-chart1"
                  nrOfLevels={420}
                  arcsLength={[0.3, 0.5, 0.2]}
                  colors={["#5BE12C", "#F5CD19", "#EA4228"]}
                  percent={dashboard2_gauge_data.power_L}
                  textColor={isDark ? "#cbd5e1" : "#0f172a"}
                  arcPadding={0.02}
                />
                <h5>누적</h5>
              </div>
              <div style={{ width: "33%" }}>
                <GaugeChart
                  id="gauge-chart1"
                  nrOfLevels={420}
                  arcsLength={[0.3, 0.5, 0.2]}
                  colors={["#5BE12C", "#F5CD19", "#EA4228"]}
                  percent={dashboard2_gauge_data.power_S}
                  textColor={isDark ? "#cbd5e1" : "#0f172a"}
                  arcPadding={0.02}
                />
                <h5>전력</h5>
              </div>
              <div style={{ width: "33%" }}>
                <GaugeChart
                  id="gauge-chart1"
                  nrOfLevels={420}
                  arcsLength={[0.3, 0.5, 0.2]}
                  colors={["#5BE12C", "#F5CD19", "#EA4228"]}
                  percent={dashboard2_gauge_data.power_V}
                  textColor={isDark ? "#cbd5e1" : "#0f172a"}
                  arcPadding={0.02}
                />
                <h5>전압</h5>
              </div>
            </div>
          </Cardflex>
        </div>
        <div className="lg:col-span-6 col-span-12">
          <Cardflex title="온습도 현황">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                width: "100%",
              }}
            >
              {Radar_data.map((data, index) => (
                <div key={index} style={{ width: "33%" }}>
                  <RadarChart
                    s_value={data.s_value}
                    label={data.label}
                    value={data.value}
                  />
                  <h5>{data.label}</h5>
                </div>
              ))}
            </div>
          </Cardflex>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
