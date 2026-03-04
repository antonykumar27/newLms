// StudentButton.js
import React from "react";

function StudentButton({ name, onStudentClick }) {
  const handleClick = () => {
    // Parent-ന്റെ function call ചെയ്യുന്നു, name കൂടെ കൊടുക്കുന്നു
    onStudentClick(name);
  };

  return (
    <button
      className="bg-red-400 shadow-2xl rounded-lg p-6 text-yellow-400"
      onClick={handleClick}
    >
      {name} വിളിക്കൂ
    </button>
  );
}

export default StudentButton;
