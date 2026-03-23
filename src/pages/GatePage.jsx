/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion } from "motion/react";

//圖檔匯入
import title from "../assets/gate-title.png";
import bg from "../assets/bg-dark.webp";

//組件匯入
import EnterTrigger from "../components/EnterTrigger";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

function GatePage() {
  const [view, setView] = useState("intro");
  const [isLogin, setIsLogin] = useState(false);

  return (
    <motion.div
      className="gate-container container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="title">
        <img src={title} alt="契約之門" />
        <p className="slogan">帶著記憶，緩慢前行，出口總會到來的</p>
      </div>
      {view === "intro" && (
        <main className="main-content">
          <motion.p
            className="content-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            我們想邀請你留下那些讓你痛苦、悔恨、難過的回憶
            <br />
            讓我們透過AI生成的音樂及故事
            <br />
            稍微淡化那些瑕疵並扭轉印象，希望以此療癒你受傷的心靈
            <br />
            無論前方的路如何，是艱辛或平坦
            <br />
            祝福你有跨越一切的勇氣
          </motion.p>
          <EnterTrigger
            targetPath={"/ceremony"}
            onComplete={null}
            mainText="簽訂契約"
            subText="TO CEREMONY"
          />
        </main>
      )}
      {view === "login" && (
        <LoginForm onSwitchToRegister={() => setView("register")}></LoginForm>
      )}
      {view === "register" && (
        <RegisterForm onSwitchToLogin={() => setView("login")}></RegisterForm>
      )}
      <div className="bg-wrap">
        <img className="bg" src={bg} alt="" />
      </div>
    </motion.div>
  );
}

export default GatePage;
