import { Splitter, SplitterPanel } from 'primereact/splitter';

function Auto_Spliter({
  leftContent,
  rightContent,
  left_width = 30,
  vertical,
  onResize, // 크기 변경 콜백 추가
}) {
  return (
    <>
      {!vertical && (
        <Splitter 
          gutterSize={10} 
          className="w-full h-full items-center justify-center"
          onResizeEnd={onResize} // 크기 변경 이벤트 추가
        >
          <SplitterPanel size={left_width} minSize={20}>
            {leftContent}
          </SplitterPanel>
          <SplitterPanel size={100 - left_width}>
            {rightContent}
          </SplitterPanel>
        </Splitter>
      )}

      {vertical && (
        <Splitter 
          gutterSize={10} 
          className="items-center justify-center w-full h-[2800px]" 
          layout="vertical"
          onResizeEnd={onResize} // 크기 변경 이벤트 추가
        >
          <SplitterPanel className="w-full" size={left_width} minSize={20}>
            {leftContent}
          </SplitterPanel>
          <SplitterPanel className="w-full" size={100 - left_width}>
            {rightContent}
          </SplitterPanel>
        </Splitter>
      )}
    </>
  );
}

export default Auto_Spliter;

/*

import { useState, useEffect, useRef } from "react";

function Auto_Spliter({ leftContent, rightContent, left_width=30 }) {
  const leftGridRef = useRef(null);
  const containerRef = useRef(null);
  const [splitterLeftPx, setSplitterLeftPx] = useState(0);
  const [leftWidth, setLeftWidth] = useState(left_width);
  const isDragging = useRef(false);

  useEffect(() => {
    const updateSplitterPosition = () => {
      if (leftGridRef.current && containerRef.current) {
        const gridRect = leftGridRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        setSplitterLeftPx(gridRect.right - containerRect.left);
      }
    };
    updateSplitterPosition();
    window.addEventListener("resize", updateSplitterPosition);
    return () => window.removeEventListener("resize", updateSplitterPosition);
  }, [leftWidth]);

  const startDrag = () => {
    isDragging.current = true;
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const handleDrag = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const offsetX = e.clientX - containerRef.current.getBoundingClientRect().left;
    const newLeftWidth = (offsetX / containerWidth) * 100;
    if (newLeftWidth > 20 && newLeftWidth < 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  const stopDrag = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", stopDrag);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex">
      <div
        ref={leftGridRef}
        style={{ width: `${leftWidth}%`, marginRight: "1rem" }}
        className="h-full"
      >
        {leftContent}
      </div>

      <div
        onMouseDown={startDrag}
        className="absolute top-1/2 -translate-y-1/2 w-4 h-40 rounded-full cursor-col-resize bg-slate-500 dark:bg-slate-600 z-10"
        style={{ left: `${splitterLeftPx}px` }}
      />
      
      <div className="flex-1 h-full">
        {rightContent}
      </div>

    </div>
  );
}

export default Auto_Spliter;

*/