import React from "react";
import { PlayCard } from "./PlayCard";

interface CenterBoardProps {
  currentWordCards?: { letterA: string; letterB: string }[];
  deckCount?: number;
  timerSeconds?: number;
  onDrawCard?: () => void;
  className?: string;
}

export const CenterBoard = ({
  currentWordCards = [
    { letterA: "ك", letterB: "ك" },
    { letterA: "ت", letterB: "ت" },
    { letterA: "ب", letterB: "ب" },
  ],
  deckCount = 10,
  timerSeconds = 30,
  onDrawCard = () => {},
  className = "",
}: CenterBoardProps) => {
  const secs = Math.max(0, timerSeconds);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  const currentWord = currentWordCards.map((card) => card.letterA).join("");

  return (
    <div
      className={[
        "w-full min-w-0 flex flex-col items-center justify-center gap-[clamp(10px,3vw,24px)] sm:flex-row",
        className,
      ].join(" ")}
    >
      {/* Word */}
      <div className="flex flex-col items-center gap-2 min-w-0">
        <div className="text-white/90 text-[10px] sm:text-xs font-medium bg-black/30 px-3 py-1 rounded-md">
          الكلمة الحالية:{" "}
          <span className="font-semibold" dir="rtl">
            {currentWord}
          </span>
        </div>

        <div className="flex items-center justify-center gap-[clamp(4px,1vw,8px)] p-[clamp(8px,1.5vw,16px)] bg-white/20 rounded-2xl border border-white/30 backdrop-blur-sm shadow-inner">
          {currentWordCards.length ? (
            currentWordCards.map((card, idx) => (
              <div key={idx} className="transition-transform hover:-translate-y-1 hover:scale-105 origin-center">
                <PlayCard letterA={card.letterA} letterB={card.letterB} isFlipped={false} className="shadow-md" />
              </div>
            ))
          ) : (
            <div className="text-white/60 text-xs py-4 px-2">لا توجد بطاقات</div>
          )}
        </div>

      </div>

      {/* Deck (below on mobile, right on desktop) */}
      <button
        type="button"
        onClick={onDrawCard}
        className="relative group shrink-0 w-[clamp(48px,7vw,78px)] h-[clamp(68px,10vw,110px)] cursor-pointer order-2 sm:order-none"
        aria-label="Draw card"
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-0 transition-transform group-hover:-translate-y-1"
            style={{
              transform: `translateY(${i * -2}px) translateX(${i * 1}px)`,
              zIndex: 10 - i,
            }}
          >
            <div className="w-full h-full scale-[0.95] sm:scale-100 origin-center">
              <PlayCard isFlipped={true} isHidden={true} className="shadow-sm pointer-events-none w-full h-full" />
            </div>
          </div>
        ))}
        <div className="absolute -bottom-2 -right-2 z-20 w-[clamp(20px,2.5vw,28px)] h-[clamp(20px,2.5vw,28px)] bg-slate-800 text-white rounded-full flex items-center justify-center text-[clamp(10px,1.2vw,12px)] font-bold border-2 border-slate-100 shadow-md">
          {deckCount}
        </div>
      </button>
    </div>
  );
};
