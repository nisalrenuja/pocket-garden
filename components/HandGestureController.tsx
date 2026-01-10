"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import { HandFrame, Landmark } from "@/types";
import {
  MEDIAPIPE_CONFIG,
  HAND_LANDMARK_INDICES,
  VIDEO_CONFIG,
  DRAWING_STYLES,
} from "@/constants";
import {
  calculateRoll,
  isFingerExtended,
  detectPinch,
  detectFist,
  detectPeace,
} from "@/lib/mediapipe";

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
        MEDIAPIPE_CONFIG.VISION_TASKS_CDN
      );
      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MEDIAPIPE_CONFIG.MODEL_URL,
          delegate: MEDIAPIPE_CONFIG.DELEGATE,
        },
        runningMode: MEDIAPIPE_CONFIG.RUNNING_MODE,
        numHands: MEDIAPIPE_CONFIG.NUM_HANDS,
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
      canvasCtx.font = VIDEO_CONFIG.FONT;
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const drawingUtils = new DrawingUtils(canvasCtx);

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];

        // Draw landmarks
        drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
          color: DRAWING_STYLES.CONNECTOR_COLOR,
          lineWidth: DRAWING_STYLES.CONNECTOR_WIDTH,
        });
        drawingUtils.drawLandmarks(landmarks, {
          color: DRAWING_STYLES.LANDMARK_COLOR,
          lineWidth: DRAWING_STYLES.LANDMARK_WIDTH,
        });

        const wrist = landmarks[HAND_LANDMARK_INDICES.WRIST];
        const thumbTip = landmarks[HAND_LANDMARK_INDICES.THUMB_TIP];
        const indexTip = landmarks[HAND_LANDMARK_INDICES.INDEX_TIP];
        const middleTip = landmarks[HAND_LANDMARK_INDICES.MIDDLE_TIP];
        const ringTip = landmarks[HAND_LANDMARK_INDICES.RING_TIP];
        const pinkyTip = landmarks[HAND_LANDMARK_INDICES.PINKY_TIP];

        // Position
        const x = wrist.x;
        const y = wrist.y;

        // Roll
        const rollVal = calculateRoll(landmarks);

        // Finger extensions
        const indexExt = isFingerExtended(indexTip, landmarks[HAND_LANDMARK_INDICES.INDEX_PIP], wrist);
        const middleExt = isFingerExtended(middleTip, landmarks[HAND_LANDMARK_INDICES.MIDDLE_PIP], wrist);
        const ringExt = isFingerExtended(ringTip, landmarks[HAND_LANDMARK_INDICES.RING_PIP], wrist);
        const pinkyExt = isFingerExtended(pinkyTip, landmarks[HAND_LANDMARK_INDICES.PINKY_PIP], wrist);

        // Gestures
        const pinch = detectPinch(thumbTip, indexTip);
        const fist = detectFist(indexExt, middleExt, ringExt, pinkyExt);
        const peace = detectPeace(indexExt, middleExt, ringExt, pinkyExt);

        // Emit Frame
        onHandFrame({
          x,
          y,
          roll: rollVal,
          pinch,
          fist,
          peace,
        });

        canvasCtx.fillStyle = DRAWING_STYLES.DEBUG_TEXT_COLOR;
        canvasCtx.fillText(`Roll: ${rollVal.toFixed(2)}`, 10, 20);
        canvasCtx.fillText(`Pinch: ${pinch}`, 10, 40);
        canvasCtx.fillText(`Fist: ${fist}`, 10, 60);
        canvasCtx.fillText(`Peace: ${peace}`, 10, 80);
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
        width={VIDEO_CONFIG.CANVAS_WIDTH}
        height={VIDEO_CONFIG.CANVAS_HEIGHT}
      />
    </div>
  );
}
