import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import Icon from "@/components/ui/Icon";

const Auto_GridDropDown = ({
    label,
    onChange,
    className = "",
    labelClass = "form-label",
    id,
    placeholder = "전체",
    disabled = false,
    value,
    labelSpacing = "mr-3",
    horizontal = true,
    dropDownData = [],   

}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef();
    const dropdownRef = useRef();
    const listRef = useRef();


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                listRef.current &&
                !listRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
    
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 2. 외부 value가 변경되면 선택된 항목 갱신
    useEffect(() => {
        if (value !== undefined && dropDownData.length > 0) {
            const match = dropDownData.find((opt) => {
                return typeof value === "object"
                    ? opt.value === value.value
                    : opt.value === value;
            });
            setSelected(match || null);
        }
    }, [value, dropDownData]); // value 또는 옵션 목록이 바뀌면 selected 갱신





    // 드롭다운 위치 설정
    const openDropdown = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
        setIsOpen(true);
    };
    const handleSelect = (option) => {
        setSelected(option);
        setIsOpen(false);
        // 외부 상태도 업데이트할 수 있도록 콜백
        onChange?.(option); 
    };


    return (
        <div className="fromGroup" ref={dropdownRef}>
            <div className={`flex ${horizontal ? "items-center" : "flex-col"} gap-x-2`}>
                {label && (
                    <label
                        htmlFor={id}
                        className={`capitalize ${labelClass} text-left text-base font-normal mt-[4px] ${labelSpacing}`}
                    >
                        {label}
                    </label>
                )}

                <div className="relative w-full">
                    <button
                        ref={buttonRef}
                        type="button"
                        disabled={disabled}
                        onClick={openDropdown}
                        className={`form-control w-full text-left py-2 pr-10 border-0 bg-[#F1F5F9] text-slate-500 h-[30px] dark:text-slate-300 dark:bg-[#263451] dark:border-gray-700 ${className}`}
                    >
                        {selected ? selected.label || selected.value : placeholder}
                    </button>
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`} >
                        <Icon icon="heroicons:chevron-down" />
                    </div>

                </div>
            </div>

            {/* Portal 렌더링 */}
            {isOpen &&
                ReactDOM.createPortal(
                    <ul
                        ref={listRef}  
                        className="absolute max-h-[150px] overflow-auto z-[9999] border rounded shadow bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200"
                        style={{
                            position: "fixed",
                            top: position.top,
                            left: position.left,
                            width: position.width,
                        }}
                    >
                        {dropDownData.map((item, index) => (
                            <li
                                key={item.value || `${item.label}-${index}`}
                                className="px-4 py-2 text-base text-slate-700 dark:text-slate-200 hover:bg-blue-100 dark:hover:bg-slate-700 cursor-pointer"
                                onClick={() => handleSelect(item)}
                            >
                                {item.label}
                            </li>
                        ))}
                    </ul>,
                    document.body
                )}

        </div>
    );
};

export default React.memo(Auto_GridDropDown);

