/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "motion/react";

import processAnimation from "../assets/processing.webp";

function RecordProcessing() {
  return (
    <div className="main-content process-content">
      <motion.p
        className="process-status-text"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        正在將碎裂的記憶，編織成金色的旋律...
      </motion.p>
      <div className="animate-wrap form">
        <img className="process-animation" src={processAnimation} />
      </div>
    </div>
  );
}
export default RecordProcessing;
