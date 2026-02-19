import React from "react";

interface PlayerInfoProps {
  name: string;
  avatar: string;
  cards?: { letterA: string; letterB: string }[];
  onVarClick?: () => void;
  varDisabledReason?: string | null;
  className?: string;
  isActiveTurn?: boolean;
  isOnline?: boolean;
}

export const PlayerInfo = ({
  name = "",
  avatar,
  cards = [],
  onVarClick,
  varDisabledReason, // New prop
  className = "",
  isActiveTurn = false,
  isOnline = true,
}: PlayerInfoProps) => {
  return (
    <div
      dir="rtl"
      className={[
        "relative flex items-center justify-between gap-2",
        "w-full max-w-[260px] min-w-[160px]",
        "px-[clamp(8px,1.5vw,12px)] py-[clamp(6px,1.2vw,10px)]",
        "rounded-xl border border-white/10 bg-white/90 backdrop-blur-md shadow-sm",
        isActiveTurn
          ? "ring-2 ring-emerald-400/80 shadow-[0_0_25px_rgba(16,185,129,0.45)]"
          : "",
        !isOnline ? "opacity-60 grayscale" : "",
        "sm:min-w-[240px]",
        className,
      ].join(" ")}
    >
      {isActiveTurn && (
        <div className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 px-2.5 py-1 text-[10px] font-black text-slate-950 shadow-lg ring-2 ring-white/70 animate-pulse">
          TURN
        </div>
      )}
      {/* Avatar + Name */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative shrink-0">
          <img
            src={avatar}
            alt={name}
            width={40}
            height={40}
            className={[
              "rounded-full object-cover border-2 bg-violet-50 w-[clamp(32px,4vw,40px)] h-[clamp(32px,4vw,40px)]",
              isActiveTurn
                ? "border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                : "border-violet-100",
            ].join(" ")}
          />
          {/* Online/Offline Indicator */}
          <span
            className={[
              "absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full z-10",
              isOnline ? "bg-green-500" : "bg-slate-400",
            ].join(" ")}
            title={isOnline ? "متصل" : "غير متصل"}
          />
          
          {/* Active Turn Indicator (Ring) */}
          {isActiveTurn && isOnline && (
             <span className="absolute -inset-1 rounded-full border border-emerald-400/40 animate-pulse" />
          )}
        </div>

        <div className="flex flex-col min-w-0 items-start">
          <span
            className="font-bold text-slate-800 text-[clamp(12px,1.4vw,16px)] truncate max-w-[120px]"
            title={name}
          >
            {name}
          </span>
          <span className="text-slate-500 font-medium text-[clamp(10px,1.1vw,13px)] truncate">
            {cards.length} بطاقة
          </span>
        </div>
      </div>

      {/* VAR Button */}
      <button
        type="button"
        onClick={onVarClick}
        disabled={!onVarClick || !!varDisabledReason}
        aria-disabled={!onVarClick || !!varDisabledReason}
        title={varDisabledReason || "تحدي VAR"}
        className={[
          "shrink-0 inline-flex items-center gap-1.5 rounded-lg font-bold transition-all shadow-md border-b-2 px-[clamp(10px,1.8vw,14px)] py-[clamp(4px,1vw,8px)] text-[clamp(10px,1.2vw,12px)] ml-[clamp(6px,1.5vw,12px)]",
          onVarClick && !varDisabledReason
            ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-95 border-slate-950"
            : "bg-slate-400/40 text-slate-500 border-slate-500/30 cursor-not-allowed opacity-70",
        ].join(" ")}
      >
        {/*  <span aria-hidden></span> */}
        <span>VAR</span>
      </button>
    </div>
  );
};
