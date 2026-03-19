import React from "react";

//圖檔匯入
import title from "../assets/about-title.png";
import photo from "../assets/about-photo.png";

//組件匯入
import Background from "../components/Background";

function AboutPage() {
  return (
    <div className="about-container container">
      <div className="title">
        <img src={title} alt="虛無檔案" />
        <p className="slogan">裂痕為引，重鑄心緒，聆聽光音</p>
      </div>
      <div className="about-content main-content">
        <div className="photo">
          <img src={photo} alt="館長照片" />
        </div>
        <div className="words">
          <p className="motto">
            你的靈魂不曾毀壞。
            <br />
            在此，裂痕被金繕，重鑄為悠揚迴響。
            <br />
            <br />
            <span className="by">——館長</span>
          </p>
          <div className="secret-mail">
            <p className="hide-mail mail">
              -... - .-- --- .-. -.- ----. .---- ----- @ --. -- .- .. .-.. .
              -.-. --- --
            </p>
            <p className="reveal-mail mail">BTWORK910@gamil.com</p>
          </div>
        </div>
      </div>

      <Background />
    </div>
  );
}

export default AboutPage;
