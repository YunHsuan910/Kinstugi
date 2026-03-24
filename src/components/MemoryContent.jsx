import React from "react";

function MemoryContent({ content, type }) {
  if (!content) return <div className="no-content">回憶已模糊...</div>;

  // 預防萬一：如果還是抓到物件，顯示提示文字而不是崩潰
  if (typeof content !== "string") {
    return <p className="error">記憶格式錯誤，請重新金繕。</p>;
  }
  return (
    <div className="memory-content-wrapper">
      {type === "image" ? (
        <img src={content} alt="原始記憶" className="original-image" />
      ) : (
        <p className="original-text">{content}</p>
      )}
    </div>
  );
}

export default MemoryContent;
