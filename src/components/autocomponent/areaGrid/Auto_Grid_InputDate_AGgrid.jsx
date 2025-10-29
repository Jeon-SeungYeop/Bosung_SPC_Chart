import { useState, useRef, useEffect } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Korean } from "flatpickr/dist/l10n/ko.js";
import Icon from "@/components/ui/Icon";
import dayjs from "dayjs";

const Auto_Grid_InputDate_AGgrid = ({ value, onValueChange, disable = false }) => {
    const flatpickrRef = useRef(null);
    const [tempDate, setTempDate] = useState(value || "");

    useEffect(() => {
        setTempDate(value || "");
    }, [value]);

    const handleDateChange = (date) => {
        if (date?.[0]) {
            const formatted = dayjs(date[0]).format("YYYY-MM-DD");
            setTempDate(formatted);
            onValueChange?.(formatted);
        }
    };

    const openCalendar = () => {
        flatpickrRef.current?.flatpickr.open();
    };

    const getValidDateObject = (val) => {
        const d = dayjs(val, "YYYY-MM-DD", true);
        return d.isValid() ? d.toDate() : null;
    };

    return (
        <div className="w-full">
            <input
                type="text"
                value={tempDate}
                onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 추출
                    let formatted = "";

                    // 입력값이 비어 있거나 한 글자가 지워져서 길이가 줄어든 경우
                    if (!raw || raw.length < (tempDate.replace(/[^0-9]/g, "").length || 0)) {
                        setTempDate(""); // tempDate를 공백으로 설정
                        onValueChange(null); // 상위 컴포넌트에 null 전달
                        return;
                    }

                    // 숫자의 길이에 따라 하이픈 추가
                    if (raw.length <= 4) {
                        formatted = raw;
                    } else if (raw.length <= 6) {
                        formatted = `${raw.slice(0, 4)}-${raw.slice(4)}`;
                    } else {
                        formatted = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
                    }

                    setTempDate(formatted);
                    // 유효한 날짜 형식이거나 빈 문자열일 때만 onValueChange 호출
                    if (formatted === "" || dayjs(formatted, "YYYY-MM-DD", true).isValid()) {
                        onValueChange(formatted === "" ? null : formatted);
                    }
                }}
                className="w-full h-full border-transparent bg-transparent focus:outline-none"
                disabled={disable}
            />

            {/* 아이콘 클릭 시 보이게 설정 */}
            <div style={{ position: "absolute", left: 0, top: 0, opacity: 0, pointerEvents: "none" }}>
                <Flatpickr
                    ref={flatpickrRef}
                    value={getValidDateObject(tempDate)}
                    onChange={handleDateChange}
                    options={{
                        dateFormat: "Y-m-d",
                        locale: Korean,
                    }}
                />
            </div>

            <div
                onClick={disable ? undefined : openCalendar}
                className={`
                    absolute right-2 top-1/2 -translate-y-1/2
                    ${disable 
                        ? "pointer-events-none opacity-50" 
                        : "cursor-pointer transition-transform duration-200 group-hover:scale-150"}
                `}
            >
                <Icon
                    icon="heroicons-outline:calendar"
                    className="text-slate-400 dark:text-slate-300 transition-transform duration-200 group-hover:scale-150"
                />
            </div>
        </div>
    );
};

export default Auto_Grid_InputDate_AGgrid;