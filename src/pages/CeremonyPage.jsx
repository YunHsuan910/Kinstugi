/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "motion/react";

//圖檔匯入
import title from "../assets/ceremony-title.png";

//組件匯入
import EnterTrigger from "../components/EnterTrigger";
import BackgroundLight from "../components/BackgroundLight";
import AutoResizeTextarea from "../components/AutoResizeTextarea";
import ImageUpload from "../components/ImageUpload";
import RecordProcessing from "../components/RecordProcessing";
import ResultView from "../components/ResultView"; // 需建立結果播放組件

//Service匯入
import { generateMusic, stopMusic } from "../services/generateMusic";
import { generatePrompt } from "../services/generatePrompt";

function CeremonyPage() {
  // 頁面流程狀態：input (輸入), process (生成中), result (結果)
  const [step, setStep] = useState("input");

  // 要上傳的檔案類別：text (文字, image (圖片)
  const [inputType, setInputType] = useState("text");
  const [prompt, setPrompt] = useState("");

  // 資料狀態
  const [name, setName] = useState(""); //要上傳的標題
  const [content, setContent] = useState(""); //要上傳的內容
  const [fileSrc, setFileSrc] = useState(null); //預覽圖片的路徑

  // 音樂生成狀態
  const [musicData, setMusicData] = useState(null);

  // 處理圖片上傳後的狀態同步
  const handleImageChange = (file, previewUrl) => {
    setContent(file); // 儲存 File 物件供 API 使用
    setFileSrc(previewUrl); // 儲存預覽圖
  };

  // 生成音樂
  const handleStartRepair = async () => {
    if (!content || !name) {
      alert("請填寫完整記憶標題及內容");
      return;
    }

    // 進入處理畫面
    setStep("process");

    try {
      // 第一步：AI 分析情緒並產出音樂風格指令
      const musicPrompt = await generatePrompt(content, inputType, name);
      setPrompt(musicPrompt);
      console.log("AI 判斷的音樂風格：", musicPrompt);

      const musicResult = await generateMusic(musicPrompt);
      setMusicData(musicResult);

      // 完成音樂後進入結果頁
      console.log("準備進入結果頁...");
      setStep("result");
    } catch (error) {
      console.error("金繕修復失敗:", error);
      alert("金繕修復失敗:", error);
      setStep("input");
    }
  };

  return (
    <motion.div
      className="ceremony-container container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="title">
        <img src={title} alt="金繕儀式" />
        <p className="slogan">淬鍊那些裂痕，提升成專屬的慰藉</p>
      </div>
      {step === "input" && (
        <motion.main
          className="main-content"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <form action="#" className="form upload-form">
            <div className="form-item-wrap">
              <div className="form-item name">
                <div className="form-item-top">
                  <label htmlFor="memory-name" className="form-text form-label">
                    為你的記憶命名：
                  </label>
                  <input
                    type="text"
                    id="memory-name"
                    name="memory-name"
                    className="form-text"
                    placeholder="例如:初戀失敗的那個雨夜"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                {/* <span className="input-notice">重複的名稱</span> */}
              </div>
              <div className="form-item">
                <div className="form-item-top">
                  <label htmlFor="memory-text" className="form-text form-label">
                    請上傳要修補的記憶：
                  </label>
                  <div className="change-view-btn-wrap">
                    <div
                      className={`form-text change-view-btn ${inputType === "text" ? "active" : ""}`}
                      onClick={() => {
                        setInputType("text");
                        setContent("");
                      }}
                    >
                      文字
                    </div>
                    <span className="divider-line"></span>
                    <div
                      className={`form-text change-view-btn ${inputType === "image" ? "active" : ""}`}
                      onClick={() => {
                        setInputType("image");
                        setContent("");
                      }}
                    >
                      圖片
                    </div>
                  </div>
                  {inputType === "text" ? (
                    <div key="text" className="memory-content">
                      <AutoResizeTextarea
                        id="upload-memory-text"
                        name="upload-memory-text"
                        className="form-text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="輸入詳細的記憶，完成後長按開始記憶金繕，我們會用魔法將記憶淬鍊成黑膠唱片，邀請你聆聽並試著用不同的觀點感受那份回憶，祝你一切順利！"
                      />
                    </div>
                  ) : (
                    <ImageUpload
                      handleImageChange={handleImageChange}
                      fileSrc={fileSrc}
                    />
                  )}
                </div>
              </div>
            </div>

            <EnterTrigger
              onComplete={handleStartRepair}
              targetPath={null}
              mainText="開始記憶金繕"
              subText="START REPAIR"
            />
          </form>
        </motion.main>
      )}
      {step === "process" && <RecordProcessing />}
      {step === "result" && (
        <ResultView
          memoryName={name}
          musicPrompt={prompt}
          musicData={musicData}
        />
      )}

      <BackgroundLight />
    </motion.div>
  );
}

export default CeremonyPage;
