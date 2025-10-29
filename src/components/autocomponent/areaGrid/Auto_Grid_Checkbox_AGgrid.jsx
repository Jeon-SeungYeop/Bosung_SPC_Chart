import { useState, useEffect } from "react";
import useDarkmode from "@/services/hooks/useDarkMode";

const Auto_Grid_Checkbox_AGgrid = ({ value, onValueChange }) => {
  const [checked, setChecked] = useState(value === "Y");
  const isDark = useDarkmode();

  useEffect(() => {
    setChecked(value === "Y");
  }, [value]);

  const handleChange = (e) => {
    const isChecked = e.target.checked;
    setChecked(isChecked);
    onValueChange?.(isChecked ? "Y" : "N");
  };

  return (
    <div className="w-full h-full flex justify-center items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className={`
          w-4 h-4 
          appearance-none 
          border border-gray-300 
          rounded-full 
          bg-white 
          cursor-pointer 
          relative
          focus:outline-none 
          checked:bg-blue-600
          checked:border-blue-600
        `}
      />
      {checked && (
        <svg
          className="pointer-events-none absolute w-2 h-2 text-white"
          viewBox="0 0 8 8"
        >
          <circle cx="4" cy="4" r="3" fill="currentColor" />
        </svg>
      )}
    </div>
  );
};

export default Auto_Grid_Checkbox_AGgrid;