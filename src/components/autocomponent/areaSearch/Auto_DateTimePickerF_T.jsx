import { useState, useEffect, useRef } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { Korean } from "flatpickr/dist/l10n/ko.js";
import Icon from "@/components/ui/Icon";
import dayjs from "dayjs";

const Auto_DateTimePickerF_T = ({
  label = "시작종료일자",
  id = "default-picker",
  labelwidth = "85px",
  pickerwidth = "200px",
  dateformat = "Y-m-d",
  labelSpacing = "mr-8",
  horizontal = true,
  onChangeStart, // 시작일자 변경 set
  onChangeEnd,   // 종료일자 변경 set
  isFirst = false, // true면 start 기본값 = 이번 달 1일
  oneDate = false, // true면 start만 표시
  daily = false, // true면 오늘 날짜
  weekly = false, // true면 이번 주 월요일
}) => {
  const [selectedStartDate, setSelectedStartDate] = useState(() => {
    // daily가 true이면 오늘 날짜
    if (daily) {
      return dayjs().format("YYYY-MM-DD");
    }
    // weekly가 true이면 이번 주 월요일
    else if (weekly) {
      return dayjs().startOf('week').add(1, 'day').format("YYYY-MM-DD");
    }
    // isFirst가 true이면 이번 달 1일
    else if (isFirst) {
      return dayjs().startOf("month").format("YYYY-MM-DD");
    }
    // 기본값은 오늘 날짜
    else {
      return dayjs().format("YYYY-MM-DD");
    }
  });

  // oneDate면 종료일 기본값을 "" 로
  const [selectedEndDate, setSelectedEndDate] = useState(() =>
    oneDate ? "" : dayjs().format("YYYY-MM-DD")
  );

  const startPickerRef = useRef(null);
  const endPickerRef = useRef(null);

  // 날짜 비교(역전 시 교체) — oneDate면 비활성화
  useEffect(() => {
    if (oneDate) return;

    const isExactFormat = (val) =>
      /^\d{4}-\d{2}-\d{2}$/.test(val) && dayjs(val, "YYYY-MM-DD", true).isValid();

    if (isExactFormat(selectedStartDate) && isExactFormat(selectedEndDate)) {
      if (dayjs(selectedStartDate).isAfter(dayjs(selectedEndDate))) {
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

  const openStartCalendar = () => {
    startPickerRef.current?.flatpickr.open();
  };
  const openEndCalendar = () => {
    endPickerRef.current?.flatpickr.open();
  };

  const getValidDateObject = (val) => {
    const d = dayjs(val, "YYYY-MM-DD", true);
    return d.isValid() ? d.toDate() : null;
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

      {/* 시작일 */}
      <div className="relative w-fit group" style={{ width: pickerwidth }}>
        <input
          type="text"
          value={selectedStartDate}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            let formatted = "";
            if (raw.length <= 4) {
              formatted = raw;
            } else if (raw.length <= 6) {
              formatted = `${raw.slice(0, 4)}-${raw.slice(4)}`;
            } else {
              formatted = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
            }
            setSelectedStartDate(formatted);
            if (dayjs(formatted, "YYYY-MM-DD", true).isValid()) {
              onChangeStart?.(formatted);
            }
          }}
          className="form-control py-2 w-[190px] pr-10"
        />
        <div style={{ position: "absolute", left: 0, top: 0, opacity: 0, pointerEvents: "none" }}>
          <Flatpickr
            ref={startPickerRef}
            value={getValidDateObject(selectedStartDate)}
            onChange={(dates) => {
              if (!dates || dates.length === 0) return;
              const formatted = dayjs(dates[0]).format("YYYY-MM-DD");
              setSelectedStartDate(formatted);
              onChangeStart?.(formatted);
            }}
            options={{
              dateFormat: dateformat,
              locale: Korean,
            }}
          />
        </div>
        <div
          onClick={openStartCalendar}
          className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer"
        >
          <Icon
            icon="heroicons-outline:calendar"
            className="text-slate-400 dark:text-slate-300 transition-transform duration-200 group-hover:scale-150"
          />
        </div>
      </div>

      {!oneDate && (
        <>
          {/* 줄바꿈 유도용 div */}
          <div className="block w-full md:hidden lg:hidden" style={{ height: 0 }} />
          <span className="mx-2 ml-[175px] md:ml-2 lg:-ml-1">~</span>
          <div className="block w-full md:hidden lg:hidden" style={{ height: 0 }} />

          {/* 종료일 */}
          <div className="relative w-fit group ml-[85px] md:ml-[0px] lg:ml-[0px]" style={{ width: pickerwidth }}>
            <input
              type="text"
              value={selectedEndDate}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                let formatted = "";
                if (raw.length <= 4) {
                  formatted = raw;
                } else if (raw.length <= 6) {
                  formatted = `${raw.slice(0, 4)}-${raw.slice(4)}`;
                } else {
                  formatted = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
                }
                setSelectedEndDate(formatted);
                if (dayjs(formatted, "YYYY-MM-DD", true).isValid()) {
                  onChangeEnd?.(formatted);
                }
              }}
              className="form-control py-2 w-[190px] pr-10"
            />

            <div style={{ position: "absolute", left: 0, top: 0, opacity: 0, pointerEvents: "none" }}>
              <Flatpickr
                ref={endPickerRef}
                value={getValidDateObject(selectedEndDate)}
                onChange={(dates) => {
                  if (!dates || dates.length === 0) return;
                  const formatted = dayjs(dates[0]).format("YYYY-MM-DD");
                  setSelectedEndDate(formatted);
                  onChangeEnd?.(formatted);
                }}
                id={id}
                options={{
                  dateFormat: dateformat,
                  locale: Korean,
                }}
              />
            </div>
            <div
              onClick={openEndCalendar}
              className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              <Icon
                icon="heroicons-outline:calendar"
                className="text-slate-400 dark:text-slate-300 transition-transform duration-200 group-hover:scale-150"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Auto_DateTimePickerF_T;