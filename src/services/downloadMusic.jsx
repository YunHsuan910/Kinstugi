// 內部輔助：寫入字串到 DataView
const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const encodeWav = (samples, numChannels, sampleRate) => {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF chunk descriptor */
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");

  /* fmt sub-chunk */
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // SubChunk1Size
  view.setUint16(20, 1, true); // AudioFormat (PCM = 1)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
  view.setUint16(32, numChannels * 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  /* data sub-chunk */
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  // 寫入 PCM 數據
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    view.setInt16(offset, samples[i], true);
  }

  return new Blob([buffer], { type: "audio/wav" });
};

/**
 * 導出下載函式
 */
const downloadMusic = (samples, sampleRate, fileName = "memory.wav") => {
  if (!samples || samples.length === 0) return false;

  const blob = encodeWav(samples, 2, sampleRate);
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 100);
  return true;
};

export { downloadMusic };
