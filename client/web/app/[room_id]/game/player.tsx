"use client";
import React, { useState } from "react";
import { PlayCard } from "./PlayCard";
import { PlayerInfo } from "./PlayerInfo";
import { motion, AnimatePresence } from "framer-motion";

interface playerProps {
  name?: string;
  avatar?: string;
  cards?: { id: string; letterA: string; letterB: string }[];
  onVarClick?: () => void;
  className?: string;
  // Interaction props
  isMyTurn?: boolean;
  selectedCardIndex?: number | null;
  selectedFace?: "A" | "B" | null;
  hiddenCardIndex?: number | null; // New prop to hide card while flying
  onCardClick?: (index: number) => void;
  onFaceSelect?: (index: number, face: "A" | "B") => void;
}

export const Player = ({
  name = "",
  avatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  cards = [],
  onVarClick = () => {},
  className = "",
  isMyTurn = false,
  selectedCardIndex = null,
  selectedFace = null,
  hiddenCardIndex = null,
  onCardClick,
  onFaceSelect,
}: playerProps) => {
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const handleCardClick = (index: number) => {
      // If it's my turn and I have a handler, delegate to parent
      if (isMyTurn && onCardClick) {
          onCardClick(index);
          return;
      }
      // Otherwise just flip locally (entertainment)
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
          <AnimatePresence mode="popLayout">
          {cards.map((card, index) => {
            const isSelected = selectedCardIndex === index;
            const isHidden = hiddenCardIndex === index;
            
            // Calculate entry animation
            // We want it to look like it comes from the deck.
            // Since we can't easily measure deck here (it's in another component), best approximation
            // is to start from top-right (where deck usually is) or just "sky".
            // A more precise way would be to pass deck coordinates, but hardcoding a reasonable vector is often enough.
            // Vector: x: -200 (leftwards from deck to hand), y: -150 (downwards)
            
            return (
            <motion.div
              layoutId={card.id || `card-${name}-${index}`} // Use ID for stable layout tracking
              id={`player-card-${index}`}
              key={card.id || `${name}-card-${index}`} // Use ID for stable identity
              initial={{ opacity: 0, x: -100, y: -200, scale: 0.5, rotate: 180 }} // Start from "Deck area" approx
              initial={{ opacity: 0, x: -100, y: -200, scale: 0.5, rotate: 180 }} // Start from "Deck area" approx
              animate={{ 
                  scale: 1, 
                  opacity: isHidden ? 0 : 1, 
                  y: 0, 
                  x: 0, 
                  rotate: 0 
              }}
              exit={{ scale: 0, opacity: 0, y: -200 }} 
              transition={{ type: "spring", stiffness: 250, damping: 25 }}
              className={`relative shrink-0 origin-bottom transition-all duration-300 ease-out z-10 ${!isSelected ? "hover:-translate-y-4 hover:scale-110 hover:z-50" : "z-50"}`}
              style={{ zIndex: isSelected ? 100 : 10 + index }}
            >
              <PlayCard
                letterA={card.letterA}
                letterB={card.letterB}
                isFlipped={!!flippedCards[index]}
                onFlip={() => handleCardClick(index)}
                selected={isSelected}
                pick={isSelected ? selectedFace : null}
                onClick={isMyTurn && onCardClick ? () => onCardClick(index) : undefined}
                className="shadow-lg hover:shadow-2xl"
              />
              
              {/* Face Selection Controls (Only when selected and multiple faces logic if needed) 
                  For now, we assume simple click toggles selection, subsequent clicks might toggle face if implemented in parent 
                  OR the PlayCard handles simple visual selection. 
                  
                  If the requirement is "User decides face", maybe we show buttons when selected?
              */}
              {isSelected && isMyTurn && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 bg-slate-800/80 p-1 rounded-lg backdrop-blur-sm shadow-xl"
                 >
                    <button 
                        onClick={(e) => { e.stopPropagation(); onFaceSelect?.(index, "A"); }}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all ${selectedFace === "A" ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
                    >
                        {card.letterA}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onFaceSelect?.(index, "B"); }}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all ${selectedFace === "B" ? "bg-amber-500 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20"}`}
                    >
                        {card.letterB}
                    </button>
                 </motion.div>
              )}

            </motion.div>
          )})}
          </AnimatePresence>
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
