import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";

const CameraOCR = ({ onScanComplete }) => {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [useBackCamera, setUseBackCamera] = useState(true);
  const [scannedText, setScannedText] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Function to open the camera
  const openCamera = async () => {
    setCameraOpen(true);
    try {
      const constraints = {
        video: {
          facingMode: useBackCamera ? "environment" : "user", // Switch between front & back camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // Function to take a picture
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      processImage();
    }
  };

  // Function to process image using OCR
  const processImage = async () => {
    const image = canvasRef.current.toDataURL("image/png");
    setScannedText("Scanning...");
    
    try {
      const { data: { text } } = await Tesseract.recognize(image, "eng+hin+mar");
      let extractedText = text.replace(/\s/g, "").toUpperCase();

      // Convert Hindi/Marathi numerals to English
      const numberMap = { "०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9" };
      extractedText = extractedText.replace(/[०-९]/g, (m) => numberMap[m] || m);

      setScannedText(extractedText);
      if (onScanComplete) onScanComplete(extractedText);
    } catch (error) {
      console.error("OCR Error:", error);
      setScannedText("OCR Failed.");
    }
  };

  return (
    <div className="camera-ocr">
      {!cameraOpen ? (
        <button onClick={openCamera}>Open Camera</button>
      ) : (
        <>
          <div>
            <button onClick={() => setUseBackCamera(!useBackCamera)}>
              Switch to {useBackCamera ? "Front" : "Back"} Camera
            </button>
            <button onClick={captureImage}>Capture & Scan</button>
          </div>
          <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxWidth: "500px" }} />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <p>{scannedText && `Extracted Text: ${scannedText}`}</p>
        </>
      )}
    </div>
  );
};

export default CameraOCR;
