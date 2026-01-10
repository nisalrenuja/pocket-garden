"use client";

import { useRef } from "react";
import ZenGarden from "@/components/ZenGarden";
import HandGestureController from "@/components/HandGestureController";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ZenGardenHandle, HandFrame } from "@/types";

export default function Home() {
  const zenGardenRef = useRef<ZenGardenHandle>(null);

  const handleHandFrame = (frame: HandFrame) => {
    if (zenGardenRef.current) {
        zenGardenRef.current.updateHandFrame(frame);
    }
  };

  return (
    <ErrorBoundary>
      <main className="w-full h-screen overflow-hidden">
          <HandGestureController onHandFrame={handleHandFrame} />
          <ZenGarden ref={zenGardenRef} />
      </main>
    </ErrorBoundary>
  );
}
