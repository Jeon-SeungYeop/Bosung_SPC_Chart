import React, { Fragment } from "react";
import Icon from "@/components/ui/Icon";

const Auto_Select = ({
  label,
  placeholder = "Select Option",
  classLabel = "form-label",
  className = "",
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
  msgTooltip,
  description,
  onChange,
  options,
  defaultValue,
  labelSpacing = "mr-3",   // 
  inputWidth = "250px",  // select 박스 너비 조정 
  ...rest
}) => {
  options = options || Array(3).fill("option");

  return (
    <div className={`fromGroup ${error ? "has-error" : ""} ${validate ? "is-valid" : ""}`}>
      <div className={`flex items-center ${horizontal ? "space-x-2" : ""}`}>
        {label && (
          <label
            htmlFor={id}
            className={`capitalize ${classLabel} text-left text-base font-normal ${
              horizontal ? labelSpacing : ""
            } mt-[4px]`}
          >
            {label}
          </label>
        )}

        <div className={`relative flex items-center ${horizontal ? "flex-grow" : ""}`}>
          <select
            onChange={onChange}
            {...(register && name ? register(name) : {})}
            {...rest}
            className={`form-control py-2 appearance-none ${error ? "has-error" : ""} ${className}`}
            placeholder={placeholder}
            readOnly={readonly}
            disabled={disabled}
            id={id}
            value={value}
            size={rest.size}
            defaultValue={defaultValue}
            style={{ width: inputWidth }}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option, i) => (
              <Fragment key={i}>
                {option.value && option.label ? (
                  <option value={option.value}>{option.label}</option>
                ) : (
                  <option value={option}>{option}</option>
                )}
              </Fragment>
            ))}
          </select>

          {/* Icon 영역 */}
          <div className="flex text-xl absolute ltr:right-[14px] rtl:left-[14px] top-1/2 -translate-y-1/2 space-x-1 rtl:space-x-reverse">
            <span className="relative -right-2 inline-block text-slate-900 dark:text-slate-300 pointer-events-none">
              <Icon icon="heroicons:chevron-down" />
            </span>
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

      {/* 메시지 영역 */}
      {error && (
        <div
          className={`mt-2 ml-[7rem] ${
            msgTooltip
              ? "inline-block bg-danger-500 text-white text-[10px] px-2 py-1 rounded"
              : "text-danger-500 block text-sm"
          }`}
        >
          {error.message}
        </div>
      )}
      {validate && (
        <div
          className={`mt-2 ml-[7rem] ${
            msgTooltip
              ? "inline-block bg-success-500 text-white text-[10px] px-2 py-1 rounded"
              : "text-success-500 block text-sm"
          }`}
        >
          {validate}
        </div>
      )}
      {description && <span className="input-description">{description}</span>}
    </div>
  );
};

export default Auto_Select;
