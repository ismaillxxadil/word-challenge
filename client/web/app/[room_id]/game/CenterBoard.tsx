import React from "react";
import { PlayCard } from "./PlayCard";
import { motion, AnimatePresence } from "framer-motion";

interface CenterBoardProps {
  currentWordCards?: { letterA: string; letterB: string }[];
  deckCount?: number;
  timerSeconds?: number;
  onDrawCard?: () => void;
  className?: string;
  // Interaction props
  isMyTurn?: boolean;
  canTarget?: boolean; // If true, show targeting helpers
  onTargetClick?: (index: number) => void;
}

export const CenterBoard = ({
  currentWordCards = [],
  deckCount = 10,
  timerSeconds = 30,
  onDrawCard = () => {},
  className = "",
  isMyTurn = false,
  canTarget = false,
  onTargetClick,
}: CenterBoardProps) => {
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

        <div className="flex items-center justify-center gap-[clamp(4px,1vw,8px)] p-[clamp(8px,1.5vw,16px)] bg-white/20 rounded-2xl border border-white/30 backdrop-blur-sm shadow-inner min-h-[140px] px-8">
          <AnimatePresence mode="popLayout" initial={false}>
            {currentWordCards.length ? (
              currentWordCards.map((card, idx) => {
                return (
                  <motion.div
                  id={`center-card-${idx}`} // ID for animation targeting
                  key={idx} 
                  className={`relative transition-all duration-300 origin-center ${canTarget ? "cursor-pointer hover:scale-110 hover:-translate-y-2 ring-4 ring-purple-400/50 rounded-lg" : ""}`}
                  onClick={() =>
                    canTarget && onTargetClick && onTargetClick(idx)
                  }
                >
                  {/* Target Hint Overlay */}
                  {canTarget && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap z-20 pointer-events-none"
                    >
                      استبدل
                    </motion.div>
                  )}
                  <PlayCard
                    letterA={card.letterA}
                    letterB={card.letterB}

                    isFlipped={false}
                    className="shadow-md"
                  />
                </motion.div>
              );
            })
          ) : (
            <div className="text-white/60 text-xs py-4 px-2">
                لا توجد بطاقات
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Deck (below on mobile, right on desktop) */}
      <div className="relative group shrink-0 w-[clamp(48px,7vw,78px)] h-[clamp(68px,10vw,110px)] order-2 sm:order-none">
        <button
          id="deck-stack" // Added ID for animation targeting
          onClick={onDrawCard}
          disabled={!isMyTurn}
          className={`w-full h-full relative z-30 transition-all ${isMyTurn ? "cursor-pointer hover:-translate-y-2 hover:drop-shadow-[0_10px_10px_rgba(168,85,247,0.4)] ring-2 ring-transparent hover:ring-purple-400 rounded-lg": "cursor-default opacity-80"}`}
          title={isMyTurn ? "سحب بطاقة وتخطي الدور" : "مجموعة الأوراق"}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 transition-transform"
              style={{
                zIndex: 10 - i,
              }}
              animate={{ y: i * -2, x: i * 1 }}
            >
              <div className="w-full h-full scale-[0.95] sm:scale-100 origin-center">
                <PlayCard
                  isFlipped={true}
                  isHidden={true}
                  className="shadow-sm pointer-events-none w-full h-full"
                />
              </div>
            </motion.div>
          ))}
        </button>
      </div>
    </div>
  );
};
