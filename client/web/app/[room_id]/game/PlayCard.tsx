import React from "react";
import { motion } from "framer-motion";

interface PlayCardProps {
  letterA?: string;
  letterB?: string;
  isFlipped: boolean;
  onFlip?: () => void;
  className?: string;
  isHidden?: boolean;
  layoutId?: string;
  onClick?: () => void;
  selected?: boolean;
  pick?: "A" | "B" | null; // Which face is selected if any
}

export const PlayCard = ({
  letterA,
  letterB,
  isFlipped,
  onFlip,
  className = "",
  isHidden = false,
  layoutId,
  onClick,
  selected = false,
  pick, // "A" or "B" (visual highlight)
}: PlayCardProps) => {
  const isInteractive = Boolean(onClick || onFlip);

  return (
    <motion.div
      layoutId={layoutId}
      className={`group relative w-[clamp(44px,9vw,96px)] aspect-[2.5/3.5] [perspective:1000px] ${
        isInteractive ? "cursor-pointer" : "cursor-default"
      } ${className}`}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        } else if (onFlip) {
            onFlip()
        }
      }}
      animate={{
        scale: selected ? 1.1 : 1,
        y: selected ? -20 : 0,
        boxShadow: selected
          ? "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
          : undefined,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className={`relative w-full h-full [transform-style:preserve-3d]`}
        initial={{ rotateY: isFlipped ? 180 : 0 }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* FACE A (Front) */}
        <div
          className={`absolute inset-0 w-full h-full bg-white rounded-xl shadow-md border flex flex-col justify-between p-1.5 sm:p-2 md:p-2.5 [backface-visibility:hidden] ${
            selected && pick === "A" ? "border-purple-500 ring-2 ring-purple-500" : "border-slate-200"
          }`}
        >
          {!isHidden ? (
            <>
              {/* Corners */}
              <div className="absolute top-0.5 left-0.5 w-3 h-3 border-t-2 border-l-2 border-emerald-600 rounded-tl opacity-40"></div>
              <div className="absolute top-0.5 right-0.5 w-3 h-3 border-t-2 border-r-2 border-emerald-600 rounded-tr opacity-40"></div>
              <div className="absolute bottom-0.5 left-0.5 w-3 h-3 border-b-2 border-l-2 border-emerald-600 rounded-bl opacity-40"></div>
              <div className="absolute bottom-0.5 right-0.5 w-3 h-3 border-b-2 border-r-2 border-emerald-600 rounded-br opacity-40"></div>

              {/* Letter B (Top Left) */}
              <div className="flex flex-col items-center self-end z-10">
                <span className="text-emerald-600 font-serif text-[clamp(10px,1.5vw,14px)] font-bold leading-none">
                  {letterB}
                </span>
              </div>

              {/* Letter A (Center) */}
              <div className="flex-1 flex items-center justify-center relative z-10 overflow-hidden">
                <div className="absolute w-full h-full bg-emerald-50 rounded-full opacity-40 blur-xl scale-75"></div>
                <span
                  className="text-[clamp(20px,3.5vw,32px)] leading-none font-serif text-slate-800 drop-shadow-sm select-none"
                  dir="rtl"
                >
                  {letterA}
                </span>
              </div>

              {/* Letter B (Bottom Right - Rotated) */}
              <div className="flex flex-col items-center self-start transform rotate-180 z-10">
                <span className="text-emerald-600 font-serif text-[clamp(10px,1.5vw,14px)] font-bold leading-none">
                  {letterB}
                </span>
              </div>
              
              {/* Pick Overlay */}
              {selected && pick === "A" && (
                <div className="absolute inset-0 bg-purple-500/10 rounded-xl pointer-events-none" />
              )}
            </>
          ) : (
            /* Hidden Pattern (Green) */
            <div className="absolute inset-1 rounded-lg border border-emerald-100 bg-emerald-600 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,#fff_1px,transparent_1px)] bg-[length:8px_8px]"></div>
            </div>
          )}
        </div>

        {/* FACE B (Back) */}
        <div
          className={`absolute inset-0 w-full h-full bg-white rounded-xl shadow-md border flex flex-col justify-between p-1.5 sm:p-2 md:p-2.5 [transform:rotateY(180deg)] [backface-visibility:hidden] ${
            selected && pick === "B" ? "border-purple-500 ring-2 ring-purple-500" : "border-slate-200"
          }`}
        >
          {!isHidden ? (
            <>
              {/* Corners (Amber) */}
              <div className="absolute top-0.5 left-0.5 w-3 h-3 border-t-2 border-l-2 border-amber-600 rounded-tl opacity-40"></div>
              <div className="absolute top-0.5 right-0.5 w-3 h-3 border-t-2 border-r-2 border-amber-600 rounded-tr opacity-40"></div>
              <div className="absolute bottom-0.5 left-0.5 w-3 h-3 border-b-2 border-l-2 border-amber-600 rounded-bl opacity-40"></div>
              <div className="absolute bottom-0.5 right-0.5 w-3 h-3 border-b-2 border-r-2 border-amber-600 rounded-br opacity-40"></div>

              {/* Content */}
              <div className="flex flex-col items-center self-end z-10">
                <span className="text-amber-600 font-serif text-[clamp(10px,1.5vw,14px)] font-bold leading-none">
                  {letterA}
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center relative z-10">
                <div className="absolute w-full h-full bg-amber-50 rounded-full opacity-40 blur-xl scale-75"></div>
                <span
                  className="text-[clamp(24px,4vw,36px)] leading-none font-serif text-slate-800 drop-shadow-sm select-none"
                  dir="rtl"
                >
                  {letterB}
                </span>
              </div>
              <div className="flex flex-col items-center self-start transform rotate-180 z-10">
                <span className="text-amber-600 font-serif text-[clamp(10px,1.5vw,14px)] font-bold leading-none">
                  {letterA}
                </span>
              </div>
               {/* Pick Overlay */}
               {selected && pick === "B" && (
                <div className="absolute inset-0 bg-purple-500/10 rounded-xl pointer-events-none" />
              )}
            </>
          ) : (
            /* Card Back Pattern (Orange/Brown) */
            <div className="absolute inset-1 rounded-lg border border-amber-900/10 bg-[#BC4B17] flex items-center justify-center overflow-hidden shadow-inner">
              <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(45deg,#7c2d12_25%,transparent_25%,transparent_75%,#7c2d12_75%,#7c2d12)] bg-[length:16px_16px]"></div>
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_15%,transparent_16%)] bg-[length:16px_16px]"></div>
              <div className="relative z-10 w-[40%] aspect-square bg-[#BC4B17] rounded-full border-2 border-amber-900/30 flex items-center justify-center shadow-lg">
                <div className="w-[60%] aspect-square rounded-full border border-amber-900/20 bg-amber-700/20"></div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
