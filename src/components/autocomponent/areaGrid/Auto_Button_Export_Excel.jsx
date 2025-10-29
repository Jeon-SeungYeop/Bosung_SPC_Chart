import React, { useState, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import * as XLSX from "xlsx";
import Auto_MessageModal from "../common/Auto_MessageModal";
import { CommonFunction } from "@/components/autocomponent";

function Auto_Button_Export_Excel({
  text = "Excel다운로드",
  type = "button",
  className = "btn-dark shadow-base2 font-normal btn-sm",
  icon = "ri:file-excel-2-fill",
  iconPosition = "left",
  iconClass = "text-lg",
  columnDefs,
  gridData,
  title,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const userID = JSON.parse(localStorage.getItem("userid"));
  
  // 권한 설정
  const [isExcelDownload, setIsExcelDownload] = useState(true);
  useEffect(() => {
    const authlist = CommonFunction.getMenuPerAuth();
    // 수정 권한이 없으면 사용불가.
    if (authlist[2] === "N") {
      setIsExcelDownload(false);
    }
  }, []);

  const onClick = () => {
    if (!columnDefs?.length || !gridData?.length) {
      setIsModalOpen(true);
      return;
    }

    // 계층 구조 헤더 처리
    const createHierarchicalHeaders = () => {
      const topHeaders = [];
      const subHeaders = [];
      const allColumns = [];
      let colIndex = 0;

      columnDefs.forEach(colDef => {
        if (colDef.children && colDef.children.length > 0) {
          // 상위 헤더가 있는 경우
          const childColumns = colDef.children.filter(child => child.field !== "rowstatus");
          if (childColumns.length > 0) {
            // 상위 헤더 추가 (병합될 셀 수만큼)
            topHeaders.push(colDef.headerName || "");
            for (let i = 1; i < childColumns.length; i++) {
              topHeaders.push(""); // 병합될 빈 셀들
            }

            // 하위 헤더들 추가
            childColumns.forEach(child => {
              subHeaders.push(child.headerName || child.field);
              allColumns.push(child);
            });
          }
        } else {
          // 단일 레벨 헤더인 경우
          if (colDef.field !== "rowstatus") {
            topHeaders.push(colDef.headerName || colDef.field);
            subHeaders.push(""); // 하위 헤더가 없으므로 빈 셀
            allColumns.push(colDef);
          }
        }
      });

      return { topHeaders, subHeaders, allColumns };
    };

    const { topHeaders, subHeaders, allColumns } = createHierarchicalHeaders();

    // 데이터 행들
    const rows = gridData.map(row =>
      allColumns.map(col => row[col.field])
    );

    // AOA 형태로 시트 데이터 생성 (상위헤더 + 하위헤더 + 데이터)
    const sheetData = [];
    
    // 상위 헤더 행 추가
    if (topHeaders.some(header => header !== "")) {
      sheetData.push(topHeaders);
    }
    
    // 하위 헤더 행 추가
    sheetData.push(subHeaders);
    
    // 데이터 행들 추가
    sheetData.push(...rows);

    // 워크시트 생성
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // 병합 정보 생성
    const merges = [];
    let colIndex = 0;
    
    columnDefs.forEach(colDef => {
      if (colDef.children && colDef.children.length > 0) {
        const childColumns = colDef.children.filter(child => child.field !== "rowstatus");
        if (childColumns.length > 1) {
          // 상위 헤더 병합 (첫 번째 행, colIndex부터 colIndex + childColumns.length - 1까지)
          merges.push({
            s: { r: 0, c: colIndex }, // 시작 셀 (행, 열)
            e: { r: 0, c: colIndex + childColumns.length - 1 } // 끝 셀 (행, 열)
          });
        }
        colIndex += childColumns.length;
      } else {
        if (colDef.field !== "rowstatus") {
          // 단일 헤더인 경우 두 행을 병합
          if (topHeaders.some(header => header !== "")) {
            merges.push({
              s: { r: 0, c: colIndex },
              e: { r: 1, c: colIndex }
            });
          }
          colIndex++;
        }
      }
    });

    // 병합 정보 적용
    if (merges.length > 0) {
      worksheet['!merges'] = merges;
    }

    // 워크북 생성 및 시트 추가
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // 파일명 생성
    const now = new Date();
    const yy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mi = String(now.getMinutes()).padStart(2, "0");
    const timestamp = `${yy}${mm}${dd}_${hh}${mi}`;

    const fileName = `${title.replace(/\s+/g, "_")}_${userID}_${timestamp}.xlsx`;

    // 엑셀 파일 다운로드
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <>
      {isModalOpen && (
        <Auto_MessageModal
          activeModal={isModalOpen}
          onClose={handleCancel}
          title="내보내기 실패"
          message={"조회된 데이터가 없습니다."}
          answertype="OK"
          headericon="failed"
        />
      )}
      <span title={!isExcelDownload ? "엑셀 다운로드 권한이 없습니다" : ""}>
        <button
          type={type}
          onClick={onClick}
          disabled={!isExcelDownload}
          className={`btn ${className} group
            bg-[#F1F5F9] text-[#141412]
            dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg
            ${!isExcelDownload ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="flex items-center">
            {icon && (
              <span
                className={`
                transition-transform duration-300 ease-in-out group-hover:scale-150
                ${iconPosition === "right" ? "order-1 ltr:ml-2 rtl:mr-2" : ""}
                ${text && iconPosition === "left" ? "ltr:mr-2 rtl:ml-2" : ""}
                ${iconClass}
              `}
              >
                <Icon icon={icon} />
              </span>
            )}
            <span>{text}</span>
          </span>
        </button>
      </span>
    </>
  );
}

export default Auto_Button_Export_Excel;