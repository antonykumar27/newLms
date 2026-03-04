import { useState } from "react";

function useApp(initialName) {
  const [name, setName] = useState(initialName);

  const changeName = () => {
    setName("Antony 🔥");
  };

  return {
    name,
    changeName,
  };
}

export default useApp;
