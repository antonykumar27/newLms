// Nav.jsx
import React from "react";

function Nav({ onHome, onAbout }) {
  return (
    <div style={{ borderBottom: "2px solid black", padding: "10px" }}>
      <button onClick={onHome}>Home</button>
      <button onClick={onAbout} style={{ marginLeft: "10px" }}>
        About
      </button>
    </div>
  );
}

export default Nav;
