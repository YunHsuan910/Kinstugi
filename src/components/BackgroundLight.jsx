import React from "react";
import bg from "../assets/bg-light.webp";

function BackgroundLight() {
  return (
    <div className="bg-wrap">
      <img className="bg" src={bg} alt="" />
    </div>
  );
}

export default BackgroundLight;
