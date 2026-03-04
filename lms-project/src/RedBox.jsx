import React from "react";
import useCounter from "./useCounter";

function RedBox() {
  const { count, increase } = useCounter();

  return (
    <div style={{ background: "red", padding: "20px", margin: "10px" }}>
      <h3>Red Box</h3>
      <p>Count: {count}</p>
      <button onClick={increase}>+</button>
    </div>
  );
}

export default RedBox;
