import React, { useEffect, useRef, useState } from "react";
import ProgressBar from "progressbar.js";
import useDarkMode from "@/services/hooks/useDarkMode";

const ProgressBarComponent = ({ data }) => {
  const [isDark] = useDarkMode();
  const progressBarRef = useRef(null);
    
  useEffect(() => {
    const bar = new ProgressBar.Line(progressBarRef.current, {
      strokeWidth: 4,
      easing: "easeInOut",
      duration: 1400,
      color: data.page == 'factor' ? "#FFEA82"
            : data.page == 'frequency' ? "#8d79ab"
            : data.page == 'temperature' ? "#EA4228"
            : data.page == 'humidity' ? "#00cdff"
            : "#65baa9",                             // page 값에 따라 색 변환
      trailColor: "#eee",
      trailWidth: data.page == 'temperature' ? 4    // page 값에 따라 기준바 두께 변환
                : data.page == 'humidity' ? 4
                : 1,
      svgStyle: { width: "100%", height: "100%" },
      text: {
        style: {
          color: isDark ? "#334155" : "#e2e8f0",
          position: "absolute",
          right: "0",
          top: "10px",
          padding: 0,
          margin: 0,
          transform: null,
        },
        autoStyleContainer: false,
      },
      from: { color: "#FFEA82" },
      to: { color: "#ED6A5A" },
      step: (state, bar) => {
        data.page == 'temperature' ? null
        : data.page == 'humidity' ? null
        :bar.setText(Math.round(bar.value() * 100) + data.unit);
      },
      
    });

    bar.animate(data.value); // Number from 0.0 to 1.0

    return () => {
      bar.destroy(); 
    };
  }, [data.value]);

  return (
    data.page == 'temperature' ? <div ref={progressBarRef} style={{ margin: 20, width: parent, height: 8, position: 'relative', borderRadius:'10px', overflow:'hidden'}}/>
    : data.page == 'humidity' ? <div ref={progressBarRef} style={{ margin: 20, width: parent, height: 8, position: 'relative', borderRadius:'10px', overflow:'hidden'}}/>
    : <div ref={progressBarRef} style={{ margin: 20, width: parent, height: 8, position: 'relative', }}/>
  );
};

export default ProgressBarComponent;
