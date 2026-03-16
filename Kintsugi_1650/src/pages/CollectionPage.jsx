// import React, { useState } from "react";

//圖檔匯入
import title from "../assets/collection-title.png";

//組件匯入
import Background from "../components/Background";
import HasCollections from "../components/HasCollections";
import NoCollection from "../components/NoCollection";


function CollectionPage() {
  // const [hasCollection, setHasCollection] = useState(false);
  return (
    <div className="collection-container container">
      <div className="title">
        <img src={title} alt="迴響典藏" />
        <p className="slogan">收藏昔日裂痕，喚醒此刻金韻</p>
      </div>
      <HasCollections />
      {/* <NoCollection /> */}

      <Background />
    </div>
  );
}

export default CollectionPage;
