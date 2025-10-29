import React from "react";
import CheckImage from "@/components/assets/images/icon/ck-white.svg";

const Auto_Checkbox = ({
  id,
  disabled,
  label,
  value,
  name,
  onChange,
  activeClass = "ring-black-500 bg-slate-400 dark:bg-slate-700 dark:ring-slate-700",
  classLabel = "form-label text-base text-left font-normal text-slate-500",
  labelSpacing = "ml-6", // 체크박스와 라벨 사이 간격
}) => {
  return (
    <label
      className={`flex items-center ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      id={id}
    >
      <div>
        {/* 라벨 - 왼쪽에 위치 */}
        <span className={`${classLabel} capitalize leading-6`}>{label}</span>
      </div>

      {/* 체크박스 - labelSpacing을 margin-left로 설정하여 간격 조절 */}
      <span
        className={`h-6 w-6 flex-none border-slate-100 dark:border-slate-800 rounded 
          relative transition-all duration-150 flex items-center justify-center ${labelSpacing} -mt-2
          ${value
            ? activeClass + ""
            : "bg-slate-100 dark:bg-slate-600 dark:border-slate-600"
        }
        focus:ring-2 focus:ring-white focus:ring-offset-2 focus:outline-none`}
      >
        {value && (
          <img
            src={CheckImage}
            alt="checked"
            className="h-5 w-5"
          />
        )}
      </span>

      {/* 접근성을 위한 숨겨진 체크박스 */}
      <input
        type="checkbox"
        className="sr-only"
        name={name}
        checked={value}  // value에 따라 checked 값 동적으로 설정
        onChange={onChange}  // 체크박스 상태 변경 시 onChange 호출
        id={id}
        disabled={disabled}
        tabIndex={0}
      />
    </label>
  );
};

export default Auto_Checkbox;
