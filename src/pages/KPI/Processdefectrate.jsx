import {
  Auto_LabelPopup_Set, CommonFunction, Auto_Popup_CodeName, Auto_GridCellButtonRenderer, Auto_AgGrid, TitleBar, Auto_SearchDropDown,
  DropDownItemGetter, Auto_Button_Add_AGgrid, Auto_Button_Delete_AGgrid, Auto_Button_Save_AGgrid, Auto_Button_Search_AGgrid, Auto_Spliter, Auto_Label_Text_Set,
  Auto_Radio_Useflag, Auto_Button_Export_Excel, Auto_Button_Import_Excel, Auto_Grid_Checkbox_AGgrid, Auto_Button_Column_State, Auto_DateTimePickerF_T
} from "@/components/autocomponent";
import Card from "@/components/ui/Card";
import { useState, useEffect, useMemo, useRef } from "react";
import { useApiUrl } from "@/context/APIContext";
import Loading from "@/components/Loading";
import Bosung_equipmentid_search4 from "@/components/bosungcomponent/Bosung_equipmentid_search4";
import MixedChart from "@/components/partials/widget/chart/Mixed";
import GaugeChart from "react-gauge-chart";
import useDarkMode from "@/services/hooks/useDarkMode";
import Icon from "@/components/ui/Icon";

const Processdefectrate = () => {
  const [isDark] = useDarkMode();
  const [gridData, setGridData] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false);
  const apiUrl = useApiUrl();
  
  // Default Chart Data
  const [chartData, setChartData] = useState({
    label: "load-ratio",
    labels: [],
    datas: []
  });

  const search_address = "kpi/processdefectrate-r";

  // rawData를 기반으로 통계값 계산
  const calculateStats = (data) => {
    if (!data || data.length === 0) return { totalProduction: 0, totalDefect: 0, defectRate: 0 };
    
    const totalProduction = data.reduce((sum, item) => sum + (item.s_quantity || 0), 0);
    const totalDefect = data.reduce((sum, item) => sum + (item.f_quantity || 0), 0);
    const defectRate = totalDefect > 0 ? (totalDefect / totalProduction) * 10000  : 0;
    
    return {
      totalProduction,
      totalDefect,
      defectRate
    };
  };

  const stats = calculateStats(rawData);

  // 차트데이터로 변환
  const formatChartData = (data) => {
    const labels = data.map(item => {
      return item.collectyear != null
        ? `${String(item.collectyear)} ${(item.collectmonth)}`
        : '';
    });
    const s_quantity_data = data.map(item => item.s_quantity);
    const f_quantity_data = data.map(item => item.f_quantity);
    const ppm_data = data.map(item => item.ppm)

    return {
      label: "RealtimeElectricityForecast_1point",
      labels: labels,
      datas: [
        {
          name: '생산수량',
          type: "line",
          data: s_quantity_data
        },
        {
          name: '불량수량',
          type: "column",
          data: f_quantity_data
        },
        {
          name: 'PPM',
          type: "line",
          data: ppm_data
        },
      ]
    };
  };

  // 그리드 데이터 변환
  function pivotForAgGrid(data) {
    if (data.length === 0) return [];
    const box_Row = { metric: "BOX" };
    const fall_Row = { metric: "낙하품" };
    const mesh_Row = { metric: "매쉬상태" };
    const taken_Row = { metric: "찍힘" };
    const rust_Row = { metric: "녹" };
    const mix_Row = { metric: "혼합" };
    const s_quantity_Row = { metric: "총 생산 수량" };
    const f_quantity_Row = { metric: "총 불량 수량"};
    const ppm_Row = { metric: "PPM" };

    data.forEach((item, idx) => {
      const day = item.collectyear != null
        ? `${String(item.collectyear)} ${(item.collectmonth)}`
        : '';
        box_Row[day] = item.box
        fall_Row[day] = item.fall
        mesh_Row[day] = item.mesh
        taken_Row[day] = item.taken
        rust_Row[day] = item.rust
        mix_Row[day] = item.mix
        s_quantity_Row[day] = item.s_quantity
        f_quantity_Row[day] = item.f_quantity
        ppm_Row[day] = item.ppm
    });
    return [
      box_Row,
      fall_Row,
      mesh_Row,
      taken_Row,
      rust_Row,
      mix_Row,
      s_quantity_Row,
      f_quantity_Row,
      ppm_Row
    ];
  }

  const columnDefs = useMemo(() => {
    const keys = gridData[0]
      ? Object.keys(gridData[0]).filter(key => key !== 'metric')
      : [];

    return [
      {
        field: 'metric',
        headerName : '',
        cellClass: "text-center",
        minWidth: 80,
        pinned: 'left'
      },
      ...keys.map(key => ({
        field: key,
        headerName: key,
        cellClass: "text-right",
        editable: false,
        minWidth: 110,
        valueFormatter: (params) => {
          const val = params.value;
          const rowMetric = params.data?.metric;
          
          // PPM 행만 소수점 둘째자리까지 표시
          if (rowMetric === 'PPM') {
            return val != null && !isNaN(val)
              ? Number(val).toFixed(2)
              : '';
          }
          
          // 나머지는 그냥 표시
          if (val != null && !isNaN(val)) {
            return Number(val).toLocaleString('ko-KR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
          }
          return '';
        }
      }))
    ];
  }, [gridData]);

  useEffect(() => {
    setGridData(pivotForAgGrid(rawData));
    setChartData(formatChartData(rawData));
  },[rawData]);

  return (
    <div className="space-y-5">
      <Bosung_equipmentid_search4
        adress={search_address}
        setGridData={setRawData}
        excuteSuccesAndSearch={excuteSuccesAndSearch}
        isYear={true}
        oneDate={true}
      />
      <Card noborder>
        <div className="flex flex-wrap items-center justify-between mt-3">
          <div className="w-full lg:w-[20%] sm:w-full lg:pr-4 text-[0.8vw]">
              공정불량률
          </div>
          <div className="w-full lg:w-[20%] sm:w-full lg:pr-4">
              [ PPM : (불량수량 / 생산수량) * 1,000,000 ]
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between mt-3">
          <div className="w-full lg:w-[30%] sm:w-full lg:pr-4 ">
            <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
              <div className="ml-3 mt-2 mb-2">생산 수량</div>
              <div className="font-semibold mr-3 mt-2 mb-2">{stats.totalProduction.toLocaleString()} EA</div>
            </div>
          </div>
          <div className="w-full lg:w-[25%] sm:w-full lg:pr-4 ">
            <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
              <div className="ml-3 mt-2 mb-2">불량 수량</div>
              <div className="font-semibold mr-3 mt-2 mb-2">{Number(stats.totalDefect.toFixed(2)).toLocaleString()} EA</div>
            </div>
          </div>
          <div className="w-full lg:w-[45%] sm:w-full lg:pr-4 ">
            <div className="w-full bg-slate-200 p-3 flex place-content-between items-center justify-between text-[1.1vw] dark:text-white dark:bg-slate-600 rounded-xl">
              <div className="ml-2 mt-2 mb-2">불량률</div>
              <div className="font-semibold mt-2 mb-2">{stats.defectRate.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} PPM</div>
              <div className="ml-2 mt-2 mb-2">불량률 목표</div>
              <div className="font-semibold mr-3 mt-2 mb-2 ">50 PPM</div>
            </div>
          </div>
        </div>
      </Card>
      <Card noborder>
        <div className="flex justify-between items-center mb-5">
          <div className="text-xl">생산 현황</div>
          <Auto_Button_Export_Excel
            columnDefs={columnDefs}
            gridData={gridData}
            title={"공정 불량률 - 생산 현황"}
          />
        </div>
        <Auto_AgGrid
          gridType="sender"
          gridData={gridData}
          columnDefs={columnDefs}
          height={432}
        />
        <div className="text-xl mt-4">공정 불량률</div>
        <MixedChart data={chartData} height={300}/>
      </Card>
    </div>
  )
}

export default Processdefectrate