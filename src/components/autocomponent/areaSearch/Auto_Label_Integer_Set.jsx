import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import Cleave from "cleave.js/react";
import "cleave.js/dist/addons/cleave-phone.us";

const Auto_Label_Integer_Set = ({
  type,
  label, // textBox label
  placeholder = "",
  classLabel = "form-label",
  className = "",
  classGroup = "",
  register,
  name,
  readonly,
  value,
  error,
  icon,
  disabled,
  id,
  horizontal = true,
  validate,
  isMask,
  msgTooltip,
  description,
  hasicon,
  onChange,
  options,
  onFocus,
  defaultValue,
  labelSpacing, // 라벨 과 textbox 간격  ( labelSpacing="ml-2 mr-4"  -ml-2 (마이너스 수치 적용 ) 라벨 왼쪽 간격, 라벨 오른쪽 간격 동시 조절 가능   )
  inputWidth = "100%", // 기본값은 220px로 설정, 사용자가 조정 가능
  ...rest
}) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(!open);
  };

  return (
    <div
      className={`fromGroup  ${error ? "has-error" : ""} ${validate ? "is-valid" : ""} md:space-x-20`}
    >
      <div className={`flex items-center ${horizontal ? "" : ""}  space-y-1`}>
        {label && (
          <label
            htmlFor={id}
            className={`capitalize  items-center text-left text-base font-normal ${horizontal ? labelSpacing : ""} w-[85px] `}
          >
            {label}
          </label>
        )}

        <div className={`relative flex items-center ${horizontal ? "flex-grow" : ""}`}>

          {/* Masked Input */}
          <Cleave 
            placeholder={placeholder}
            options={{
              numeral: true,
              numeralThousandsGroupStyle: "thousand",
              numeralDecimalMark: ".", // 소수점 기호 (필요시)
              delimiter: ",",           // 천 단위 구분자
            }}
            className={`${error ? " has-error" : ""} form-control py-2 ${className}`}
            onFocus={onFocus}
            id={id}
            readOnly={readonly}
            disabled={disabled}
            value={value ?? ""} // value 연결
            onChange={(e) => {
              const rawValue = e.target.rawValue; // Cleave의 포맷팅 안 된 원본 값
              if (onChange) {
                onChange({
                  ...e,
                  target: {
                    ...e.target,
                    name,
                    value: rawValue, // rawValue로 넘김
                  },
                });
              }
            }}
            style={{ width: inputWidth }}
          />

          {/* Icon */}
          <div className="flex text-xl absolute ltr:right-[24px] rtl:left-[24px] top-1/2 -translate-y-1/2 space-x-1 rtl:space-x-reverse">
            {hasicon && (
              <span
                className="cursor-pointer text-secondary-500"
                onClick={handleOpen}
              >
                {open && type === "password" && <Icon icon="heroicons-outline:eye" />}
                {!open && type === "password" && <Icon icon="heroicons-outline:eye-off" />}
              </span>
            )}

            {error && (
              <span className="text-danger-500">
                <Icon icon="heroicons-outline:information-circle" />
              </span>
            )}
            {validate && (
              <span className="text-success-500">
                <Icon icon="bi:check-lg" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 벨리데이션 성공 / 실패 메세지*/}
      {error && (
        <div className={`mt-2 ml-[6rem] ${msgTooltip ? "inline-block bg-danger-500 text-white text-[10px] px-2 py-1 rounded" : "text-danger-500 block text-sm"}`}>
          {error.message}
        </div>
      )}
      {validate && (
        <div className={`mt-2 ml-20 ${msgTooltip ? "inline-block bg-success-500 text-white text-[10px] px-2 py-1 rounded" : "text-success-500 block text-sm"}`}>
          {validate}
        </div>
      )}
      {description && <span className="input-description">{description}</span>}
    </div>
  );
};

export default Auto_Label_Integer_Set;
