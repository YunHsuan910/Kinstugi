import React, { useState } from "react";

function ImageUpload({ handleImageChange, fileSrc }) {
  const [isDragging, setIsDragging] = useState(false); //是否為拖曳狀態
  const [selectedFile, setSelectedFile] = useState(null);

  //拖曳進入
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  //拖曳離開
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  //放開檔案
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];

    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  };
  //統一處理點擊或拖曳進來的檔案
  const processFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      //將檔案傳給父組件
      handleImageChange(file, reader.result);
    };
    reader.readAsDataURL(file);
    setSelectedFile(file);
  };
  return (
    <div
      key="image"
      className={`memory-content ${isDragging ? "dragging" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        className="input-hidden"
        type="file"
        name="upload-memory-img"
        id="upload-memory-img"
        onChange={(e) => processFile(e.target.files[0])}
        accept="image/*"
      />
      <label
        htmlFor="upload-memory-img"
        className="upload-memory-img form-text"
      >
        {selectedFile ? (
          <div className="file-preview">
            <img src={fileSrc} alt="預覽圖片" />
            {selectedFile.name}
          </div>
        ) : (
          <div className="upload-default-text-wrap">
            <span className="upload-icon">
              <svg id="upload-icon" data-name="upload-icon" viewBox="0 0 24 24">
                <path d="M22,13a1,1,0,0,0-1,1v4.213A2.79,2.79,0,0,1,18.213,21H5.787A2.79,2.79,0,0,1,3,18.213V14a1,1,0,0,0-2,0v4.213A4.792,4.792,0,0,0,5.787,23H18.213A4.792,4.792,0,0,0,23,18.213V14A1,1,0,0,0,22,13Z" />
                <path d="M6.707,8.707,11,4.414V17a1,1,0,0,0,2,0V4.414l4.293,4.293a1,1,0,0,0,1.414-1.414l-6-6a1,1,0,0,0-1.414,0l-6,6A1,1,0,0,0,6.707,8.707Z" />
              </svg>
            </span>
            <span className="upload-text">按這裡或拖曳上傳圖片</span>
          </div>
        )}
      </label>
    </div>
  );
}

export default ImageUpload;
