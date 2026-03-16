import React from "react";
//匯入組件
import Record from "./Record";

function HasCollections() {
  return (
    <div className="main-content collections-content">
      <div className="search">
        <input type="text" placeholder="搜尋回憶名稱" />
        <div className="search-icon">
          <svg viewBox="0 0 512 512">
            <path d="M206.06,411.95c45.76,0,90.22-15.27,126.32-43.39l136.21,136.21c10.18,9.83,26.39,9.55,36.22-.63,9.59-9.93,9.59-25.66,0-35.59l-136.21-136.21c69.78-89.82,53.53-219.21-36.29-288.99S113.1-10.17,43.32,79.65s-53.53,219.21,36.29,288.99c36.16,28.09,80.66,43.33,126.45,43.31h0ZM96.62,96.58c60.44-60.44,158.44-60.45,218.89,0,60.44,60.44,60.45,158.44,0,218.89-60.44,60.44-158.44,60.45-218.89,0h0c-60.44-60.01-60.8-157.65-.8-218.09.27-.27.53-.53.8-.8h0Z"></path>
          </svg>
        </div>
      </div>
      <div className="collections-wrap">
        <div className="collections">
          <Record memoryName="123"></Record>
          <Record memoryName="123"></Record>
          <Record memoryName="123"></Record>
        </div>
        <div className="control-btns-wrap">
          <div className="prev-btn control-btn">
            <svg viewBox="0 0 48 48">
              <g className="icon-prev">
                <path
                  class="st0"
                  d="M8.12,45.68c-.9.71-2.13.85-3.17.35s-1.69-1.55-1.69-2.7V5.34c0-1.15.66-2.2,1.69-2.7,1.04-.5,2.27-.37,3.17.35l24.02,18.99c.72.57,1.14,1.44,1.14,2.35s-.42,1.79-1.14,2.36l-24.02,19Z"
                />
                <path
                  class="st0"
                  d="M42.27,46.35h-3c-1.66,0-3-1.34-3-3V5.33c0-1.66,1.34-3,3-3h3c1.66,0,3,1.34,3,3v38.02c0,1.66-1.34,3-3,3Z"
                />
              </g>
            </svg>
          </div>
          <div className="play-btn control-btn">
            <svg className="icon-play" viewBox="0 0 32 32">
              <g data-name="Play">
                <path d="m26.17 12.37-17.17-9.92a3.23 3.23 0 0 0 -1.62-.45 3.38 3.38 0 0 0 -3.38 3.38v21.29a3.33 3.33 0 0 0 5.1 2.82l17.19-10.86a3.65 3.65 0 0 0 -.12-6.26z" />
              </g>
            </svg>
          </div>
          <div className="next-btn control-btn">
            <svg viewBox="0 0 48 48">
              <g className="icon-prev">
                <path
                  class="st0"
                  d="M8.12,45.68c-.9.71-2.13.85-3.17.35s-1.69-1.55-1.69-2.7V5.34c0-1.15.66-2.2,1.69-2.7,1.04-.5,2.27-.37,3.17.35l24.02,18.99c.72.57,1.14,1.44,1.14,2.35s-.42,1.79-1.14,2.36l-24.02,19Z"
                />
                <path
                  class="st0"
                  d="M42.27,46.35h-3c-1.66,0-3-1.34-3-3V5.33c0-1.66,1.34-3,3-3h3c1.66,0,3,1.34,3,3v38.02c0,1.66-1.34,3-3,3Z"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HasCollections;
