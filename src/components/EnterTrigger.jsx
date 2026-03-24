import { useNavigate } from "react-router-dom";
import React, { useRef, useState } from "react";
import FingerPrintDrawing from "./FingerPrintDrawing";

function EnterTrigger({ targetPath, onComplete, mainText, subText }) {
  const timerRef = useRef(null); // 儲存定時器 ID
  const [isPressing, setIsPressing] = useState(false);
  const HOLD_DURATION = 1000; //長按時間設定
  const navigate = useNavigate();

  const handleTouchStart = () => {
    setIsPressing(true);
    timerRef.current = setTimeout(() => {
      //如果沒有呼叫動作，則執行跳轉頁面
      if (onComplete) {
        onComplete();
      } else if (targetPath) {
        navigate(targetPath);
      }
    }, HOLD_DURATION);
  };

  const handleTouchEnd = () => {
    setIsPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      console.log("鬆開，未達到長按");
      timerRef.current = null;
    }
  };
  return (
    <div
      className={`enter-trigger ${isPressing ? "active" : ""}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      //兼容鼠標事件（可同時處理PC及移動端）
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <div className="icon">
        <FingerPrintDrawing isPressing={isPressing} />
      </div>
      <div className="text">
        <p className="main-text">{mainText}</p>
        <p className="sub-text">{subText}</p>
      </div>
    </div>
  );
}

export default EnterTrigger;
