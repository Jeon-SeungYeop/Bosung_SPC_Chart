import React, { useRef, useState ,useEffect} from "react";
import Icon from "@/components/ui/Icon";
import * as XLSX from "xlsx";
import Auto_MessageModal from "../common/Auto_MessageModal";
import { CommonFunction } from "@/components/autocomponent";

function Auto_Button_Import_Excel({
    text = "Excel업로드",
    type = "button",
    className = "btn-dark shadow-base2 font-normal btn-sm",
    icon = "ri:file-excel-2-fill",
    iconPosition = "left",
    iconClass = "text-lg",
    setGridData,
    columnDefs = []  // 컬럼 정의를 받아서 매핑에 사용
}) {
    const fileInputRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState("");

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };



    // 사용자 별 권한 
    const [isExcelUpLoad, setIsExcelUpLoad] = useState(true);

    useEffect(() => {
        const authlist = CommonFunction.getMenuPerAuth();
        // 수정 권한 이 없으면 사용불가. 
        if (authlist[1] === "N") {
            setIsExcelUpLoad(false);
        }
    }, []);


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // 시트의 실제 헤더(row 1) 추출
            const sheetRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const rawHeaders = sheetRows[0] || [];
            // rowstatus 컬럼은 매칭에서 제외
            const validCols = columnDefs.filter(col => col.field !== 'rowstatus');
            const expectedHeaders = validCols.map(col => col.headerName || col.field);
            const missing = expectedHeaders.filter(h => !rawHeaders.includes(h));
            if (missing.length > 0) {
                setMessage(`헤더 매칭 실패. 누락된 헤더: ${missing.join(', ')}`);
                setIsModalOpen(true);
                return;
            }

            const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

            // columnDefs 기반으로 필드 매핑 (rowstatus 제외)
            const mappedData = rawData.map((row) => {
                const newRow = {};
                validCols.forEach((col) => {
                    const headerKey = col.headerName || col.field;
                    newRow[col.field] = row[headerKey] !== undefined ? row[headerKey] : null;
                });
                if (newRow.plantcode == null || newRow.plantcode == "") newRow.plantcode = JSON.parse(localStorage.getItem("plantcode"));
                newRow.rowstatus = "P";
                return newRow;
            });

            setGridData(mappedData);
        };
        reader.readAsArrayBuffer(file);

        // 동일 파일 재선택을 위해 초기화
        e.target.value = null;
    };
    // 모달 Cancel
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            {isModalOpen && (
                <Auto_MessageModal
                    activeModal={isModalOpen} // 열림 닫힘 여부 status
                    onClose={handleCancel} // 닫힘 버튼 클릭 액션
                    title="불러오기 실패" // title
                    message={message} // 메시지
                    //height={"h-[250px]"}
                    answertype="OK"
                />
            )}

            <span title={!isExcelUpLoad ? "엑셀업로드 권한이 없습니다" : ""}>
                <button
                    type={type}
                    onClick={handleButtonClick}
                    disabled={!isExcelUpLoad}
                    className={`btn ${className} group 
    bg-[#F1F5F9] text-[#141412] 
    dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg 
    ${!isExcelUpLoad ? "opacity-50 cursor-not-allowed" : ""}`} // 비활성화 시 스타일
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
            <input
                type="file"
                accept=".xlsx,.xls"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
        </>
    );
}

export default Auto_Button_Import_Excel;
