import { useState, useEffect } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css"; // 원하는 테마 import
import { Korean } from "flatpickr/dist/l10n/ko.js"; // 한글 로케일 import
import Icon from "@/components/ui/Icon";
import dayjs from "dayjs";

const Auto_Label_DatePicker = ({
  label = "라벨명",
  value,
  id = "default-picker",
  labelwidth = "85px", // 라벨 사이즈
  pickerwidth = "200px",
  dateformat = "Y-m-d", // 포멧
  labelSpacing = "mr-4", // 라벨과 의 간격
  horizontal = true, // 라벨과 나란히 보이기
  onChangeDate, // 선택한 일자 state Setter 
}) => {

  const [selectedDate, setSelectedDate] = useState(dayjs().toDate());

  useEffect(() => {
    setSelectedDate?.(selectedDate);
  }, []); // 마운트 시 1회만 실행


  return (
    <div className="flex items-center">
      {label && (
        <label
          className={`capitalize  items-center text-left text-base font-normal ${horizontal ? labelSpacing : ""} w-[85px]   min-w-[85px]`}
        >
          {label}
        </label>
      )}
      <div className="relative w-fit group" style={{ width: pickerwidth }}>
        <Flatpickr
          className="form-control py-2 string bg-white dark:bg-[#0e172a]"
          value={selectedDate}
          onChange={(date) => {
            const formatted = dayjs(date[0]).format("YYYY-MM-DD");
            setSelectedDate(formatted);
            onChangeDate?.(formatted);
          }}
          id={id}
          options={{
            dateFormat: dateformat,
            locale: Korean,
          }}
        />
        <Icon
          icon="heroicons-outline:calendar"
          className="absolute right-2 top-1/2 -translate-y-1/2 
      text-slate-400 dark:text-slate-300 
      transition-transform duration-200 group-hover:scale-150"
        />
      </div>

    </div>
  );
};

export default Auto_Label_DatePicker;
