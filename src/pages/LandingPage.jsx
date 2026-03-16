/* eslint-disable no-unused-vars */
import { motion } from "motion/react";

//圖檔匯入
import title from "../assets/landing-title.png";
import heroBg from "../assets/hero-bg.webp";

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
        <img className="bg-video" src={heroBg} alt="" />
      </div>
    </div>
  );
}

export default LandingPage;
