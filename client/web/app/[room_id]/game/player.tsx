"use client";
import React, { useState } from "react";
import { PlayCard } from "./PlayCard";
import { PlayerInfo } from "./PlayerInfo";

interface playerProps {
  name?: string;
  avatar?: string;
  cards?: { letterA: string; letterB: string }[];
  onVarClick?: () => void;
  className?: string;
}

export const Player = ({
  name = "??????",
  avatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  cards = [],
  onVarClick = () => {},
  className = "",
}: playerProps) => {
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const handleCardFlip = (index: number) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div
      dir="rtl"
      className={`flex w-full max-w-[clamp(280px,90vw,800px)] flex-col items-center gap-[clamp(8px,2vw,16px)] px-2 ${className}`}
    >
      {/* Cards Area */}
      <div className="relative flex w-full min-w-0 items-center justify-center perspective-[1000px] min-h-[90px] sm:min-h-[130px]">
        <div className="flex w-full flex-row-reverse items-center justify-center -space-x-2 sm:-space-x-4 md:-space-x-6 overflow-x-auto px-2 pb-4 pt-11">
          {cards.map((card, index) => (
            <div
              key={index}
              className="relative shrink-0 origin-bottom transition-all duration-300 ease-out hover:-translate-y-4 hover:scale-110 z-10 hover:z-50"
              style={{ zIndex: 10 + index }}
            >
              <PlayCard
                letterA={card.letterA}
                letterB={card.letterB}
                isFlipped={!!flippedCards[index]}
                onFlip={() => handleCardFlip(index)}
                className="shadow-lg hover:shadow-2xl"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <PlayerInfo
        cards={cards}
        onVarClick={onVarClick}
        name={name}
        avatar={avatar}
      />
    </div>
  );
};
