import React from "react";

function MemoryContent({ content, type }) {
  if (!content) return <div className="no-content">回憶已模糊...</div>;

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