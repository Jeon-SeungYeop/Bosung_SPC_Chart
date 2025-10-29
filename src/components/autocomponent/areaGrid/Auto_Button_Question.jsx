import Icon from "@/components/ui/Icon"; 
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

function Auto_Button_Question({
  text = "",
  type = "button", 
  className=" btn-dark shadow-base2 font-normal btn-sm rounded-full ",
  icon="heroicons-outline:information-circle", 
  iconPosition = "left",
  iconClass = "text-lg", 
  description,
  direction = 'up',    // 설명창 방향 설정
}) { 
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const btnRef = useRef(null);
  const portalRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const GAP = 8;

  const onClick = () => setIsDescriptionOpen((v) => !v);

  const updatePosition = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    
    if (direction === 'up') {
      setPos({
        top: r.top,                           // 버튼 top 기준 (위쪽 표시)
        left: r.left + r.width / 2,           // 버튼 가로 중앙
      });
    } else {
      setPos({
        top: r.bottom,                        // 버튼 bottom 기준 (아래쪽 표시)
        left: r.left + r.width / 2,           // 버튼 가로 중앙
      });
    }
  };

  useLayoutEffect(() => {
    if (isDescriptionOpen) updatePosition();
  }, [isDescriptionOpen, direction]);

  useEffect(() => {
    if (!isDescriptionOpen) return;
    const handler = () => updatePosition();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [isDescriptionOpen]);

  useEffect(() => {
    if (!isDescriptionOpen) return;
    const onDown = (e) => {
      const path = e.composedPath ? e.composedPath() : [];
      if (!path.includes(btnRef.current) && !path.includes(portalRef.current)) {
        setIsDescriptionOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isDescriptionOpen]);

  const overlayRoot = document.getElementById("overlay-root") || document.body;

  // direction에 따른 transform과 화살표 위치 설정
  const getTransformStyle = () => {
    if (direction === 'up') {
      return "translate(-50%, -100%) translateY(-8px)";
    } else {
      return "translate(-50%, 0%) translateY(8px)";
    }
  };

  const getArrowClasses = () => {
    if (direction === 'up') {
      // 위쪽 표시일 때: 화살표가 아래쪽을 향함
      return "absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800";
    } else {
      // 아래쪽 표시일 때: 화살표가 위쪽을 향함
      return "absolute left-1/2 -top-2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white dark:border-b-gray-800";
    }
  };

  return (
    <div className="relative inline-block">
      <button
        ref={btnRef}
        type={type}
        onClick={onClick}
        className={`btn ${className} group 
          bg-[#F1F5F9] text-[#141412] dark:bg-[#0F172A] dark:text-[#DFF6FF] dark:shadow-lg
        `}
      > 
        <span className="flex items-center">
          {icon && (
            <span
              className={`
                transition-transform duration-300 ease-in-out group-hover:scale-150
                ${iconPosition === "right" ? "order-1 ltr:ml-2 rtl:mr-2" : ""}
                ${text && iconPosition === "left" ? "ltr:mr-2 rtl:ml-2" : ""}
                ${iconClass}
              `}
            >
              <Icon icon={icon}/>
            </span>
          )}
          <span>{text}</span>
        </span> 
      </button>

      {isDescriptionOpen &&
        createPortal(
          <div
            ref={portalRef}
            className="pointer-events-auto"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              transform: getTransformStyle(),
              zIndex: 2147483647,
            }}
          >
            <div className="relative px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 shadow-xl w-96 max-w-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-normal break-words">
                    {description}
                  </p>
                </div>
              </div>
              {/* direction에 따른 화살표 */}
              <div className={getArrowClasses()}></div>
            </div>
          </div>,
          overlayRoot
        )
      }
    </div>
  );
}

export default Auto_Button_Question;