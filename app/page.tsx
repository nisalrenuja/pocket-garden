"use client";

import { useRef } from "react";
import PocketGarden from "@/components/PocketGarden";
import HandGestureController from "@/components/HandGestureController";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PocketGardenHandle, HandFrame } from "@/types";

export default function Home() {
  const pocketGardenRef = useRef<PocketGardenHandle>(null);

  const handleHandFrame = (frame: HandFrame) => {
    if (pocketGardenRef.current) {
        pocketGardenRef.current.updateHandFrame(frame);
    }
  };

  return (
    <ErrorBoundary>
      <main className="w-full h-screen overflow-hidden">
        <HandGestureController onHandFrame={handleHandFrame} />
        <PocketGarden ref={pocketGardenRef} />
      </main>
    </ErrorBoundary>
  );
}
