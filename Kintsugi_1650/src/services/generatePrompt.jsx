import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash";
const genAI = new GoogleGenAI({ apiKey: apiKey, model: MODEL_NAME });

async function generatePrompt(content, type, name) {
  try {
    //使用 Gemini 2.5 Flash 輸出音樂生成提示詞
    const promptText = `
      你是一位音樂治療師。
      請根據這段名為「${name}」的記憶，為 Lyria 音訊模型生成一段專業的音樂提示詞（Prompt）。

      記憶內容：${type === "text" ? content : "Attached image"}

      對提示詞的要求：
      1. 定義一個具體的音樂風格。
      2. 決定一個符合情感的 BPM（介於 60bpm 到 200bpm 之間）。
      3. 主奏樂器：詳細描述樂器特質（例如：「音色明亮的放鬆吉他」、「帶有柔和旋律的溫暖鋼琴」、「具備深沉揉音的電影感大提琴」）。
      4. 主要人聲：詳細描述人聲特質（例如：「優美的年輕女人歌聲」、「和諧的男女對唱歌聲」、「溫暖低沈的男人歌聲」），並以「${name}」及「${content}」融入為歌詞。
      5. 音樂調性：詳細描述此段音樂的音調（例如：「C_MAJOR_A_MINOR」、「D_FLAT_MAJOR_B_FLAT_MINOR」、「D_MAJOR_B_MINOR」、「E_FLAT_MAJOR_C_MINOR」、「E_MAJOR_D_FLAT_MINOR」、「F_MAJOR_D_MINOR」、「G_FLAT_MAJOR_E_FLAT_MINOR」、「G_MAJOR_E_MINOR」、「A_FLAT_MAJOR_F_MINOR」、「A_MAJOR_G_FLAT_MINOR」、「B_FLAT_MAJOR_G_MINOR」、「B_MAJOR_A_FLAT_MINOR」）
      6. 此段音樂必須是可循環播放的，前三秒由純音樂開始，中段加入人聲，最後三秒再以漸小聲純音樂的方式淡化結尾，總長度約為 30 秒
      7. 避免使用技術術語；請使用具描述性的情感與音樂詞彙。

      請「僅」回傳英文提示詞字串，不要包含任何其他解釋文字。
    `;

    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        systemInstruction:
          "你是一位專業的音樂製作人與金繕藝術家，擅長將情感轉化為音樂指令。",
      },
    });

    return response.text.trim();
  } catch (error) {
    console.error("AI 情緒分析失敗:", error);
    // 回傳預設指令以防程式崩潰
    // return `Please generate a music based on the memory titled "${name}."

    // Memory Content: ${type === "text" ? content : "Attached image"}
    // Music Requirements:
    // Define a specific musical style.
    // Determine a BPM that matches the emotional tone (ranging from 60bpm to 200bpm).
    // Lead Instrument: Describe the instrumental characteristics in detail (e.g., "chill guitar with a bright timbre," "warm piano with a gentle melody," or "cinematic cello with deep vibrato").
    // Lead Vocals: Describe the vocal qualities in detail (e.g., "ethereal female vocals," "harmonious male and female duet," or "warm, deep male vocals"). Incorporate "${name}" and "${content}" into the lyrics.
    // Musical Key: Specify the key of the track (e.g., "C_MAJOR_A_MINOR," "D_FLAT_MAJOR_B_FLAT_MINOR," "D_MAJOR_B_MINOR," "E_FLAT_MAJOR_C_MINOR," "E_MAJOR_D_FLAT_MINOR," "F_MAJOR_D_MINOR," "G_FLAT_MAJOR_E_FLAT_MINOR," "G_MAJOR_E_MINOR," "A_FLAT_MAJOR_F_MINOR," "A_MAJOR_G_FLAT_MINOR," "B_FLAT_MAJOR_G_MINOR," or "B_MAJOR_A_FLAT_MINOR").
    // Structure & Loop: The track must be seamlessly and repeat. Start with an instrumental intro for the first 3 seconds, introduce vocals in the middle section, and conclude with a 3-second instrumental fade-out. The total duration should be approximately 30 seconds.
    // Tone of Voice: Avoid technical jargon; use descriptive emotional and musical vocabulary instead.`;
    return `Gentle healing ambient music with soft guitar and a tender. The music must start from pure music without vocal, after 3 seconds add some soft human vocal, and end up with pure music without vocal. The lyrics should contains 「${name}」and「${content}」. Must set the song to repeat.`;
  }
}
export { generatePrompt };
