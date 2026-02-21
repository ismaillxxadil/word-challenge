"use client";
import React, { useState, useRef } from "react";
import { PlayCard } from "./PlayCard";
import { PlayerInfo } from "./PlayerInfo";
import { useSound } from "@/hooks/useSound";


interface playerProps {
  name?: string;
  avatar?: string;
  cards?: { id: string; letterA: string; letterB: string }[];
  onVarClick?: () => void;
  varDisabledReason?: string | null;
  className?: string;
  // Interaction props
  isMyTurn?: boolean;
  isActiveTurn?: boolean;
  isOnline?: boolean;
  selectedCardIndex?: number | null;
  selectedFace?: "A" | "B" | null;
  hiddenCardId?: string | null; // Changed from index to ID
  onCardClick?: (index: number, face?: "A" | "B") => void;
  onFaceSelect?: (index: number, face: "A" | "B") => void;
  playerId: string;
  isMe?: boolean;
}

export const Player = ({
  name = "",
  avatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  cards = [],
  onVarClick = () => {},
  varDisabledReason,
  className = "",
  isMyTurn = false,
  isActiveTurn = false,
  isOnline = true,
  selectedCardIndex = null,
  selectedFace = null,
  hiddenCardId = null,
  onCardClick,
  onFaceSelect,
  playerId,
  isMe = false,
}: playerProps) => {
  const { play } = useSound();
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (index: number) => {
    // If it's my turn and I have a handler, delegate to parent
    if (isMyTurn && onCardClick) {
      // Pass the current face based on flip state
      onCardClick(index, flippedCards[index] ? "B" : "A");
      return;
    }
    // Otherwise just flip locally (entertainment)
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };



  return (
    <div
      ref={containerRef}
      dir="rtl"
      className={`flex w-full max-w-[clamp(280px,90vw,800px)] flex-col items-center gap-[clamp(8px,2vw,16px)] px-2 ${className}`}
    >
      {/* Cards Area */}
      <div className="player-hand-area relative flex w-full min-w-0 items-center justify-center perspective-[1000px] min-h-[90px] sm:min-h-[130px]">
        <div className="flex w-full flex-row-reverse items-center justify-center -space-x-2 sm:-space-x-4 md:-space-x-6 overflow-x-auto px-2 pb-4 pt-11">
            {cards.map((card, index) => {
              const isSelected = selectedCardIndex === index;
              const isHidden = hiddenCardId === card.id;

              return (
                <div
                  id={`player-card-${index}`}
                  key={card.id || `${name}-card-${index}`} // Use ID for stable identity
                  className={`relative shrink-0 origin-bottom transition-transform duration-300 ease-out z-10 ${isHidden ? "opacity-0 pointer-events-none" : "opacity-100"} ${!isSelected ? "hover:-translate-y-4 hover:scale-110 hover:z-50" : "z-50"}`}
                  style={{ zIndex: isSelected ? 100 : 10 + index }}
                  onMouseEnter={() => !isHidden && play("hover")}
                >
                  <PlayCard
                    letterA={card.letterA}
                    letterB={card.letterB}
                    isFlipped={!!flippedCards[index]}
                    onFlip={() => handleCardClick(index)}
                    selected={isSelected}
                    pick={isSelected ? selectedFace : null}
                    className="shadow-lg hover:shadow-2xl"
                  />

                  {/* Face Selection Controls */}
                  {isSelected && isMyTurn && (
                    <div
                      className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 bg-slate-800/80 p-1 rounded-lg backdrop-blur-sm shadow-xl"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFaceSelect?.(index, "A");
                        }}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all ${selectedFace === "A" ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
                      >
                        {card.letterA}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFaceSelect?.(index, "B");
                        }}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all ${selectedFace === "B" ? "bg-amber-500 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
                      >
                        {card.letterB}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Controls */}
      <PlayerInfo
        playerId={playerId}
        isMe={isMe}
        cards={cards}
        onVarClick={onVarClick}
        varDisabledReason={varDisabledReason}
        name={name}
        avatar={avatar}
        isActiveTurn={isActiveTurn}
        isOnline={isOnline}
      />
    </div>
  );
};
