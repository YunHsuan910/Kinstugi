/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "motion/react";
import EnterTrigger from "./EnterTrigger";

function RegisterForm({ onSwitchToLogin }) {
  return (
    <motion.main
      className="main-content"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <form action="#" className="form register-form">
        <h3 className="form-title">註冊會員</h3>
        <div className="form-item-wrap">
          <div className="form-item account">
            <div className="form-item-top">
              <label htmlFor="account" className="form-text form-label">
                帳號:
              </label>
              <input
                type="email"
                id="account"
                name="account"
                className="form-text"
                placeholder="請輸入你的電子郵件"
              />
            </div>
            <span className="input-notice">錯誤的電子郵件格式</span>
          </div>
          <div className="form-item password">
            <div className="form-item-top">
              <label htmlFor="password" className="form-text form-label">
                密碼:
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-text"
                placeholder="請輸入你的密碼"
              />
            </div>
            <span className="input-notice">
              請輸入包含大小寫英文及數字的組合，長度15-20字元
            </span>
          </div>
          <div className="change-view-btn-wrap">
            <div
              className="form-item form-text change-view-btn"
              onClick={onSwitchToLogin}
            >
              已有帳號？按這邊回到登入介面
            </div>
          </div>
        </div>

        <EnterTrigger
          onComplete={null}
          targetPath={"/ceremony"}
          mainText="進入金繕儀式"
          subText="TO CEREMONY"
        >
          <input type="submit" value="送出"></input>
        </EnterTrigger>
      </form>
    </motion.main>
  );
}

export default RegisterForm;
