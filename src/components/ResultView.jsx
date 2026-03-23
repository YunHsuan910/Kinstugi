/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
//匯入圖檔
import record from "../assets/record.png";
import recordEffect from "../assets/record-effect.png";
//匯入組件
import Record from "../components/Record";
//匯入音訊服務
import { stopMusic, getGeneratedSamples } from "../services/generateMusic";
import { downloadMusic } from "../services/downloadMusic";
import { saveMemoryToDB } from "../services/dbService";

function ResultView({ memoryName }) {
  const navigate = useNavigate();

  // 音樂播放的狀態
  const [isMusicPlay, setIsMusicPlay] = useState(true);
  // 是否為初次掛載
  const isInitialMount = useRef(true);

  // 控制音樂暫停/播放
  const handleMusicPlay = async () => {
    const ctx = window.sharedAudioContext;

    if (ctx) {
      // 這是解決點擊也沒聲音的最強手段
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      // 如果音樂目前是暫停的(suspend)，那就 resume；反之亦然
      const nextState = !isMusicPlay;
      setIsMusicPlay(nextState);

      if (nextState) {
        await ctx.resume();
      } else {
        await ctx.suspend();
      }
    }
  };

  // 處理重新開始儀式
  const handleReset = () => {
    stopMusic();
    window.location.reload();
  };

  //下載音樂
  const handleDownload = () => {
    // 1. 從音樂服務拿數據
    const { samples, sampleRate } = getGeneratedSamples();

    // 2. 丟給匯出服務處理
    const success = downloadMusic(
      samples,
      sampleRate,
      `${memoryName}_金繕印記.wav`,
    );

    if (!success) {
      alert("音樂修復中，請稍候再試...");
    }
  };

  //儲存音樂到資料庫
  const handleSave = async () => {
    const { samples, sampleRate } = getGeneratedSamples();

    if (!samples || samples.length === 0) {
      alert("金繕回響尚未生成完畢...");
      return;
    }

    const newMemory = {
      name: memoryName,
      samples: samples,
      sampleRate: sampleRate,
      timestamp: new Date().toISOString(),
    };

    try {
      await saveMemoryToDB(newMemory);
      // 停止音樂，避免跳轉後背景音樂還在放（視你的設計而定）
      stopMusic();
      // 跳轉
      navigate("../collection");
    } catch (err) {
      alert("儲存失敗，請檢查資料庫連線");
    }
  };

  useEffect(() => {
    const syncAudio = async () => {
      const ctx = window.sharedAudioContext;

      if (ctx) {
        if (ctx.state === "suspended") {
          console.log("偵測到音訊掛起，正在恢復...");
          await ctx.resume();
        }
        console.log("當前音訊狀態:", ctx.state);
      } else {
        console.warn("尚未偵測到共享的 AudioContext");
      }
    };

    syncAudio();

    // 卸載時停止播放 (這會呼叫你 service 裡的 stopMusic)
    // return () => stopMusic();
  }, []);

  return (
    <div className="main-content result-content">
      <div className={`record-wrap ${isMusicPlay ? "" : "pause"}`}>
        <img className="record record-main" src={record} alt="唱片" />
        <img className="record-effect" src={recordEffect} alt="唱片光效" />
        <div className="record icon" onClick={() => handleMusicPlay()}>
          {isMusicPlay ? (
            <svg className="icon-pause" viewBox="0 0 32 32">
              <g data-name="Pause">
                <path d="m13 5v22a3 3 0 0 1 -3 3h-1a3 3 0 0 1 -3-3v-22a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3zm10-3h-1a3 3 0 0 0 -3 3v22a3 3 0 0 0 3 3h1a3 3 0 0 0 3-3v-22a3 3 0 0 0 -3-3z" />
              </g>
            </svg>
          ) : (
            <svg className="icon-play" viewBox="0 0 32 32">
              <g data-name="Play">
                <path d="m26.17 12.37-17.17-9.92a3.23 3.23 0 0 0 -1.62-.45 3.38 3.38 0 0 0 -3.38 3.38v21.29a3.33 3.33 0 0 0 5.1 2.82l17.19-10.86a3.65 3.65 0 0 0 -.12-6.26z" />
              </g>
            </svg>
          )}
        </div>
      </div>
      <div className="result-card">
        <p className="result-text memory-number">金繕印記</p>
        <h2 className="result-text memory-title">{memoryName}</h2>
      </div>

      <div className="btn-wrap">
        <div className="btn-text change-view-btn" onClick={handleReset}>
          重新金繕
        </div>
        <span className="divider-line"></span>
        <div className="btn-text change-view-btn" onClick={handleSave}>
          儲存記憶
        </div>
        <span className="divider-line"></span>
        <div className="btn-text change-view-btn" onClick={handleDownload}>
          下載音樂
        </div>
      </div>
    </div>
  );
}

export default ResultView;
