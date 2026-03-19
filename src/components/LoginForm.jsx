/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router-dom";
import React from "react";
import { motion } from "motion/react";
import EnterTrigger from "./EnterTrigger";

function LoginForm({ onSwitchToRegister }) {
  const navigate = useNavigate();

  return (
    <motion.main
      className="main-content"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <form action="#" className="form login-form">
        <h3 className="form-title">登入會員</h3>
        <div className="form-item-wrap">
          <div className="form-item account">
            <div className="form-item-top">
              <label htmlFor="account" className="form-text form-label">
                帳號:
              </label>
              <input
                type="text"
                id="account"
                name="account"
                className="form-text"
                placeholder="請輸入你的電子郵件"
              />
            </div>
            <span className="input-notice">
              無效的帳號，請嘗試其他帳號或註冊新帳號
            </span>
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
              onClick={() => navigate("/ceremony")}
            >
              訪客登入
            </div>
            <span className="divider-line"></span>
            <div
              className="form-item form-text change-view-btn"
              onClick={onSwitchToRegister}
            >
              註冊帳號
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

export default LoginForm;
