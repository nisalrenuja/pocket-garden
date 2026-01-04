"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

export interface HandFrame {
  x: number;      // 0..1 (Screen X, 0=Left)
  y: number;      // 0..1 (Screen Y, 0=Top)
  roll: number;   // -1..1 (Hand Tilt, negative=left)
  pinch: boolean; // True if thumb+index touching
  fist: boolean;  // True if fingers folded
  peace: boolean; // True if Index+Middle extended, others folded
}

interface HandGestureControllerProps {
  onHandFrame: (frame: HandFrame) => void;
}

export default function HandGestureController({ onHandFrame }: HandGestureControllerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const requestRef = useRef<number>(0);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    let handLandmarker: HandLandmarker;

    const createHandLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
      });
      handLandmarkerRef.current = handLandmarker;
      setIsLoaded(true);
      startCamera();
    };

    createHandLandmarker();

    return () => {
      if (handLandmarker) {
        handLandmarker.close();
      }
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", predictWebcam);
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    }
  };

  const predictWebcam = () => {
    if (!handLandmarkerRef.current || !videoRef.current || !canvasRef.current) return;
    
    const startTimeMs = performance.now();
    const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

    const canvasCtx = canvasRef.current.getContext("2d");
    if (canvasCtx) {
      canvasCtx.font = "16px monospace";
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      const drawingUtils = new DrawingUtils(canvasCtx);
      
      // Default empty frame (hands off)
      // When no hand, we might want to signal that, but for now let's just not emit or emit a "neutral" state?
      // Emitting neutral is safer for "stop rotation".
      // But if we stop emitting, the last state persists.
      // Let's emit a "neutral" frame if no hand, OR just don't call callback.
      // Better to not call, let parent handle timeout if needed, or handle "no interaction".
      
      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        
        // Draw landmarks
        drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 2,
        });
        drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 1 });

        // --- EXTRACT HAND STATE ---
        const wrist = landmarks[0];
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];
        
        // 1. Position (0..1)
        const x = wrist.x;
        const y = wrist.y;

        // 2. Roll (Tilt)
        // Calculate based on Index vs Pinky MCP Y difference
        const indexMCP = landmarks[5];
        const pinkyMCP = landmarks[17];
        const dx = pinkyMCP.x - indexMCP.x;
        const dy = pinkyMCP.y - indexMCP.y;
        let rollVal = Math.atan2(dy, dx);
        rollVal = Math.max(-1, Math.min(1, rollVal * 2));
        
        // Helper: Is Finger Extended? (Tip further from wrist than PIP)
        // Using PIP (Joint 6, 10, 14, 18) for comparison
        const isExtended = (tip: any, pip: any) => {
             const dTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
             const dPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
             return dTip > dPip * 1.2;
        };
        
        const indexExt = isExtended(indexTip, landmarks[6]);
        const middleExt = isExtended(middleTip, landmarks[10]);
        const ringExt = isExtended(ringTip, landmarks[14]);
        const pinkyExt = isExtended(pinkyTip, landmarks[18]);

        // 3. Pinch (Thumb + Index close)
        const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
        const pinch = pinchDist < 0.05;

        // 4. Fist (All 4 fingers curled)
        // Note: isExtended checks if OPEN. So !isExtended means curled.
        const fist = !indexExt && !middleExt && !ringExt && !pinkyExt;

        // 5. Peace (Index + Middle Extended, others curled)
        // We typically ignore thumb for peace sign, or check it's not interfering.
        // Let's just strictly check fingers.
        const peace = indexExt && middleExt && !ringExt && !pinkyExt; 
        
        // Emit Frame
        onHandFrame({
            x,
            y,
            roll: rollVal,
            pinch,
            fist,
            peace
        });

        // Debug Visuals
        canvasCtx.fillStyle = "cyan";
        canvasCtx.fillText(`Roll: ${rollVal.toFixed(2)}`, 10, 20);
        canvasCtx.fillText(`Pinch: ${pinch}`, 10, 40);
        canvasCtx.fillText(`Fist: ${fist}`, 10, 60);
        canvasCtx.fillText(`Peace: ${peace}`, 10, 80);

      } else {
        // Optional: Emit specific "No Hand" frame if needed to stop momentum instantly
        // onHandFrame({ x:0.5, y:0.5, roll:0, pinch:false, fist:false });
      }
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="fixed bottom-5 right-5 w-48 h-36 bg-black/20 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 shadow-2xl z-50">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
          Loading AI...
        </div>
      )}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-50 -scale-x-100"
        autoPlay
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        width={320}
        height={240}
      />
    </div>
  );
}
