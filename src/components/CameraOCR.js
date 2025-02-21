import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import './CameraOCR.css';

const CameraOCR = ({ onScanComplete }) => {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [useBackCamera, setUseBackCamera] = useState(true);
  const [scannedText, setScannedText] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Open camera
  const openCamera = async () => {
    setCameraOpen(true);
    try {
      const constraints = {
        video: {
          facingMode: useBackCamera ? "environment" : "user",
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

  // Capture image
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set canvas size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw full image
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Crop the center rectangular region (where license plate is)
      const focusArea = {
        x: canvas.width * 0.2, // 20% from left
        y: canvas.height * 0.5 - 50, // Middle of screen
        width: canvas.width * 0.6, // 60% of width
        height: 100, // Fixed height for plates
      };

      // Create a new canvas to store cropped image
      const croppedCanvas = document.createElement("canvas");
      croppedCanvas.width = focusArea.width;
      croppedCanvas.height = focusArea.height;
      const croppedContext = croppedCanvas.getContext("2d");

      // Copy only the selected region
      croppedContext.drawImage(
        canvas,
        focusArea.x, focusArea.y, focusArea.width, focusArea.height, // Source
        0, 0, focusArea.width, focusArea.height // Destination
      );

      processImage(croppedCanvas);
    }
  };

  // Process cropped image using OCR
  const processImage = async (croppedCanvas) => {
    const image = croppedCanvas.toDataURL("image/png");
    setScannedText("Scanning...");

    try {
      const { data: { text } } = await Tesseract.recognize(image, "eng");
      let extractedText = text.replace(/\s/g, "").toUpperCase();
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

          <div style={{ position: "relative", width: "100%", maxWidth: "500px" }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: "100%" }} />
            
            {/* Overlay rectangle for guidance */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "20%",
                width: "60%",
                height: "100px",
                border: "2px solid red",
                backgroundColor: "rgba(255, 0, 0, 0.2)",
                transform: "translateY(-50%)",
              }}
            ></div>
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />
          <p>{scannedText && `Extracted Text: ${scannedText}`}</p>
        </>
      )}
    </div>
  );
};

export default CameraOCR;
