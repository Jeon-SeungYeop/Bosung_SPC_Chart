import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/Icon";

// AG Grid의 ICellEditorComp 인터페이스를 구현한 셀 에디터 컴포넌트
const Auto_Grid_Password_AGgird = ({ value, onValueChange }) => {
    const [showPassword, setShowPassword] = useState(false); // 비밀번호 표시/숨김 상태
    const [tempDate, setTempDate] = useState(value || "");

    useEffect(() => {
        setTempDate(value || "");
    }, [value]);

    // 비밀번호 표시/숨김 토글
    const toggleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className="w-full h-full relative flex items-center">
            <input
                value={tempDate}
                type={showPassword ? "text" : "password"} // 비밀번호 표시 여부에 따라 타입 전환
                className="w-full h-full border-transparent bg-transparent focus:outline-none "
                onChange={(e) => {
                    onValueChange(e.target.value);
                }}
            />
            <div
                onClick={toggleShowPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
            >
                <Icon
                icon={showPassword ? "heroicons-outline:eye-off" : "heroicons-outline:eye"}
                className="text-slate-400 dark:text-slate-300 transition-transform duration-200 group-hover:scale-150"
                />
            </div>
        </div>
    );
};

export default Auto_Grid_Password_AGgird;
