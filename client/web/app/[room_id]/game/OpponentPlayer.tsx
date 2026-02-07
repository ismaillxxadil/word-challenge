import React from "react";
import { PlayCard } from "./PlayCard";
import { PlayerInfo } from "./PlayerInfo";

interface OpponentPlayerProps {
  name?: string;
  avatar?: string;
  cards?: { letterA: string; letterB: string }[];
  onVarClick?: () => void;
  className?: string;
  variant?: "top" | "side";
}

export const OpponentPlayer = ({
  name = "",
  avatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Opponent",
  cards = [],
  onVarClick,
  className = "",
  variant = "top",
}: OpponentPlayerProps) => {
  const isSide = variant === "side";
  return (
    <div
      className={`flex flex-col items-center gap-[clamp(4px,1vw,8px)] ${className}`}
    >
      <div
        className={`flex items-start justify-center overflow-visible perspective-[500px] ${
          isSide
            ? "h-[clamp(46px,10vw,70px)] -space-x-6 sm:-space-x-8"
            : "h-[clamp(50px,11vw,78px)] -space-x-6 sm:-space-x-10"
        }`}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            className={`relative transform origin-top transition-transform duration-300 hover:-translate-y-1 ${
              isSide
                ? "scale-[0.72] sm:scale-[0.8]"
                : "scale-[0.62] sm:scale-[0.75]"
            }`}
            style={{ zIndex: cards.length - index }}
          >
            <PlayCard
              isFlipped={true}
              isHidden={true}
              className="shadow-sm cursor-default"
            />
          </div>
        ))}
      </div>

      <PlayerInfo
        name={name}
        avatar={avatar}
        cards={cards}
        onVarClick={onVarClick}
        className={`origin-bottom transition-all ${
          isSide
            ? // Changed minimum from 160px to 250px
              // Changed max form 240px to 320px
              "scale-100 w-[clamp(250px,60vh,320px)]"
            : "scale-100 w-[clamp(200px,70vw,280px)]"
        }`}
      />
    </div>
  );
};
