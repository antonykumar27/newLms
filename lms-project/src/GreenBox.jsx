import React from "react";
import useCounter from "./useCounter";

function GreenBox() {
  const { count, increase } = useCounter();

  return (
    <div style={{ background: "green", padding: "20px", margin: "10px" }}>
      <h3>Green Box</h3>
      <p>Count: {count}</p>
      <button onClick={increase}>+</button>
    </div>
  );
}

export default GreenBox;
