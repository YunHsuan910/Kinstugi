/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "motion/react";

import processAnimation from "../assets/processing.webp";

function RecordProcessing({ status }) {
  return (
    <div className="main-content process-content">
      <motion.p
        className="process-status-text"
        key={status}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        transition={{ duration: 0.8 }}
      >
        {status}
      </motion.p>
      <div className="animate-wrap form">
        <img className="process-animation" src={processAnimation} />
      </div>
    </div>
  );
}
export default RecordProcessing;
