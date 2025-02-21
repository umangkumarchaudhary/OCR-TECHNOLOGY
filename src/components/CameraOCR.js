import React, { useRef, useState, useEffect } from "react";
import Tesseract from "tesseract.js";

const CameraOCR = ({ onScanComplete }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scannedText, setScannedText] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera access denied:", error);
    }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Capture the current frame
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL("image/png");

    setProcessing(true);

    try {
      const { data: { text } } = await Tesseract.recognize(imageDataUrl, "eng+hin+mar");
      let extractedText = text.replace(/\s/g, "").toUpperCase();

      // Convert Hindi/Marathi numerals to English
      const numberMap = { "०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9" };
      extractedText = extractedText.replace(/[०-९]/g, (m) => numberMap[m] || m);

      setScannedText(extractedText);
      onScanComplete(extractedText);
    } catch (error) {
      console.error("OCR Error:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="camera-ocr">
      <video ref={videoRef} autoPlay playsInline width="300" height="200"></video>
      <canvas ref={canvasRef} width="300" height="200" style={{ display: "none" }}></canvas>
      <button onClick={captureAndScan} disabled={processing}>
        {processing ? "Processing..." : "Capture & Scan"}
      </button>
      {scannedText && <p>Extracted Number: {scannedText}</p>}
    </div>
  );
};

export default CameraOCR;
