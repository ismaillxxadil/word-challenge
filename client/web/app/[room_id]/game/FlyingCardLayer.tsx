
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCard } from "./PlayCard";

export interface FlyingCardState {
  id: string; // unique animation id
  cardId: string; // underlying card id if needed
  letterA: string;
  letterB: string;
  pick?: "A" | "B";
  startRect: { top: number; left: number; width: number; height: number };
  targetRect: { top: number; left: number; width: number; height: number };
  status: "flying" | "waiting" | "returning";
  onComplete: () => void;
}

interface FlyingCardLayerProps {
  flyingCard: FlyingCardState | null;
}

export const FlyingCardLayer = ({ flyingCard }: FlyingCardLayerProps) => {
  return (
    <AnimatePresence>
      {flyingCard && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          <motion.div
            key={flyingCard.id}
            initial={{
              top: flyingCard.startRect.top,
              left: flyingCard.startRect.left,
              width: flyingCard.startRect.width,
              height: flyingCard.startRect.height,
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            animate={
               flyingCard.status === "flying" ? {
                  top: flyingCard.targetRect.top,
                  left: flyingCard.targetRect.left,
                  width: flyingCard.targetRect.width,
                  height: flyingCard.targetRect.height,
                  opacity: 1,
                  rotate: 0,
                  scale: 1,
               } : flyingCard.status === "returning" ? {
                  // Fly back to start
                  top: flyingCard.startRect.top,
                  left: flyingCard.startRect.left,
                  width: flyingCard.startRect.width,
                  height: flyingCard.startRect.height,
                  opacity: 1, 
                  rotate: 0,
                  scale: 1,
               } : {
                  // "waiting" state: stay at target
                  top: flyingCard.targetRect.top,
                  left: flyingCard.targetRect.left,
                  width: flyingCard.targetRect.width,
                  height: flyingCard.targetRect.height,
                  opacity: 1,
                  rotate: 0,
                  scale: 1,
               }
            }
            transition={{
              type: "spring",
              stiffness: 120, // Lower stiffness for slower/smoother
              damping: 20,    // Adjusted damping
            }}
            onAnimationComplete={() => {
              if (flyingCard.status !== "waiting") {
                flyingCard.onComplete();
              }
            }}
            className="absolute shadow-2xl origin-center"
          >
            <PlayCard
              letterA={flyingCard.letterA}
              letterB={flyingCard.letterB}
              pick={flyingCard.pick}
              isFlipped={false} 
              selected={true} // Highlighting flight
              className="w-full h-full !shadow-none"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
