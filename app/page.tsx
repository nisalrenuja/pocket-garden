"use client";

import { useRef } from "react";
import ZenGarden, { ZenGardenHandle } from "@/components/ZenGarden";
import HandGestureController, { HandFrame } from "@/components/HandGestureController";

export default function Home() {
  const zenGardenRef = useRef<ZenGardenHandle>(null);

  const handleHandFrame = (frame: HandFrame) => {
    if (zenGardenRef.current) {
        zenGardenRef.current.updateHandFrame(frame);
    }
  };

  return (
    <main className="w-full h-screen overflow-hidden">
        <HandGestureController onHandFrame={handleHandFrame} />
        <ZenGarden ref={zenGardenRef} />
        
        {/* Magic Instructions */}
        <div className="absolute top-5 left-5 pointer-events-none text-gray-600/80 font-mono text-xs max-w-xs">
            {/* <h1 className="text-lg font-bold mb-2">✨ ZEN MAGIC CONTROLS</h1> */}
            <ul className="space-y-1">
                {/* 
                <li>🙏 <span className="font-bold">ROTATE</span>: Tilt Flat Hand Left/Right</li>
                <li>🛑 <span className="font-bold">STOP</span>: Low Fist to Lock Rotation</li>
                <li>✌️ <span className="font-bold">RAKE</span>: Peace Sign drags Sand</li>
                <li>🪨 <span className="font-bold">LEVITATE</span>: Pinch to Grab Stones</li>
                <li>☀️ <span className="font-bold">TIME</span>: High Fist + Drag Sky</li>
                 */}
            </ul>
        </div>
    </main>
  );
}
