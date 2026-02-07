import React from "react";

interface PlayerInfoProps {
  name: string;
  avatar: string;
  cards?: { letterA: string; letterB: string }[];
  onVarClick?: () => void;
  className?: string;
}

export const PlayerInfo = ({
  name = "",
  avatar,
  cards = [],
  onVarClick,
  className = "",
}: PlayerInfoProps) => {
  return (
    <div
      dir="rtl"
      className={[
        "flex items-center justify-between gap-2",
        "w-full max-w-[260px] min-w-[160px]",
        "px-[clamp(8px,1.5vw,12px)] py-[clamp(6px,1.2vw,10px)]",
        "rounded-xl border border-white/10 bg-white/90 backdrop-blur-md shadow-sm",
        "sm:min-w-[240px]",
        className,
      ].join(" ")}
    >
      {/* Avatar + Name */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative shrink-0">
          <img
            src={avatar}
            alt={name}
            width={40}
            height={40}
            className="rounded-full object-cover border-2 border-violet-100 bg-violet-50 w-[clamp(32px,4vw,40px)] h-[clamp(32px,4vw,40px)]"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
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
        className="shrink-0 inline-flex items-center gap-1.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-md border-b-2 border-slate-950 px-[clamp(10px,1.8vw,14px)] py-[clamp(4px,1vw,8px)] text-[clamp(10px,1.2vw,12px)] ml-[clamp(6px,1.5vw,12px)]"
      >
        {/*  <span aria-hidden></span> */}
        <span>VAR</span>
      </button>
    </div>
  );
};
