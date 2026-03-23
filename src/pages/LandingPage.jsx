/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

//圖檔匯入
import title from "../assets/landing-title.png";
import heroBgDesktop from "../assets/hero-bg.mp4";
import heroBgMobile from "../assets/hero-bg-m.mp4";
import heroBgPoster from "../assets/hero-bg-m.webp";

//組件匯入
import EnterTrigger from "../components/EnterTrigger";


function LandingPage() {
  const [videoSrc, setVideoSrc] = useState(() => {
    return window.innerWidth <= 768 ? heroBgMobile : heroBgDesktop;
  });

  const videoRef = useRef(null);

  useEffect(() => {
    // 2. 這裡只負責監聽視窗縮放
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      const targetSrc = isMobile ? heroBgMobile : heroBgDesktop;

      // 只有當路徑真的變了才更新 State，減少不必要的渲染
      setVideoSrc(prev => prev !== targetSrc ? targetSrc : prev);
    };

    // 3. 嘗試強制播放 (補救自動播放失敗)
    const playPromise = videoRef.current?.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        console.log("自動播放被攔截");
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
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
        {videoSrc && (
          <video
            ref={videoRef}
            key={videoSrc} // 關鍵：確保切換時會重新載入
            className="bg-video"
            autoPlay
            loop
            muted
            playsInline
            poster={heroBgPoster}
            src={videoSrc} // 直接寫在這裡，不要用 <source>
          />
        )}
        {/* <img className="bg-video" src={heroBg} alt="" /> */}
      </div>
    </div>
  );
}

export default LandingPage;
