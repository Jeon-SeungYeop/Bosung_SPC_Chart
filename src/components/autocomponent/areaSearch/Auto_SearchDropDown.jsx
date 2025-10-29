import React, { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/Icon";

const Auto_SearchDropDown = ({
    label,
    onChange,
    className = "",
    labelClass = "form-label",
    id,
    placeholder = "전체",
    disabled = false,
    inputWidth = "250px",
    value,
    horizontal = true,
    dropDownData = [], //
    error,
    msgTooltip,
    validate,
    description,
    labelSpacing, // 라벨 과 textbox 간격  ( labelSpacing="ml-2 mr-4"  -ml-2 (마이너스 수치 적용 ) 라벨 왼쪽 간격, 라벨 오른쪽 간격 동시 조절 가능   )
    defaultPlantCode = JSON.parse(localStorage.getItem("plantcode")), // 사용자 로그인 공장 정보로 추가 공장 설정
    defaultLang = "KO",
    defaultsitecode = 'B',
    height = "h-[38px]",
    defaultequipment = 'EQU0022',   // 테스트 화면 실시간 정보(가열로히팅) 조회부 드롭다운 고정을 위한 파라미터
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const dropdownRef = useRef();

    // 외부 value로 초기 선택값 설정
    useEffect(() => {
        if (id === "plantcode") {
            const match = dropDownData.find(opt => opt.value === defaultPlantCode);
            if (match) {
                setSelected(match);
                onChange?.(match); // 필요시 외부 onChange도 호출
                return;
            }
        }
        if (id === "lang"){
            const match = dropDownData.find(opt => opt.value === defaultLang);
            if (match) {
                setSelected(match);
                onChange?.(match);
                return;
            }
        }
        if (id === "sitecode"){ // id="sitecode" 추가 시 기본 B동 선택
            const match = dropDownData.find(opt => opt.value === defaultsitecode);
            if (match) {
                setSelected(match);
                onChange?.(match);
                return;
            }
        }
        // 테스트 화면 실시간 정보(가열로히팅) 조회부 드롭다운 고정을 위한 파라미터
        if (id === "equipment"){ // id="equipment" 추가 시 기본 EQU0022 선택
            const match = dropDownData.find(opt => opt.value === defaultequipment);
            if (match) {
                setSelected(match);
                onChange?.(match);
                return;
            }
        }

        if (value) {
            const match = dropDownData.find(opt => {
                return typeof value === "object"
                    ? opt.value === value.value
                    : opt.value === value;
            });
            if (match) {
                setSelected(match);
            }
        } else if (dropDownData.length > 0) {
            // 드롭다운 아이템이 있을 경우 첫 번째 아이템을 기본값으로 설정
            setSelected(dropDownData[0]);
            onChange?.(dropDownData[0]);
        }
    }, [id, value, dropDownData, defaultPlantCode, defaultLang]);

    // 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        setSelected(option);
        setIsOpen(false);
        onChange?.(option);
    };

    return (
        <div className={`fromGroup ${error ? "has-error" : ""} ${validate ? "is-valid" : ""} }`} ref={dropdownRef}>
            <div className={`flex ${horizontal ? "items-center" : "flex-col"}`}>
                {label && (
                    <label
                        htmlFor={id}
                        className={`capitalize  items-center text-left text-base font-normal ${horizontal ? labelSpacing : ""} w-[85px] min-w-[85px] `}
                    >
                        {label}
                    </label>
                )}

                <div className="relative w-fit">
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setIsOpen((prev) => !prev)}
                        className={`form-control text-left py-2 pr-10 text-slate-700 dark:text-slate-200 ${className} ${height}`}
                        style={{ width: inputWidth, minWidth: "50px", }}
                    >
                        {selected ? selected.label || selected.value : dropDownData?.length > 0 ? dropDownData[0].label || dropDownData[0].value : placeholder}
                    </button>

                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`} >
                        <Icon icon="heroicons:chevron-down" />
                    </div>

                    {isOpen && (
                        <ul className="dropdown-scroll absolute top-full left-0 w-full mt-1 border rounded shadow z-10 max-h-[150px] overflow-auto bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200">
                            {dropDownData.map((item, index) => (
                                <li
                                    key={item.value || `${item.label}-${index}`}
                                    className="px-4 py-2 text-base text-slate-700 dark:text-slate-200 hover:bg-blue-100 dark:hover:bg-slate-700 cursor-pointer"
                                    onClick={() => handleSelect(item)}
                                >
                                    {item.label}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            {/* 벨리데이션 성공 / 실패 메세지*/}
            {error && (
                <div className={`mt-2 ml-[5rem] ${msgTooltip ? "inline-block bg-danger-500 text-white text-[10px] px-2 py-1 rounded" : "text-danger-500 block text-sm"}`}>
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

export default Auto_SearchDropDown;
