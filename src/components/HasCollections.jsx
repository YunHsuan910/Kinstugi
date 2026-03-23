import React, { useState, useRef, useEffect } from "react";
//匯入Swiper
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
// import required modules
import { Navigation, Pagination, Mousewheel, Keyboard } from "swiper/modules";

//匯入組件
import Record from "./Record";
//匯入服務
import { getMemoryByIdFromDB } from "../services/dbService";

function HasCollections({ memories }) {
  console.log(memories);
  const [searchTerm, setSearchTerm] = useState("");

  // --- 播放器與 Swiper 狀態 ---
  const [swiperRef, setSwiperRef] = useState(null); // Swiper 實例
  const [activeMemoryIndex, setActiveMemoryIndex] = useState(0); // 當前索引
  const [isMusicPlay, setIsMusicPlay] = useState(false); // 播放狀態

  // 使用 useRef 存儲 AudioNode，這很重要！
  const sourceNodeRef = useRef(null);

  const pauseTimeRef = useRef(0); // 暫停時累積的播放秒數
  const startTimeRef = useRef(0); // 本次開始播放的起始時間點

  const filteredMemories = memories.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase().trim()),
  );
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // 1. 搜尋時索引必須歸零，否則搜尋結果只有 1 筆時，
    // 若原本 Index 是 5，畫面會因為找不到資料而空白。
    setActiveMemoryIndex(0);

    // 2. 徹底重置音訊進度與暫存時間
    // 這樣新搜尋出來的唱片點擊播放時，才會從 00:00 開始。
    resetAudioProgress();

    // 3. 如果 Swiper 有實例，建議也強制跳回第一個
    swiperRef?.slideTo(0);
  };

  // --- 暫停/停止音樂 ---
  const stopCurrentMusic = () => {
    const node = sourceNodeRef.current;
    if (node) {
      try {
        // 計算並存儲目前的播放進度
        const ctx = window.sharedAudioContext;
        if (ctx) {
          // 本次播放的時間 = 現在時間 - 開始時間
          const elapsed = ctx.currentTime - startTimeRef.current;
          // 總進度 = 之前累積的進度 + 本次播放的時間
          // 使用餘數確保如果音樂 loop 了，時間不會超出 buffer 長度
          pauseTimeRef.current =
            (pauseTimeRef.current + elapsed) % node.buffer.duration;
        }

        node.onended = null;
        node.stop();
      } catch (err) {
        console.error(err);
      }
      sourceNodeRef.current = null;
    }
    setIsMusicPlay(false);
  };

  // --- 播放音樂 ---
  const playCurrentMusic = async (targetIndex = null) => {
    // 1. 判斷是否為「切換歌曲」
    // 如果傳入了 targetIndex 且與當前 index 不同，代表是切換，必須強制從頭開始
    const isSwitching =
      targetIndex !== null && targetIndex !== activeMemoryIndex;

    const index = targetIndex !== null ? targetIndex : activeMemoryIndex;
    const metadata = filteredMemories[index];
    if (!metadata) return;

    // 如果是切換歌曲，確保時間重置
    if (isSwitching) {
      pauseTimeRef.current = 0;
    }

    // 清理舊節點
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }

    try {
      const fullMemory = await getMemoryByIdFromDB(metadata.id);
      if (!fullMemory || !fullMemory.samples) throw new Error("找不到音訊數據");

      const ctx =
        window.sharedAudioContext ||
        new (window.AudioContext || window.webkitAudioContext)();
      window.sharedAudioContext = ctx;
      if (ctx.state === "suspended") await ctx.resume();

      // ... (建立 AudioBuffer 邏輯保持不變) ...
      const { samples, sampleRate } = fullMemory;
      const numPairs = Math.floor(samples.length / 2);
      const audioBuffer = ctx.createBuffer(2, numPairs, sampleRate || 48000);
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      for (let i = 0; i < numPairs; i++) {
        left[i] = samples[i * 2] / 32768.0;
        right[i] = samples[i * 2 + 1] / 32768.0;
      }

      const sourceNode = ctx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.loop = true;
      sourceNode.connect(ctx.destination);

      sourceNode.onended = () => {
        if (sourceNodeRef.current === sourceNode) setIsMusicPlay(false);
      };

      // --- 播放啟動 ---
      const startOffset = pauseTimeRef.current;
      // 加上 0.1 秒的小緩衝防止 Web Audio 啟動時的爆音
      sourceNode.start(0, startOffset);

      // 記錄這一次播放的基準點
      startTimeRef.current = ctx.currentTime;

      // 關鍵：只有在「成功啟動」後，才考慮是否要清空暫停時間
      // 但其實不需要在這裡清空，因為 stopCurrentMusic 會重新計算它
      // 為了安全，我們維持你的邏輯，但只在播放後重置累積值
      // pauseTimeRef.current = 0; // 如果你想要每次點播放都重新計算，這行 OK

      sourceNodeRef.current = sourceNode;
      setIsMusicPlay(true);
    } catch (err) {
      console.error("播放失敗:", err);
    }
  };

  // --- 播放/暫停按鈕邏輯 ---
  const handleMusicPlayPause = () => {
    if (isMusicPlay) {
      stopCurrentMusic();
    } else {
      playCurrentMusic();
    }
  };

  // --- Swiper 滑動或手動切換歌曲時，必須重置進度 ---
  const resetAudioProgress = () => {
    // 徹底停止並歸零時間
    if (sourceNodeRef.current) {
      sourceNodeRef.current.onended = null;
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    pauseTimeRef.current = 0;
    startTimeRef.current = 0;
    setIsMusicPlay(false);
  };

  // --- Swiper 滑動時的邏輯 ---
  const handleSlideChange = (swiper) => {
    const newIndex = swiper.realIndex;

    if (newIndex !== activeMemoryIndex) {
      const wasPlaying = isMusicPlay;

      // 1. 先徹底清理舊歌進度
      resetAudioProgress();

      // 2. 同步更新 Index 供 UI 顯示 (Record 組件等)
      setActiveMemoryIndex(newIndex);

      // 3. 關鍵：如果原本在播放，直接把 newIndex 傳給播放函式
      if (wasPlaying) {
        // 這裡甚至不需要 setTimeout，因為我們不依賴 state 了
        playCurrentMusic(newIndex);
      }
    }
  };

  // --- 控制按鈕邏輯 ---
  const goToPrev = () => {
    resetAudioProgress();
    swiperRef?.slidePrev();
  };
  const goToNext = () => {
    resetAudioProgress();
    swiperRef?.slideNext(); // 控制 Swiper
  };

  // --- 卸載時清理音訊 ---
  useEffect(() => {
    return () => {
      stopCurrentMusic(); // 組件卸載時務必停止音樂
    };
  }, []);

  return (
    <div className="main-content collections-content">
      <div className="search">
        <input
          type="text"
          placeholder="搜尋回憶名稱"
          value={searchTerm}
          onChange={handleSearch}
        />
        <div className="search-icon">
          <svg viewBox="0 0 512 512">
            <path d="M206.06,411.95c45.76,0,90.22-15.27,126.32-43.39l136.21,136.21c10.18,9.83,26.39,9.55,36.22-.63,9.59-9.93,9.59-25.66,0-35.59l-136.21-136.21c69.78-89.82,53.53-219.21-36.29-288.99S113.1-10.17,43.32,79.65s-53.53,219.21,36.29,288.99c36.16,28.09,80.66,43.33,126.45,43.31h0ZM96.62,96.58c60.44-60.44,158.44-60.45,218.89,0,60.44,60.44,60.45,158.44,0,218.89-60.44,60.44-158.44,60.45-218.89,0h0c-60.44-60.01-60.8-157.65-.8-218.09.27-.27.53-.53.8-.8h0Z"></path>
          </svg>
        </div>
      </div>
      <div className="collections-wrap">
        <Swiper
          onSwiper={setSwiperRef} // 取得實例
          onSlideChange={handleSlideChange} // 監聽滑動
          breakpoints={{
            // 當螢幕寬度 >= 0px (預設/手機版)
            0: {
              slidesPerView: 1,
            },
            // 當螢幕寬度 >= 768px (平板/電腦版)
            768: {
              slidesPerView: 3,
            },
          }}
          centeredSlides={true}
          loop={filteredMemories.length >= 3}
          navigation={true}
          pagination={false}
          mousewheel={true}
          keyboard={true}
          modules={[Navigation, Pagination, Mousewheel, Keyboard]}
          className="mySwiper"
        >
          {filteredMemories.map((item) => {
            return (
              <SwiperSlide
                key={item.id || item.timestamp}
                className={isMusicPlay ? "" : "pause"}
              >
                <Record memoryName={item.name} memoryNum={item.id}></Record>
              </SwiperSlide>
            );
          })}
        </Swiper>
        <div className="control-btns-wrap">
          <div className="prev-btn control-btn" onClick={goToPrev}>
            <svg viewBox="0 0 48 48">
              <g className="icon-prev">
                <path d="M8.12,45.68c-.9.71-2.13.85-3.17.35s-1.69-1.55-1.69-2.7V5.34c0-1.15.66-2.2,1.69-2.7,1.04-.5,2.27-.37,3.17.35l24.02,18.99c.72.57,1.14,1.44,1.14,2.35s-.42,1.79-1.14,2.36l-24.02,19Z" />
                <path d="M42.27,46.35h-3c-1.66,0-3-1.34-3-3V5.33c0-1.66,1.34-3,3-3h3c1.66,0,3,1.34,3,3v38.02c0,1.66-1.34,3-3,3Z" />
              </g>
            </svg>
          </div>
          <div className="play-btn control-btn" onClick={handleMusicPlayPause}>
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
          <div className="next-btn control-btn" onClick={goToNext}>
            <svg viewBox="0 0 48 48">
              <g className="icon-prev">
                <path d="M8.12,45.68c-.9.71-2.13.85-3.17.35s-1.69-1.55-1.69-2.7V5.34c0-1.15.66-2.2,1.69-2.7,1.04-.5,2.27-.37,3.17.35l24.02,18.99c.72.57,1.14,1.44,1.14,2.35s-.42,1.79-1.14,2.36l-24.02,19Z" />
                <path d="M42.27,46.35h-3c-1.66,0-3-1.34-3-3V5.33c0-1.66,1.34-3,3-3h3c1.66,0,3,1.34,3,3v38.02c0,1.66-1.34,3-3,3Z" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HasCollections;
