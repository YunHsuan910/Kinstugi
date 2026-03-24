/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

//圖檔匯入
import title from "../assets/collection-title.png";

//組件匯入
import Background from "../components/Background";
import HasCollections from "../components/HasCollections";
import NoCollection from "../components/NoCollection";

//服務匯入
import { getAllMemoriesFromDB } from "../services/dbService";

function CollectionPage() {
  const [memories, setMemories] = useState([]);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const data = await getAllMemoriesFromDB();

        // 關鍵：分離 Metadata，不讓 samples 佔用 React State 渲染負擔
        const lightData = data
          .map(({ samples, ...rest }) => rest)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setMemories(lightData);
      } catch (error) {
        console.error("讀取記憶失敗:", error);
      }
    };
    fetchMemories();
  }, []);

  return (
    <motion.div
      className="collection-container container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="title">
        <img src={title} alt="迴響典藏" />
        <p className="slogan">收藏昔日裂痕，喚醒此刻金韻</p>
      </div>

      {memories.length > 0 ? (
        <HasCollections memories={memories} setMemories={setMemories}/>
      ) : (
        <NoCollection />
      )}

      <Background />
    </motion.div>
  );
}

export default CollectionPage;
