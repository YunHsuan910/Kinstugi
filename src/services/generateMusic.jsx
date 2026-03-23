import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "models/lyria-realtime-exp";
const SAMPLE_RATE = 48000; //採樣率Hz

const client = new GoogleGenAI({
  apiKey: apiKey,
  apiVersion: "v1alpha",
});

// 使用 Web Audio API 取代 Speaker
let audioContext;
//用於追蹤連線以利後續操作
let currentSession;

// 在 global 宣告緩衝區
const MIN_PLAY_SIZE = SAMPLE_RATE * 4 * 0.5; // 累積 0.5 秒雙聲道數據
const TOTAL_TARGET_SIZE = MIN_PLAY_SIZE * 20; // 預計生成 10 秒音樂

let allSamples = []; // 儲存 30 秒的所有樣本
let loopSource = null;

if (!window.sharedAudioContext) {
  window.sharedAudioContext = null;
}

async function generateMusic(promptText) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("生成音樂超時，請檢查網路連線"));
    }, 30000);

    let chunksArray = []; // 用來存所有的 Uint8Array 小塊
    let accumulatedLength = 0; // 追蹤總長度

    // 清理舊的狀態
    const cleanup = () => clearTimeout(timeout);

    if (!window.sharedAudioContext) {
      window.sharedAudioContext = new (
        window.AudioContext || window.webkitAudioContext
      )({
        sampleRate: SAMPLE_RATE,
      });
    }
    // 讓內部的私有變數同步
    audioContext = window.sharedAudioContext;

    client.live.music
      .connect({
        model: MODEL_NAME,
        callbacks: {
          onmessage: async (message) => {
            if (message.serverContent?.audioChunks) {
              for (const chunk of message.serverContent.audioChunks) {
                const newData = base64ToUint8(chunk.data);
                chunksArray.push(newData);
                accumulatedLength += newData.length;

                // 到達目標長度
                if (accumulatedLength >= TOTAL_TARGET_SIZE) {
                  cleanup(); // 成功了，先清除 timeout

                  if (currentSession) {
                    currentSession.stop();
                    currentSession = null;
                  }

                  // 合併數據
                  const fullBuffer = new Uint8Array(accumulatedLength);
                  let offset = 0;
                  for (const c of chunksArray) {
                    fullBuffer.set(c, offset);
                    offset += c.length;
                  }

                  const length = Math.floor(fullBuffer.length / 2) * 2;
                  const slicedBuffer = fullBuffer.slice(0, length);
                  allSamples = new Int16Array(slicedBuffer.buffer);

                  // 確保啟動播放不影響 resolve 流程
                  startLoopingPlayback();
                  resolve(true);
                }
              }
            }
          },
          onerror: (error) => {
            cleanup();
            console.error("Lyria Session 錯誤:", error);
            reject(error);
          },
          onclose: (event) => {
            cleanup();
            console.log("連線關閉代碼:", event.code, "理由:", event.reason);
          },
        },
      })
      .then(async (session) => {
        // 4. 使用 .then 取得連線後的 session
        currentSession = session;

        // 設定參數 (這裡可以使用 await，因為是在 async arrow function 內)
        await session.setWeightedPrompts({
          weightedPrompts: [{ text: promptText, weight: 1.0 }],
        });

        await session.setMusicGenerationConfig({
          musicGenerationConfig: {
            music_generation_mode: "VOCALIZATION",
            scale: "F_MAJOR_D_MINOR",
          },
        });

        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        await session.play();
      })
      .catch((err) => {
        cleanup();
        reject(err);
      });
  });
}

// 控制暫停與播放的功能
async function toggleMusic(shouldPlay) {
  if (!audioContext) return;

  if (shouldPlay) {
    // 恢復 AudioContext 的時間軸跳動
    await audioContext.resume();
  } else {
    // 掛起 AudioContext，這會讓所有正在播放與排程中的 Buffer 停止輸出
    await audioContext.suspend();
  }
}

// 徹底停止並清理資源
async function stopMusic() {
  if (currentSession) {
    await currentSession.stop();
    currentSession = null;
  }
  // 停止循環播放源
  if (loopSource) {
    loopSource.stop();
    loopSource = null;
  }
}

// 循環播放器
function startLoopingPlayback() {
  if (allSamples.length === 0) return;

  // 再次確保使用最新的 Context
  const ctx = window.sharedAudioContext || audioContext;

  const numPairs = Math.floor(allSamples.length / 2);
  const audioBuffer = ctx.createBuffer(2, numPairs, SAMPLE_RATE);
  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.getChannelData(1);

  // --- 優化點：分段填充數據 ---
  const chunkSize = 20000; // 每次處理 2 萬個採樣點
  let i = 0;

  function fillBuffer() {
    const end = Math.min(i + chunkSize, numPairs);
    for (; i < end; i++) {
      left[i] = allSamples[i * 2] / 32768.0;
      right[i] = allSamples[i * 2 + 1] / 32768.0;
    }

    if (i < numPairs) {
      // 還有數據，下一幀繼續，不阻塞 UI
      requestAnimationFrame(fillBuffer);
    } else {
      // 填充完畢，開始播放
      if (loopSource) {
        try {
          loopSource.stop();
        } catch (err) {
          console.error(err);
        }
      }
      loopSource = ctx.createBufferSource();
      loopSource.buffer = audioBuffer;
      loopSource.loop = true;
      loopSource.connect(ctx.destination);

      if (ctx.state === "suspended") ctx.resume();
      loopSource.start(ctx.currentTime + 0.1);
    }
  }

  fillBuffer(); // 開始分段填充

  // for (let i = 0; i < numPairs; i++) {
  //   left[i] = allSamples[i * 2] / 32768.0;
  //   right[i] = allSamples[i * 2 + 1] / 32768.0;
  // }

  // if (loopSource) {
  //   try {
  //     loopSource.stop();
  //   } catch (err) {
  //     console.err(err);
  //   }
  // }

  // loopSource = ctx.createBufferSource();
  // loopSource.buffer = audioBuffer;
  // loopSource.loop = true;
  // loopSource.connect(ctx.destination);

  // // 關鍵修改：使用 AudioContext 的內建時間軸來延遲啟動
  // // ctx.currentTime 是當前時間，+ 0.3 代表從現在起往後跳 0.3 秒才發聲
  // const startTime = ctx.currentTime + 0.3;

  // if (ctx.state === "suspended") {
  //   ctx.resume();
  // }

  // loopSource.start(startTime); // 在 0.3 秒後精準啟動
}

//將 Base64 字串轉換為二進位位元組陣列 (Uint8Array)
function base64ToUint8(base64String) {
  const binaryString = atob(base64String); // 解碼 Base64 為原始二進位字串
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i); // 轉為位元組
  }

  return bytes;
}
const getGeneratedSamples = () => {
  return {
    samples: allSamples, // 這裡存的是你錄好的 30 秒數據
    sampleRate: SAMPLE_RATE,
  };
};

export { generateMusic, toggleMusic, stopMusic, getGeneratedSamples };
