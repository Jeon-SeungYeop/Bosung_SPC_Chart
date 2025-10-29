import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import Cleave from "cleave.js/react";
import "cleave.js/dist/addons/cleave-phone.us";
const Textinput = ({
  type = "text",
  label,
  placeholder = "Add placeholder",
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
  horizontal,
  validate,
  isMask,
  msgTooltip,
  description,
  hasicon,
  onChange,
  options,
  onFocus,
  defaultValue,

  ...rest
}) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(!open);
  };

  // react-hook-form register에서 반환된 값 안전하게 분해하기
  // register가 없거나 name이 없으면 빈 객체 반환
  const { ref, onChange: rhfOnChange, onBlur: rhfOnBlur, name: rhfName } = (register && name ? register(name) : {}) || {};

  // onChange 합성 함수
  const handleChange = (e) => {
    if (rhfOnChange) rhfOnChange(e);
    if (onChange) onChange(e);
  };

  return (
    <div
      className={`fromGroup  ${error ? "has-error" : ""}  ${
        horizontal ? "flex" : ""
      }  ${validate ? "is-valid" : ""} `}
    >
      {label && (
        <label
          htmlFor={id}
          className={`block capitalize ${classLabel}  ${
            horizontal ? "flex-0 mr-6 md:w-[100px] w-[60px] break-words" : ""
          }`}
        >
          {label}
        </label>
      )}
      <div className={`relative ${horizontal ? "flex-1" : ""}`}>
        {name && !isMask && (
          <input
            type={type === "password" && open ? "text" : type}
            name={rhfName}
            ref={ref}
            className={`form-control py-2 ${error ? "has-error" : ""} ${className}`}
            placeholder={placeholder}
            readOnly={readonly}
            disabled={disabled}
            id={id}
            onChange={handleChange}
            onBlur={rhfOnBlur}
            defaultValue={defaultValue}
            {...rest}
          />
        )}
        {!name && !isMask && (
          <input
            type={type === "password" && open ? "text" : type}
            className={`form-control py-2 ${className}`}
            placeholder={placeholder}
            readOnly={readonly}
            disabled={disabled}
            id={id}
            onChange={onChange}
            defaultValue={defaultValue}
            {...rest}
          />
        )}
        {name && isMask && (
          <Cleave
            {...rest}
            {...(register && name ? register(name) : {})}
            placeholder={placeholder}
            options={options}
            className={`form-control py-2 ${error ? "has-error" : ""} ${className}`}
            onFocus={onFocus}
            id={id}
            readOnly={readonly}
            disabled={disabled}
            onChange={handleChange}
          />
        )}
        {!name && isMask && (
          <Cleave
            {...rest}
            placeholder={placeholder}
            options={options}
            className={`form-control py-2 ${error ? "has-error" : ""} ${className}`}
            onFocus={onFocus}
            id={id}
            readOnly={readonly}
            disabled={disabled}
            onChange={onChange}
          />
        )}
        {/* icon */}
        <div className="flex text-xl absolute ltr:right-[14px] rtl:left-[14px] top-1/2 -translate-y-1/2  space-x-1 rtl:space-x-reverse">
          {hasicon && (
            <span
              className="cursor-pointer text-secondary-500"
              onClick={handleOpen}
            >
              {open && type === "password" && (
                <Icon icon="heroicons-outline:eye" />
              )}
              {!open && type === "password" && (
                <Icon icon="heroicons-outline:eye-off" />
              )}
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
      {/* error and success message*/}
      {error && (
        <div
          className={` mt-2 ${
            msgTooltip
              ? " inline-block bg-danger-500 text-white text-[10px] px-2 py-1 rounded"
              : " text-danger-500 block text-sm"
          }`}
        >
          {error.message}
        </div>
      )}
      {/* validated and success message*/}
      {validate && (
        <div
          className={` mt-2 ${
            msgTooltip
              ? " inline-block bg-success-500 text-white text-[10px] px-2 py-1 rounded"
              : " text-success-500 block text-sm"
          }`}
        >
          {validate}
        </div>
      )}
      {/* only description */}
      {description && <span className="input-description">{description}</span>}
    </div>
  );
};

export default Textinput;
