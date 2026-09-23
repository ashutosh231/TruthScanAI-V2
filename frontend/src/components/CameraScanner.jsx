"use client";

import React, { useState, useRef, useEffect } from "react";
import Button from "./Button";
import {
  Camera,
  CameraOff,
  Sparkles,
  Upload,
  RefreshCw,
  AlertCircle,
  Eye,
  FileText,
} from "lucide-react";

export default function CameraScanner({ onCapture, disabled }) {
  const [streamActive, setStreamActive] = useState(false);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  const startCamera = async () => {
    setError(null);
    setCapturedImage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser environment.");
      }

      // Clean up previous stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.warn("Video play notice:", e));
        };
        try {
          await videoRef.current.play();
        } catch {
          // Handled via onloadedmetadata or user gesture
        }
      }

      setStreamActive(true);
    } catch (err) {
      console.warn("Camera access note:", err);
      setError(
        "Camera stream unavailable or permission denied. You can still upload or choose a news photo below."
      );
      setStreamActive(false);
    }
  };

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
    if (onCapture) {
      onCapture(dataUrl);
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current || document.createElement("canvas");
          let { width, height } = img;
          const maxDim = 1600;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
          setCapturedImage(dataUrl);
          stopCamera();
          if (onCapture) {
            onCapture(dataUrl);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const loadSampleHeadline = () => {
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 450;
    const ctx = canvas.getContext("2d");

    // Newsprint background
    ctx.fillStyle = "#F8F6F0";
    ctx.fillRect(0, 0, 1200, 450);

    // Outer border
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, 1180, 430);

    // Masthead
    ctx.fillStyle = "#111111";
    ctx.font = "bold 24px monospace";
    ctx.fillText("INTERNATIONAL DISPATCH — FRONT PAGE EXCLUSIVE", 40, 60);

    ctx.fillStyle = "#FF4D4D";
    ctx.fillRect(40, 80, 1120, 6);

    // Main Headline
    ctx.fillStyle = "#111111";
    ctx.font = "900 44px sans-serif";
    ctx.fillText("GOVERNMENT ANNOUNCES COMPREHENSIVE SOLAR", 40, 155);
    ctx.fillText("ENERGY REBATE PROGRAM EFFECTIVE NEXT MONTH", 40, 215);

    // Subdeck / Context
    ctx.font = "bold 24px serif";
    ctx.fillStyle = "#333333";
    ctx.fillText("Energy ministry confirms 40% subsidy for rooftop installations starting November.", 40, 285);
    ctx.fillText("Official guidelines and portal registration open for all domestic households nationwide.", 40, 325);

    // Metadata line
    ctx.font = "italic 18px serif";
    ctx.fillStyle = "#666666";
    ctx.fillText("Published: October 2026 | Bureau of Energy Affairs | Verified Press Release", 40, 390);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    setCapturedImage(dataUrl);
    stopCamera();
    if (onCapture) {
      onCapture(dataUrl);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="border-2 border-[#111111] bg-white shadow-hard p-4 sm:p-6 space-y-4">
      {/* Scanner Viewfinder Area */}
      <div className="relative w-full aspect-video sm:aspect-16/9 bg-[#111111] border-2 border-[#111111] overflow-hidden flex items-center justify-center">
        {/* Hidden Canvas for snapshot extraction */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Video Element ALWAYS in DOM so videoRef is never null */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${
            streamActive && !capturedImage ? "block" : "hidden"
          }`}
        />

        {/* Live Reticle & Viewfinder Target Overlays */}
        {streamActive && !capturedImage && (
          <div className="absolute inset-4 sm:inset-8 border-2 border-white/40 pointer-events-none flex flex-col justify-between p-2">
            <div className="flex justify-between font-mono-tech text-[10px] text-white/80">
              <span>[SCAN_ZONE_TL]</span>
              <span>[SCAN_ZONE_TR]</span>
            </div>
            {/* Laser Scanline */}
            <div className="animate-scanline" />
            <div className="flex justify-between font-mono-tech text-[10px] text-white/80">
              <span>[ALIGN_HEADLINE_HERE]</span>
              <span>[ACTIVE_LENS]</span>
            </div>
          </div>
        )}

        {/* Captured Preview */}
        {capturedImage && (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Scanned news frame"
              className="w-full h-full object-contain bg-black"
            />
            {/* Stamp Overlay */}
            <div className="absolute top-4 left-4 bg-[#B7FF3C] text-[#111111] border-2 border-[#111111] font-mono-tech text-xs font-bold px-2.5 py-1 shadow-hard-xs">
              FRAME CAPTURED
            </div>
          </div>
        )}

        {/* Inactive / Standby state */}
        {!streamActive && !capturedImage && (
          <div className="p-6 text-center space-y-4 max-w-md">
            <div className="w-16 h-16 bg-[#F5F1E8] border-2 border-white shadow-[2px_2px_0px_0px_#FFFFFF] mx-auto flex items-center justify-center">
              <Camera className="w-8 h-8 text-[#111111]" />
            </div>
            <div className="space-y-1">
              <p className="font-display text-lg text-white uppercase">
                OPTICAL SCANNER STANDBY
              </p>
              <p className="font-mono-tech text-xs text-[#E8E2D5]/70">
                Grant camera permission or upload a photo of a newspaper, screen, flyer or document.
              </p>
            </div>
            {error && (
              <div className="p-3 bg-[#FF4D4D]/20 border border-[#FF4D4D] text-[#FF4D4D] font-mono-tech text-xs text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control Actions Bar */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {streamActive ? (
            <Button
              variant="danger"
              size="sm"
              onClick={stopCamera}
              icon={CameraOff}
              disabled={disabled}
            >
              STOP CAMERA
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={startCamera}
              icon={Camera}
              disabled={disabled}
            >
              START CAMERA
            </Button>
          )}

          {streamActive && (
            <Button
              variant="accent"
              size="sm"
              onClick={capturePhoto}
              icon={Sparkles}
              disabled={disabled}
            >
              CAPTURE FRAME
            </Button>
          )}

          {capturedImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetCapture}
              icon={RefreshCw}
              disabled={disabled}
            >
              RE-TAKE
            </Button>
          )}
        </div>

        {/* Upload File alternative & Sample Article */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
            disabled={disabled}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            icon={Upload}
            disabled={disabled}
          >
            UPLOAD IMAGE
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSampleHeadline}
            icon={FileText}
            disabled={disabled}
            className="hidden sm:inline-flex"
          >
            TEST SAMPLE ARTICLE
          </Button>
        </div>
      </div>

      {/* Helpful tip */}
      <div className="border border-[#111111]/20 bg-[#F5F1E8] px-3 py-2 flex items-center justify-between text-[11px] font-mono-tech text-[#111111]/70">
        <span>TIP: Point camera directly at printed text with good lighting, or use &quot;TEST SAMPLE ARTICLE&quot; for instant verification.</span>
        <button
          type="button"
          onClick={loadSampleHeadline}
          className="sm:hidden font-bold underline text-[#111111]"
        >
          Load Sample
        </button>
      </div>
    </div>
  );
}
