import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

function MenuLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    isOpen ? setIsOpen(false) : setIsOpen(true);
  };
  const handleSwitchPage = (path) => {
    navigate(path);
    setIsOpen(false);
  };
  return (
    <div className={`menu ${isOpen ? "open" : ""}`} onClick={handleMenuToggle}>
      <div className="icon-wrap">
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      <nav className="nav-wrap">
        <p className="nav-item" onClick={() => handleSwitchPage("/")}>
          回到首頁
        </p>
        <p className="nav-item" onClick={() => handleSwitchPage("/gate")}>
          契約之門
        </p>
        <p className="nav-item" onClick={() => handleSwitchPage("/ceremony")}>
          金繕儀式
        </p>
        <p className="nav-item" onClick={() => handleSwitchPage("/collection")}>
          迴響典藏
        </p>
        <p className="nav-item" onClick={() => handleSwitchPage("/about")}>
          虛無檔案
        </p>
      </nav>
    </div>
  );
}

export default MenuLayout;
