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
import MemoryContent from "./MemoryContent";
//匯入服務
import { getMemoryByIdFromDB, deleteMemoryFromDB } from "../services/dbService";
import { downloadMusic } from "../services/downloadMusic";

function HasCollections({ memories, setMemories }) {
  const [searchTerm, setSearchTerm] = useState("");

  // --- 播放器與 Swiper 狀態 ---
  const [swiperRef, setSwiperRef] = useState(null); // Swiper 實例
  const [activeMemoryIndex, setActiveMemoryIndex] = useState(0); // 當前索引
  const [isMusicPlay, setIsMusicPlay] = useState(false); // 播放狀態

  // 使用 useRef 存儲 AudioNode，這很重要！
  const sourceNodeRef = useRef(null);

  const pauseTimeRef = useRef(0); // 暫停時累積的播放秒數
  const startTimeRef = useRef(0); // 本次開始播放的起始時間點

  // 建立一個狀態來追蹤目前哪張唱片是翻轉的
  const [flippedIndex, setFlippedIndex] = useState(null);

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
    setFlippedIndex(null);
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
    setFlippedIndex(null);
    swiperRef?.slidePrev();
  };
  const goToNext = () => {
    resetAudioProgress();
    setFlippedIndex(null);
    swiperRef?.slideNext(); // 控制 Swiper
  };

  // --- 下載功能 ---
  const handleDownload = async () => {
    const metadata = filteredMemories[activeMemoryIndex];
    if (!metadata) return;

    try {
      // 必須從 DB 撈出完整的 samples
      const fullMemory = await getMemoryByIdFromDB(metadata.id);
      if (!fullMemory || !fullMemory.samples) {
        alert("找不到音訊資料");
        return;
      }

      const fileName = `金繕印記_${metadata.name || "memory"}.wav`;

      // 呼叫你提供的下載 service
      // 注意：傳入的 samples 必須是 Int16Array (你原本 DB 存的就是 Int16Array)
      downloadMusic(
        fullMemory.samples,
        fullMemory.sampleRate || 48000,
        fileName,
      );
    } catch (err) {
      console.error("下載失敗:", err);
    }
  };

  // --- 刪除功能 ---
  const handleDelete = async () => {
    const metadata = filteredMemories[activeMemoryIndex];
    if (!metadata) return;

    const confirmDelete = window.confirm(
      `確定要抹除「${metadata.name}」這段回憶嗎？`,
    );
    if (!confirmDelete) return;

    try {
      // 1. 先停止目前播放的音樂，避免報錯
      stopCurrentMusic();

      // 2. 從資料庫刪除
      await deleteMemoryFromDB(metadata.id);

      // 3. 通知父組件更新全域 memories 狀態，讓 UI 重新渲染
      if (setMemories) {
        setMemories((prev) => prev.filter((m) => m.id !== metadata.id));
      }

      // 4. 重置 Swiper 位置到第一筆
      setActiveMemoryIndex(0);
      swiperRef?.slideTo(0);
    } catch (err) {
      console.error("刪除失敗:", err);
      alert("抹除回憶時發生錯誤");
    }
  };

  // --- 卸載時清理音訊 ---
  useEffect(() => {
    return () => {
      stopCurrentMusic(); // 組件卸載時務必停止音樂
    };
  }, []);

  const handleFlip = (index, e) => {
    // 阻止冒泡，避免觸發 Swiper 的滑動事件
    e.stopPropagation();

    // 點擊同一張則收合，點擊不同張則翻轉新的一張並收合舊的
    setFlippedIndex((prev) => (prev === index ? null : index));
  };

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
              loop: filteredMemories.length > 1, // 手機版 1 張以上就可 loop
            },
            // 當螢幕寬度 >= 768px (平板/電腦版)
            768: {
              slidesPerView: 3,
              loop: filteredMemories.length >= 5, // 電腦版建議 5 張以上再 loop 比較穩
            },
          }}
          centeredSlides={true}
          navigation={true}
          pagination={false}
          mousewheel={true}
          keyboard={true}
          modules={[Navigation, Pagination, Mousewheel, Keyboard]}
          className="mySwiper"
        >
          {filteredMemories.length === 0 ? (
            <p className="filter-notice">沒有搜尋到符合的記憶</p>
          ) : (
            filteredMemories.map((item, index) => {
              const isFlipped = flippedIndex === index;

              return (
                <SwiperSlide
                  key={item.id || item.timestamp}
                  className={isMusicPlay ? "" : "pause"}
                >
                  <div className={`flip-card ${isFlipped ? "flipped" : ""}`}>
                    {/* 新增一個透明的點擊層，鋪在唱片區域上 */}
                    <div
                      className="click-overlay"
                      onClick={(e) => handleFlip(index, e)}
                    ></div>
                    {/* 正面 */}
                    <div
                      className={`flip-card-front ${isFlipped ? "flip-to-front" : "flip-to-back"}`}
                    >
                      <Record memoryName={item.name} memoryNum={item.id} />
                    </div>

                    {/* 反面 */}
                    <div
                      className={`flip-card-back ${isFlipped ? "flip-to-back" : "flip-to-front"}`}
                    >
                      <MemoryContent
                        content={item.content}
                        type={item.contentType}
                      />
                    </div>
                  </div>
                  {/* <Record memoryName={item.name} memoryNum={item.id}></Record> */}
                </SwiperSlide>
              );
            })
          )}
        </Swiper>
        <div className="control-btns-wrap">
          <div className="delete-btn control-btn" onClick={handleDelete}>
            <svg className="icon-bin" viewBox="0 0 512 512">
              <path d="M424.75,72.25h-70.31v-14.06c0-23.26-18.93-42.19-42.19-42.19h-112.5c-23.26,0-42.19,18.93-42.19,42.19v14.06h-70.31c-23.26,0-42.19,18.93-42.19,42.19,0,18.68,12.21,34.56,29.07,40.09l25.08,302.79c1.81,21.69,20.27,38.69,42.04,38.69h229.49c21.77,0,40.24-16.99,42.04-38.69l25.08-302.78c16.86-5.53,29.07-21.41,29.07-40.09,0-23.26-18.93-42.19-42.19-42.19ZM185.69,58.19c0-7.75,6.31-14.06,14.06-14.06h112.5c7.75,0,14.06,6.31,14.06,14.06v14.06h-140.62v-14.06ZM384.76,454.98c-.6,7.23-6.76,12.89-14.01,12.89h-229.49c-7.26,0-13.41-5.66-14.01-12.89l-24.72-298.36h306.95l-24.71,298.36ZM424.75,128.5H87.25c-7.75,0-14.06-6.31-14.06-14.06s6.31-14.06,14.06-14.06h337.5c7.75,0,14.06,6.31,14.06,14.06s-6.31,14.06-14.06,14.06Z" />
              <path d="M199.72,424.82l-14.06-226.88c-.48-7.75-7.19-13.65-14.91-13.17-7.75.48-13.65,7.15-13.17,14.91l14.06,226.88c.46,7.46,6.65,13.19,14.02,13.19,8.14,0,14.55-6.86,14.05-14.93Z" />
              <path d="M256,184.75c-7.77,0-14.06,6.3-14.06,14.06v226.88c0,7.77,6.3,14.06,14.06,14.06s14.06-6.3,14.06-14.06v-226.88c0-7.77-6.3-14.06-14.06-14.06Z" />
              <path d="M341.24,184.78c-7.73-.48-14.43,5.41-14.91,13.17l-14.06,226.88c-.48,7.75,5.42,14.42,13.17,14.91,7.76.48,14.43-5.42,14.91-13.17l14.06-226.88c.48-7.75-5.41-14.43-13.17-14.91Z" />
            </svg>
          </div>
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
          <div className="download-btn control-btn" onClick={handleDownload}>
            <svg className="icon-download" viewBox="0 0 512 512">
              <path d="M58.67,256c0,108.98,88.35,197.33,197.33,197.33,8.84,0,16,7.16,16,16s-7.16,16-16,16c-126.66,0-229.33-102.68-229.33-229.33S129.34,26.67,256,26.67s229.33,102.68,229.33,229.33c0,8.84-7.16,16-16,16s-16-7.16-16-16c0-108.98-88.35-197.33-197.33-197.33S58.67,147.02,58.67,256Z" />
              <path d="M272,167.19c30.58,7.22,53.33,34.69,53.33,67.48,0,8.84,7.16,16,16,16s16-7.16,16-16c0-55.96-45.37-101.33-101.33-101.33-8.84,0-16,7.16-16,16v97.06c-8-4.09-17.06-6.4-26.67-6.4-32.4,0-58.67,26.27-58.67,58.67s26.27,58.67,58.67,58.67,58.67-26.27,58.67-58.67v-131.48Z" />
              <path d="M352.04,409.37c6.6-5.87,16.72-5.28,22.59,1.33l14.71,16.55v-85.92c0-8.84,7.16-16,16-16s16,7.16,16,16v85.92l14.71-16.55c5.87-6.6,15.99-7.2,22.59-1.33,6.6,5.87,7.2,15.99,1.33,22.59l-42.67,48c-3.04,3.42-7.39,5.37-11.96,5.37s-8.92-1.95-11.96-5.37l-42.67-48c-5.87-6.6-5.28-16.72,1.33-22.59Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HasCollections;
