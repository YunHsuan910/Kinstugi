import React, { useState, useEffect } from "react";

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
        setMemories(data);
      } catch (error) {
        console.error("讀取記憶失敗:", error);
      } finally {
        // setLoading(false);
      }
    };
    fetchMemories();
  }, []);

  return (
    <div className="collection-container container">
      <div className="title">
        <img src={title} alt="迴響典藏" />
        <p className="slogan">收藏昔日裂痕，喚醒此刻金韻</p>
      </div>

      {memories.length > 0 ? (
        <HasCollections items={memories} />
      ) : (
        <NoCollection />
      )}

      <Background />
    </div>
  );
}

export default CollectionPage;
