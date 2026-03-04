import React from "react";
import useCounter from "./useCounter";

function BlueBox() {
  const { count, increase } = useCounter();

  return (
    <div style={{ background: "blue", padding: "20px", margin: "10px" }}>
      <h3>Blue Box</h3>
      <p>Count: {count}</p>
      <button onClick={increase}>+</button>
    </div>
  );
}

export default BlueBox;
