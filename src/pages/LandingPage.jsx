/* eslint-disable no-unused-vars */
import { motion } from "motion/react";

//圖檔匯入
import title from "../assets/landing-title.png";
import heroBgDesktop from "../assets/hero-bg.mp4";
import heroBgMobile from "../assets/hero-bg-m.mp4";
import heroBgPoster from "../assets/hero-bg-m.webp";

//組件匯入
import EnterTrigger from "../components/EnterTrigger";


function LandingPage() {
  return (
    <div className="landing-container container">
      <motion.div
        className="title"
        initial={{ opacity: 0, y: "-5%" }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <img src={title} alt="金繕回憶館" />
        <p className="slogan">記憶中每一道裂痕，都將重鑄為溫暖的旋律與光</p>
      </motion.div>
      <main className="main-content">
        <motion.h2
          initial={{ opacity: 0, y: "10%" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          你的心底，正迴響著什麼？
        </motion.h2>
        <EnterTrigger
          targetPath="/gate"
          mainText="長按進入主頁"
          subText="HOLD TO ENTER"
        />
      </main>
      <div className="bg-wrap">
        <video
          className="bg-video"
          autoPlay    // 自動播放
          loop        // 循環播放
          muted       // 必須靜音，否則大部分瀏覽器拒絕自動播放
          playsInline // 關鍵：防止 iPhone 上跳出全螢幕播放器
          poster={heroBgPoster} // 選填：在影片下載前顯示這張圖
        >
          {/* 電腦版 (螢幕大於 768px 時下載) */}
          <source
            src={heroBgDesktop}
            type="video/mp4"
            media="(min-width: 769px)"
          />

          {/* 手機版 (螢幕小於或等於 768px 時下載) */}
          <source
            src={heroBgMobile}
            type="video/mp4"
            media="(max-width: 768px)"
          />

        </video>
        {/* <img className="bg-video" src={heroBg} alt="" /> */}
      </div>
    </div>
  );
}

export default LandingPage;
