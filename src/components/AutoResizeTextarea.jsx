import React, { useEffect, useRef } from "react";

function AutoResizeTextarea({ value, onChange, placeholder }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);
  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className="form-text"
      placeholder={placeholder}
    />
  );
}

export default AutoResizeTextarea;
