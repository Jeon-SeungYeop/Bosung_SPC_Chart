import { useState, useEffect, useRef } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Korean } from "flatpickr/dist/l10n/ko.js";
import Icon from "@/components/ui/Icon";
import dayjs from "dayjs";

const Auto_YearPickerF_T = ({
  label = "시작종료년도",
  id = "default-picker",
  labelwidth = "85px",
  pickerwidth = "110px",
  dateformat = "Y",
  labelSpacing = "mr-8",
  horizontal = true,
  onChangeStart, // 시작년도 변경 set
  onChangeEnd,   // 종료년도 변경 set
  isFirst = false, // true면 start 기본값 = 올해
  oneDate = false, // true면 start만 표시
}) => {
  const currentYear = dayjs().year();
  
  const [selectedStartDate, setSelectedStartDate] = useState(() =>
    currentYear.toString()
  );

  // oneDate면 종료년도 기본값을 "" 로
  const [selectedEndDate, setSelectedEndDate] = useState(() =>
    oneDate ? "" : currentYear.toString()
  );

  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showEndDropdown, setShowEndDropdown] = useState(false);
  
  const startDropdownRef = useRef(null);
  const endDropdownRef = useRef(null);

  // 년도 옵션 생성 (현재년도 기준 ±50년)
  const yearOptions = [];
  for (let i = currentYear + 10; i >= currentYear - 50; i--) {
    yearOptions.push(i);
  }

  // 년도 비교(역전 시 교체) — oneDate면 비활성화
  useEffect(() => {
    if (oneDate) return;

    const isValidYear = (val) =>
      /^\d{4}$/.test(val) && parseInt(val) >= 1900 && parseInt(val) <= 2100;

    if (isValidYear(selectedStartDate) && isValidYear(selectedEndDate)) {
      if (parseInt(selectedStartDate) > parseInt(selectedEndDate)) {
        const temp = selectedStartDate;
        setSelectedStartDate(selectedEndDate);
        setSelectedEndDate(temp);
        onChangeStart?.(selectedEndDate);
        onChangeEnd?.(temp);
      }
    }
  }, [selectedStartDate, selectedEndDate, oneDate]);

  // 마운트 시 기본 값 부모로 전달 (oneDate면 End 전달 안 함)
  useEffect(() => {
    onChangeStart?.(selectedStartDate);
    if (!oneDate) {
      onChangeEnd?.(selectedEndDate);
    }
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startDropdownRef.current && !startDropdownRef.current.contains(event.target)) {
        setShowStartDropdown(false);
      }
      if (endDropdownRef.current && !endDropdownRef.current.contains(event.target)) {
        setShowEndDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStartYearSelect = (year) => {
    setSelectedStartDate(year.toString());
    onChangeStart?.(year.toString());
    setShowStartDropdown(false);
  };

  const handleEndYearSelect = (year) => {
    setSelectedEndDate(year.toString());
    onChangeEnd?.(year.toString());
    setShowEndDropdown(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-y-1">
      {label && (
        <label
          className={`capitalize items-center text-left text-base font-normal ${horizontal ? labelSpacing : ""}`}
          style={{ width: labelwidth }}
        >
          {label}
        </label>
      )}

      {/* 시작년도 */}
      <div ref={startDropdownRef} className="relative w-fit group" style={{ width: pickerwidth }}>
        <input
          type="text"
          value={selectedStartDate}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            const formatted = raw.slice(0, 4); // 4자리까지만
            setSelectedStartDate(formatted);
            if (/^\d{4}$/.test(formatted) && parseInt(formatted) >= 1900 && parseInt(formatted) <= 2100) {
              onChangeStart?.(formatted);
            }
          }}
          placeholder="YYYY"
          maxLength="4"
          className="form-control py-2 w-[100px] pr-10"
        />
        
        <div
          onClick={() => setShowStartDropdown(!showStartDropdown)}
          className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer"
        >
          <Icon
            icon="heroicons-outline:calendar"
            className="text-slate-400 dark:text-slate-300 transition-transform duration-200 group-hover:scale-150"
          />
        </div>

        {/* 년도 선택 드롭다운 */}
        {showStartDropdown && (
          <div className="absolute top-full left-0 mt-1 w-[100px] bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
            {yearOptions.map((year) => (
              <div
                key={year}
                onClick={() => handleStartYearSelect(year)}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 ${
                  year.toString() === selectedStartDate ? 'bg-blue-100 dark:bg-blue-900' : ''
                }`}
              >
                {year}
              </div>
            ))}
          </div>
        )}
      </div>

      {!oneDate && (
        <>
          {/* 줄바꿈 유도용 div */}
          <div className="block w-full md:hidden lg:hidden" style={{ height: 0 }} />
          <span className="mx-2 ml-[175px] md:ml-2 lg:-ml-1">~</span>
          <div className="block w-full md:hidden lg:hidden" style={{ height: 0 }} />

          {/* 종료년도 */}
          <div ref={endDropdownRef} className="relative w-fit group ml-[85px] md:ml-[0px] lg:ml-[0px]" style={{ width: pickerwidth }}>
            <input
              type="text"
              value={selectedEndDate}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                const formatted = raw.slice(0, 4); // 4자리까지만
                setSelectedEndDate(formatted);
                if (/^\d{4}$/.test(formatted) && parseInt(formatted) >= 1900 && parseInt(formatted) <= 2100) {
                  onChangeEnd?.(formatted);
                }
              }}
              placeholder="YYYY"
              maxLength="4"
              className="form-control py-2 w-[100px] pr-10"
            />

            <div
              onClick={() => setShowEndDropdown(!showEndDropdown)}
              className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              <Icon
                icon="heroicons-outline:calendar"
                className="text-slate-400 dark:text-slate-300 transition-transform duration-200 group-hover:scale-150"
              />
            </div>

            {/* 년도 선택 드롭다운 */}
            {showEndDropdown && (
              <div className="absolute top-full left-0 mt-1 w-[100px] bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                {yearOptions.map((year) => (
                  <div
                    key={year}
                    onClick={() => handleEndYearSelect(year)}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 ${
                      year.toString() === selectedEndDate ? 'bg-blue-100 dark:bg-blue-900' : ''
                    }`}
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Auto_YearPickerF_T;