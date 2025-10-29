import React, { useState, useEffect, useMemo, useRef } from "react";
import HomeBredCurbs from "@/components/partials/widget/chart/HomeBredCurbs";
import LineChart from "@/components/partials/widget/chart/LineChart";
import Card from "@/components/ui/Card";
import { Line_data } from "@/services/constant/data";
import AddModal from "../system-manage/Add-modal";
import {
  Auto_Button_Search,
  Auto_Card_Grid,
  Auto_Label_Text_Set,
  Auto_Radio_Useflag,
  TitleBar,
  Auto_SearchDropDown,
  DropDownItemGetter,
  Auto_Spliter, Auto_AgGrid,
  CommonFunction
} from "@/components/autocomponent";
import html2canvas from "html2canvas";
import Icon from "@/components/ui/Icon";

const Dashboard = () => {
  const [filterMap, setFilterMap] = useState("usa");
  const [count, setCount] = useState(0);
  const [excuteSuccesAndSearch, setExcuteSuccesAndSearch] = useState(false);
  const [isSearchFlag, setIsSearchFlag] = useState(false);
  const primaryKeys_g2 = ["plantcode", "instrumentid", "calibrationid"];
  const gridRef = useRef();
  const originalDataRef = useRef(new Map());
  const [gridData, setGridData] = useState([]);

  const [searchParams, setSearchParams] = useState({
    label: "",
  });
  const updateSearchParams = useMemo(() => CommonFunction.createUpdateSearchParams(setSearchParams), [setSearchParams]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const columnDefsSub = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const timeGroups = hours
      .map((hour) => {
        const minutes = [0, 15, 30, 45];
        const childColumns = minutes
          .filter((min) => hour * 60 + min <= 1425)
          .map((min) => ({
            field: (hour * 60 + min).toString(),
            headerName: min.toString().padStart(2, "0"),
            cellClass: "text-center",
            minWidth: 60,
          }));
        return childColumns.length > 0
          ? {
              headerName: hour.toString().padStart(2, "0"),
              headerClass: "text-center",
              children: childColumns,
            }
          : null;
      })
      .filter(Boolean);

    return [
      { field: "sub", headerName: "항목", cellClass: "text-center", minWidth: 160, pinned: "left" },
      ...timeGroups,
    ];
  }, []);

  useEffect(() => {
    const transformedData = Line_data.datasets.map((datas) => {
      const item = { sub: datas.label };
      Line_data.labels.forEach((label, index) => {
        const totalMinutes = index * 15;
        item[totalMinutes.toString()] = datas.data[index];
      });
      return item;
    });
    setGridData(transformedData);
  }, []);

  const divRef = useRef();
  const title = "전력 부하 현황 예측 그래프";

  const openPrintPreviewWithBlob = ({ blobUrl, title, pageW, pageH, isLandscape }) => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
          <style>
            :root { --page-w:${pageW}; --page-h:${pageH}; }
            html, body { margin:0; padding:0; }
            body {
              background:#f5f5f5;
              display:flex;
              flex-direction:column;
              align-items:center;
              gap:16px;
              padding:20px;
            }
            .print-btn {
              padding:10px 20px;
              border:none; border-radius:6px;
              cursor:pointer;
              background:#10b981; color:#fff; font-size:16px;
            }
            .print-btn:hover { background:#059669; }
            .page {
              width:var(--page-w);
              height:var(--page-h);
              background:#fff;
              box-shadow:0 2px 8px rgba(0,0,0,.1);
              display:flex; align-items:center; justify-content:center;
            }
            .page > img {
              width:100%;
              height:100%;
              display:block;
              object-fit:contain;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            @media print {
              html, body { margin:0; padding:0; background:#fff; }
              .print-btn { display:none; }
              .page { box-shadow:none; margin:0; }
            }
            @page {
              size: A4 ${isLandscape ? "landscape" : "portrait"};
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <img id="img" src="${blobUrl}" alt="${title}" />
          </div>
          <button class="print-btn" onclick="window.print()">🖨️ 프린트</button>
          <script>
            // 필요 시 자동 프린트: 이미지 로드 되면 인쇄
            // document.getElementById('img').addEventListener('load', () => window.print());

            // 새 탭이 닫힐 때 이미지 blob 해제
            window.addEventListener('beforeunload', () => {
              try { URL.revokeObjectURL('${blobUrl}'); } catch(e){}
              try {
                if (window.name && window.name.startsWith('blob:')) {
                  URL.revokeObjectURL(window.name);
                }
              } catch(e){}
            });
          </script>
        </body>
      </html>`;

    const htmlBlob = new Blob([html], { type: "text/html" });
    const htmlUrl = URL.createObjectURL(htmlBlob);

    const w = window.open(htmlUrl, "_blank", "noopener");
    if (w) w.name = htmlUrl;

    const timer = setInterval(() => {
      if (!w || w.closed) {
        clearInterval(timer);
        try { URL.revokeObjectURL(blobUrl); } catch(e){}
        try { URL.revokeObjectURL(htmlUrl); } catch(e){}
      }
    }, 1000);
  };

  const handleDownload = async (orientation = "portrait") => { // portrait : 세로로 긴 , landscape : 가로로 긴
    if (!divRef.current) return;

    try {
      const src = divRef.current;
      const srcCanvas = await html2canvas(src, {
        scale: 3,
        backgroundColor: "#fff",
        useCORS: true,
        willReadFrequently: true,
      });

      const DPI = 300;
      const A4_PX = {
        portrait: { w: Math.round(8.27 * DPI), h: Math.round(11.69 * DPI) },
        landscape: { w: Math.round(11.69 * DPI), h: Math.round(8.27 * DPI) },
      };
      const { w: A4W, h: A4H } = A4_PX[orientation];

      const MARGIN_MM = 10;
      const mmToPx = (mm) => Math.round((mm / 25.4) * DPI);
      const margin = mmToPx(MARGIN_MM);
      const contentW = A4W - margin * 2;
      const contentH = A4H - margin * 2;

      const scale = Math.min(contentW / srcCanvas.width, contentH / srcCanvas.height);
      const drawW = Math.round(srcCanvas.width * scale);
      const drawH = Math.round(srcCanvas.height * scale);
      const offsetX = Math.round((A4W - drawW) / 2);
      const offsetY = Math.round((A4H - drawH) / 2);

      const out = document.createElement("canvas");
      out.width = A4W;
      out.height = A4H;
      const ctx = out.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, A4W, A4H);
      ctx.drawImage(srcCanvas, offsetX, offsetY, drawW, drawH);

      out.toBlob((blob) => {
        if (!blob) return;
        const blobUrl = URL.createObjectURL(blob);
        const isLandscape = orientation === "landscape";
        const pageW = isLandscape ? "297mm" : "210mm";
        const pageH = isLandscape ? "210mm" : "297mm";

        openPrintPreviewWithBlob({ blobUrl, title, pageW, pageH, isLandscape });
      }, "image/png");
    } catch (error) {
      console.error("Error converting div to A4 image:", error);
    }
  };

  return (
    <>
      <div className="flex place-content-between items-center">
        <TitleBar title="전력 부하 현황(예측) 그래프" />
      </div>
      <div className="w-full h-full ">
        <Auto_Spliter
          vertical={true}
          leftContent={
            <Card className="h-full">
              <div className="flex justify-between">
                <Auto_Label_Text_Set
                  label="입력"
                  value={searchParams.label}
                  onChange={(e) => updateSearchParams("label", e.target.value)}
                  labelSpacing={"mr-1"}
                />
                <button
                  className="group btn bg-[#F1F5F9] text-[#141412] btn-dark shadow-base2 font-normal btn-sm dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg h-[30px] flex items-center"
                  onClick={() => handleDownload("landscape")}
                >
                  <span
                    className={`
                      transition-transform duration-300 ease-in-out group-hover:scale-150
                      text-lg
                    `}
                  >
                    <Icon icon="heroicons-outline:camera" />
                  </span>
                  <span className="ml-2">차트 캡쳐</span>
                </button>
              </div>
              <div ref={divRef}>
                <LineChart line_data={Line_data} label={searchParams.label} />
              </div>
            </Card>
          }
          rightContent={
            <Card className="h-full">
              <Auto_AgGrid
                gridType="sender"
                primaryKeys={primaryKeys_g2}
                gridData={gridData}
                gridRef={gridRef}
                columnDefs={columnDefsSub}
                originalDataRef={originalDataRef}
                height="285"
              />
            </Card>
          }
        />
      </div>
    </>
  );
};

export default Dashboard;