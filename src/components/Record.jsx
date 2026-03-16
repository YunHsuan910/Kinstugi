import React from "react";

//匯入圖檔
import record from "../assets/record.png";
import recordEffect from "../assets/record-effect.png";

function Record({ memoryName }) {
  return (
    <div className="main-content result-content collection-wrap">
      <div className="record-wrap">
        <img className="record record-main" src={record} alt="唱片" />
        <img className="record-effect" src={recordEffect} alt="唱片光效" />
      </div>
      <div className="result-card">
        <p className="result-text memory-number">金繕印記</p>
        <h2 className="result-text memory-title">{memoryName}</h2>
      </div>
    </div>
  );
}

export default Record;
