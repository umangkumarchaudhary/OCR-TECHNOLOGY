import React from "react";
import CameraOCR from "./components/CameraOCR";

function App() {
  const handleScanComplete = (vehicleNumber) => {
    console.log("Extracted Vehicle Number:", vehicleNumber);
    alert(`Scanned Vehicle Number: ${vehicleNumber}`);
  };

  return (
    <div className="App">
      <h1>Live Camera OCR</h1>
      <CameraOCR onScanComplete={handleScanComplete} />
    </div>
  );
}

export default App;
