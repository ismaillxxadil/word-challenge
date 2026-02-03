import React, { useState } from "react";

interface playCardProps {
  letterA?: string;
  letterB?: string;
  isFlipped: boolean;
  onFlip?: () => void;
  className?: string;
  isHidden?: boolean;
}

export const PlayCard = ({
  letterA = "?",
  letterB = "?",
  isFlipped,
  onFlip,
  className = "",
  isHidden = false,
}: playCardProps) => {
  const isInteractive = Boolean(onFlip);
  return (
    <div
      className={`group w-[clamp(44px,9vw,96px)] aspect-[2.5/3.5] [perspective:1000px] ${
        isInteractive ? "cursor-pointer" : "cursor-default"
      } ${className}`}
      onClick={onFlip}
    >
      <div
        className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* FACE A (Front) */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-xl shadow-md border border-slate-200 flex flex-col justify-between p-1.5 sm:p-2 md:p-2.5 [backface-visibility:hidden]">
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
                <span className="text-[clamp(20px,3.5vw,32px)] leading-none font-serif text-slate-800 drop-shadow-sm select-none" dir="rtl">
                  {letterA}
                </span>
              </div>

              {/* Letter B (Bottom Right - Rotated) */}
              <div className="flex flex-col items-center self-start transform rotate-180 z-10">
                <span className="text-emerald-600 font-serif text-[clamp(10px,1.5vw,14px)] font-bold leading-none">
                  {letterB}
                </span>
              </div>
            </>
          ) : (
             /* Hidden Pattern (Green) */
            <div className="absolute inset-1 rounded-lg border border-emerald-100 bg-emerald-600 flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,#fff_1px,transparent_1px)] bg-[length:8px_8px]"></div>
            </div>
          )}
        </div>

        {/* FACE B (Back) */}
        <div className="absolute inset-0 w-full h-full bg-white rounded-xl shadow-md border border-slate-200 flex flex-col justify-between p-1.5 sm:p-2 md:p-2.5 [transform:rotateY(180deg)] [backface-visibility:hidden]">
          {!isHidden ? (
             <>
                {/* Corners (Amber) */}
                <div className="absolute top-0.5 left-0.5 w-3 h-3 border-t-2 border-l-2 border-amber-600 rounded-tl opacity-40"></div>
                <div className="absolute top-0.5 right-0.5 w-3 h-3 border-t-2 border-r-2 border-amber-600 rounded-tr opacity-40"></div>
                <div className="absolute bottom-0.5 left-0.5 w-3 h-3 border-b-2 border-l-2 border-amber-600 rounded-bl opacity-40"></div>
                <div className="absolute bottom-0.5 right-0.5 w-3 h-3 border-b-2 border-r-2 border-amber-600 rounded-br opacity-40"></div>
                
                {/* Content */}
                <div className="flex flex-col items-center self-end z-10">
                  <span className="text-amber-600 font-serif text-[clamp(10px,1.5vw,14px)] font-bold leading-none">{letterA}</span>
                </div>
                <div className="flex-1 flex items-center justify-center relative z-10">
                  <div className="absolute w-full h-full bg-amber-50 rounded-full opacity-40 blur-xl scale-75"></div>
                  <span className="text-[clamp(24px,4vw,36px)] leading-none font-serif text-slate-800 drop-shadow-sm select-none" dir="rtl">{letterB}</span>
                </div>
                <div className="flex flex-col items-center self-start transform rotate-180 z-10">
                  <span className="text-amber-600 font-serif text-[clamp(10px,1.5vw,14px)] font-bold leading-none">{letterA}</span>
                </div>
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
      </div>
    </div>
  );
};
