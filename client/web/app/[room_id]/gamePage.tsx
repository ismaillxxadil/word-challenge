"use client";
import React, { useEffect, useState } from "react";
import { CenterBoard } from "./game/CenterBoard";
import { OpponentPlayer } from "./game/OpponentPlayer";
import { Player } from "./game/player";

// ==========================================
// 6. Game Page (Main Layout)
// ==========================================
export default function App() {
  const initialHand = [
    { letterA: "أ", letterB: "ب" },
    { letterA: "ت", letterB: "ث" },
    { letterA: "ج", letterB: "ح" },
    { letterA: "خ", letterB: "د" },
    { letterA: "ذ", letterB: "ر" },
    { letterA: "ز", letterB: "س" },
    { letterA: "ش", letterB: "ص" },
  ];

  // Timer logic for center board
  const [timer, setTimer] = useState(30);
  useEffect(() => {
    const interval = setInterval(
      () => setTimer((t) => (t > 0 ? t - 1 : 30)),
      1000,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen bg-slate-900 bg-[url('/bg.png')] bg-cover bg-center overflow-hidden flex flex-col">
      {/* Grid Layout 
        rows: Top (Opponent) | Middle (Sides + Center) | Bottom (Player)
      */}
      <div className="h-full w-full grid overflow-visible grid-cols-[minmax(0,0.9fr)_minmax(0,2.2fr)_minmax(0,0.9fr)] sm:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] gap-[clamp(6px,2vw,18px)] ">
        {/* --- Top Row: Opponent --- */}
        <div className="col-span-3 relative z-10 flex items-center justify-center p-2 pb-[clamp(10px,2.5vw,18px)] rounded-2xl">
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-[clamp(10px,1.5vw,12px)] font-bold text-red-600 shadow-sm">
            <span aria-hidden>⏳</span>
            {String(Math.floor(timer / 60)).padStart(2, "0")}:
            {String(timer % 60).padStart(2, "0")}
          </div>
          <OpponentPlayer
            name="أحمد محمد"
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed"
            cards={initialHand.slice(0, 5)}
            className="pb-3"
          />
        </div>

        {/* --- Middle Row: Left Player --- */}
        <div className="row-start-2 col-start-1 relative z-10 flex items-center justify-center rounded-2xl">
          <div className="-rotate-90 origin-center transform translate-y-4 scale-[0.9] sm:scale-100">
            <OpponentPlayer
              variant="side"
              name="سارة"
              avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Sara"
              cards={initialHand.slice(0, 3)}
            />
          </div>
        </div>

        {/* --- Middle Row: Center Board --- */}
        <div className="row-start-2 col-start-2 relative z-10 flex items-center justify-center mt-[clamp(8px,2.2vw,18px)] rounded-2xl overflow-visible">
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {/* Subtle texture for the table */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')]"></div>
          </div>
          <CenterBoard timerSeconds={timer} />
        </div>

        {/* --- Middle Row: Right Player --- */}
        <div className="row-start-2 col-start-3 relative z-10 flex items-center justify-center rounded-2xl">
          <div className="rotate-90 origin-center transform translate-y-4 scale-[0.9] sm:scale-100">
            <OpponentPlayer
              variant="side"
              name="خالد"
              avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Khalid"
              cards={initialHand.slice(0, 4)}
            />
          </div>
        </div>

        {/* --- Bottom Row: Main Player --- */}
        <div className="col-span-3 relative z-20 flex items-end justify-center pb-2 rounded-2xl">
          <Player
            name="أنت (اللاعب)"
            avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            cards={initialHand}
          />
        </div>
      </div>
    </div>
  );
}
