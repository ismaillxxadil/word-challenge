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

        <div className="flex items-center justify-center gap-[clamp(4px,1vw,8px)] p-[clamp(8px,1.5vw,16px)] bg-white/20 rounded-2xl border border-white/30 backdrop-blur-sm shadow-inner min-h-[140px] px-8">
          <AnimatePresence mode="popLayout" initial={false}>
          {currentWordCards.length ? (
            currentWordCards.map((card, idx) => (
              <motion.div
                layoutId={`center-card-${idx}`}
                id={`center-card-${idx}`} // Added ID for animation targeting
                key={`center-card-${idx}-${card.letterA}`} // Key changes when letter changes to trigger animation? Or keep idx and animate content? 
                // Better: keep stable key for position, but animate content change if needed. 
                // Actually, if we want to replace the card with the new one flying in, we might want the layoutId to match the player's card?
                // For now, let's just make them targets.
                className={`relative transition-all duration-300 origin-center ${canTarget ? "cursor-pointer hover:scale-110 hover:-translate-y-2 ring-4 ring-purple-400/50 rounded-lg" : ""}`}
                onClick={() => canTarget && onTargetClick && onTargetClick(idx)}
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
                <PlayCard letterA={card.letterA} letterB={card.letterB} isFlipped={false} className="shadow-md" />
              </motion.div>
            ))
          ) : (
            <div className="text-white/60 text-xs py-4 px-2">لا توجد بطاقات</div>
          )}
          </AnimatePresence>
        </div>

      </div>

      {/* Deck (below on mobile, right on desktop) */}
      <div
        className="relative group shrink-0 w-[clamp(48px,7vw,78px)] h-[clamp(68px,10vw,110px)] order-2 sm:order-none"
      >
        <button
            id="deck-stack" // Added ID for animation targeting
            onClick={onDrawCard}
            disabled // Player only draws automatically on timeout or manually if we enable it (but rules say timeout?)
            // Actually user request says: "when timer hit 0 ... it must draw card"
            // AND "if not (valid word) the card must go back ... and he draw one card"
            // It doesn't explicitly say user can draw manually. Usually in this game they don't, but let's leave it possible.
            className="w-full h-full cursor-default"
        >
        
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 transition-transform group-hover:-translate-y-1"
            style={{
              zIndex: 10 - i,
            }}
            animate={{ y: i * -2, x: i * 1 }}
          >
            <div className="w-full h-full scale-[0.95] sm:scale-100 origin-center">
              <PlayCard isFlipped={true} isHidden={true} className="shadow-sm pointer-events-none w-full h-full" />
            </div>
          </motion.div>
        ))}
         <div className="absolute -bottom-2 -right-2 z-20 w-[clamp(20px,2.5vw,28px)] h-[clamp(20px,2.5vw,28px)] bg-slate-800 text-white rounded-full flex items-center justify-center text-[clamp(10px,1.2vw,12px)] font-bold border-2 border-slate-100 shadow-md">
          {deckCount}
        </div>
        </button>
      </div>
    </div>
  );
};
