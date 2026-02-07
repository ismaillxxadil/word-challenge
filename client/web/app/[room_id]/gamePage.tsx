"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CenterBoard } from "./game/CenterBoard";
import { OpponentPlayer } from "./game/OpponentPlayer";
import { Player } from "./game/player";
import { Room, Player as RoomPlayer } from "../types";
import { useRoomStore } from "@/store/useRoomStore";
import { PlayCard } from "./game/PlayCard"; // Added import
import { motion, AnimatePresence } from "framer-motion"; // Added import

interface GamePageProps {
  room: Room;
  handleLeave: () => void;
}

// Fallback avatar if backend did not set one.
function getAvatarUrl(player: RoomPlayer) {
  if (player.avatar) return player.avatar;
  const seed = encodeURIComponent(player.name || "Player");
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

// Main in-game layout driven by real room data
export default function GamePage({ room, handleLeave }: GamePageProps) {
  const { settings, socket } = useRoomStore();
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(
    settings.timePerTurn ?? 30,
  );

  // --- Interaction State ---
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [selectedFace, setSelectedFace] = useState<"A" | "B" | null>(null);

  // Read current player's id from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = localStorage.getItem("vc:playerId");
    setCurrentPlayerId(id);
  }, []);

  const state = room.state;
  const players = room.players;

  const {
    me,
    others,
    centerWordCards,
  }: {
    me: RoomPlayer | undefined;
    others: RoomPlayer[];
    centerWordCards: { letterA: string; letterB: string }[];
  } = useMemo(() => {
    const idx =
      currentPlayerId != null
        ? players.findIndex((p) => p.id === currentPlayerId)
        : -1;
    const mePlayer = idx >= 0 ? players[idx] : undefined;
    const othersPlayers = players.filter((p) => p.id !== currentPlayerId);
    const word = state.centerWord || ""; // 3-letter word
    const centerCards = word.split("").map((ch) => ({
      letterA: ch,
      letterB: ch,
    }));
    return {
      me: mePlayer,
      others: othersPlayers,
      centerWordCards: centerCards,
    };
  }, [players, state.centerWord, currentPlayerId]);

  const myCards = me?.cards ?? [];
  const topOpponent = others[0];
  const leftOpponent = others[1];
  const rightOpponent = others[2];

  const isMyTurn = state.currentPlayerIndex !== null && 
                   room.players[state.currentPlayerIndex]?.id === currentPlayerId;

  // --- Interaction Handlers ---

  // State for the flying card animation
  const [flyingCard, setFlyingCard] = useState<{
      id: string; // unique
      letterA: string;
      letterB: string;
      face: "A" | "B";
      startRect: DOMRect;
      targetRect: DOMRect;
      sourceIndex: number; // Added sourceIndex to hide original card
      status: "flying-out" | "flying-back" | "success";
  } | null>(null);

  const handleCardClick = (index: number) => {
      if (!isMyTurn || flyingCard) return; // underlying interaction blocked while flying
      
      if (selectedCardIndex === index) {
           setSelectedFace(prev => prev === "A" ? "B" : "A");
      } else {
          setSelectedCardIndex(index);
          setSelectedFace("A");
      }
  };

  const handleFaceSelect = (index: number, face: "A" | "B") => {
      if (!isMyTurn || flyingCard) return;
      setSelectedCardIndex(index);
      setSelectedFace(face);
  };

  const handleTargetClick = async (targetIndex: number) => {
    if (selectedCardIndex === null || !selectedFace || !isMyTurn || !socket || flyingCard) return;
    if (selectedCardIndex >= myCards.length) return;

    // 1. Measure positions
    const cardEl = document.getElementById(`player-card-${selectedCardIndex}`);
    const targetEl = document.getElementById(`center-card-${targetIndex}`);
    
    if (!cardEl || !targetEl) return;
    
    const startRect = cardEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    
    // 2. Prepare Data
    const currentWord = state.centerWord;
    const card = myCards[selectedCardIndex];
    const cardIdx = selectedCardIndex;
    const face = selectedFace;

    // 3. Clear Selection & Start Animation
    setSelectedCardIndex(null);
    setSelectedFace(null);
    
    setFlyingCard({
        id: `fly-${Date.now()}`,
        letterA: card.letterA,
        letterB: card.letterB,
        face: face,
        startRect,
        targetRect,
        sourceIndex: cardIdx, // Store index
        status: "flying-out"
    });

    // 4. Send move to server
    socket.emit("room:play-card", {
        roomCode: room.code,
        playerId: currentPlayerId,
        cardIndex: cardIdx,
        pick: face,
        targetIndex: targetIndex,
        currentWord: currentWord
    }, (response: any) => {
        if (response?.ok) {
            if (response.valid !== false) {
                 // Success! 
                 // Wait for animation "flying-out" to finish? 
                 // Actually we can transition to success state or just clear.
                 // The Room Update will likely happen very fast.
                 // We want the card to stay at target?
                 setTimeout(() => {
                    setFlyingCard(null); 
                 }, 500);
            } else {
                 // Invalid!
                 // Trigger "fly back"
                 setFlyingCard(prev => prev ? { ...prev, status: "flying-back" } : null);
                 
                 // After flying back, clear
                 setTimeout(() => {
                     setFlyingCard(null);
                 }, 800);
            }
        } else {
            console.error("Play card error:", response?.error);
             setFlyingCard(prev => prev ? { ...prev, status: "flying-back" } : null);
             setTimeout(() => {
                 setFlyingCard(null);
             }, 800);
        }
    });

  };
  
  // Listen for specific game events for effects if needed (animations handled by state changes mostly)
  useEffect(() => {
      if (!socket) return;
      return () => {};
  }, [socket]);


  // Timer based on server turnStartedAt (with fallback to startedAt)
  useEffect(() => {
    const turnStart = state.turnStartedAt ?? state.startedAt;
    const duration = settings.timePerTurn ?? 30;

    if (!turnStart) {
      setRemainingSeconds(duration);
      return;
    }

    const update = () => {
      const elapsed = (Date.now() - turnStart) / 1000;
      const remaining = Math.max(0, Math.ceil(duration - elapsed));
      setRemainingSeconds(remaining);
      
      // Auto deselect if turn ends
      if (remaining === 0 && isMyTurn) {
          setSelectedCardIndex(null);
          setSelectedFace(null);
      }
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [state.turnStartedAt, state.startedAt, settings.timePerTurn, room.code, isMyTurn]);

  const mm = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const ss = String(remainingSeconds % 60).padStart(2, "0");

  return (
    <div className="relative h-screen w-screen bg-slate-900 bg-[url('/bg.png')] bg-cover bg-center overflow-hidden">
      {/* Small overlay header so it doesn't push layout down */}
      <div className="absolute top-2 right-3 z-30 flex items-center gap-2 text-xs text-slate-200">
        <span className="font-mono text-[11px] bg-slate-900/70 px-2 py-1 rounded-lg border border-slate-700">
          غرفة #{room.code}
        </span>
        <button
          type="button"
          onClick={handleLeave}
          className="px-2 py-1 rounded-lg border border-slate-600 bg-slate-900/70 hover:bg-slate-800 text-[11px]"
        >
          خروج
        </button>
      </div>

      <div className="h-full w-full grid overflow-visible grid-cols-[minmax(0,1.2fr)_minmax(0,2.2fr)_minmax(0,0.9fr)] sm:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto] gap-[clamp(6px,2vw,18px)] px-2 pb-2 pt-4">
        {/* --- Top Row: Opponent (first other player) --- */}
        <div className="col-span-3 relative z-10 flex items-center justify-center p-2 pb-[clamp(10px,2.5vw,18px)] rounded-2xl">
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-[clamp(10px,1.5vw,12px)] font-bold text-red-600 shadow-sm">
            <span aria-hidden>⏳</span>
            {mm}:{ss}
          </div>
          {topOpponent && (
            <OpponentPlayer
              name={topOpponent.name}
              avatar={getAvatarUrl(topOpponent)}
              cards={topOpponent.cards ?? []}
              className="pb-3"
            />
          )}
        </div>

        {/* --- Middle Row: Left Player --- */}
        <div className="row-start-2 col-start-1 relative z-10 flex items-center justify-center rounded-2xl">
          <div className="-rotate-90 origin-center transform translate-y-2 sm:translate-y-4 scale-100">
            {leftOpponent && (
              <OpponentPlayer
                variant="side"
                name={leftOpponent.name}
                avatar={getAvatarUrl(leftOpponent)}
                cards={leftOpponent.cards ?? []}
              />
            )}
          </div>
        </div>

        {/* --- Middle Row: Center Board --- */}
        <div className="row-start-2 col-start-2 relative z-10 flex items-center justify-center mt-[clamp(8px,2.2vw,18px)] rounded-2xl overflow-visible">
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {/* Subtle texture for the table */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')]"></div>
          </div>
          <CenterBoard
            currentWordCards={centerWordCards}
            timerSeconds={remainingSeconds}
            isMyTurn={isMyTurn}
            canTarget={isMyTurn && selectedCardIndex !== null}
            onTargetClick={handleTargetClick}
          />
        </div>

        {/* --- Middle Row: Right Player --- */}
        <div className="row-start-2 col-start-3 relative z-10 flex items-center justify-center rounded-2xl">
          <div className="rotate-90 origin-center transform translate-y-2 sm:translate-y-4 scale-100">
            {rightOpponent && (
              <OpponentPlayer
                variant="side"
                name={rightOpponent.name}
                avatar={getAvatarUrl(rightOpponent)}
                cards={rightOpponent.cards ?? []}
              />
            )}
          </div>
        </div>

        {/* --- Bottom Row: Current Player --- */}
        <div className="col-span-3 relative z-20 flex items-end justify-center pb-2 rounded-2xl">
          {me && (
            <Player
              name={me.name}
              avatar={getAvatarUrl(me)}
              cards={myCards}
              isMyTurn={isMyTurn}
              selectedCardIndex={selectedCardIndex}
              selectedFace={selectedFace}
              // If flying card is valid and status is NOT "flying-back" (because if it flies back, we want it to reappear/land)
              // Actually, if it flies back, it flies TO the hand. So the hand card should remain hidden until animation done?
              // Yes. So if flyingCard exists, hide the card used.
              // Note: We need to know WHICH card index was used. flyingCard struct doesn't have index.
              // We should store sourceIndex in flyingCard.
              hiddenCardIndex={flyingCard?.status !== "success" ? flyingCard?.sourceIndex ?? null : null}
              onCardClick={handleCardClick}
              onFaceSelect={handleFaceSelect}
            />
          )}
        </div>
      </div>
      
      {/* 🚀 FLYING CARD LAYER 🚀 */}
      {/* 🚀 FLYING CARD LAYER 🚀 */}
      <AnimatePresence>
      {flyingCard && (
         <div className="fixed inset-0 z-[100] pointer-events-none">
             <motion.div
                initial={{ 
                    x: flyingCard.startRect.left, 
                    y: flyingCard.startRect.top, 
                    scale: 1,
                    rotate: 0,
                    opacity: 1
                }}
                animate={
                    flyingCard.status === "flying-back"
                    ? { 
                         // Go back to start
                         x: flyingCard.startRect.left,
                         y: flyingCard.startRect.top,
                         scale: 1,
                         rotate: -360 // Spin back
                      }
                    : {
                        // Go to target
                        x: flyingCard.targetRect.left,
                        y: flyingCard.targetRect.top,
                        // Optional: Adjust for size difference if needed, but assuming roughly same size
                        scale: 1.1, 
                        rotate: 360 // Spin effect
                      }
                }
                exit={{ opacity: 0, scale: 0 }} // Fade out success
                transition={{ type: "spring", stiffness: 80, damping: 15 }} // Slower spring
                className="absolute w-[clamp(44px,9vw,96px)] aspect-[2.5/3.5]"
             >
                 <PlayCard 
                    letterA={flyingCard.letterA}
                    letterB={flyingCard.letterB}
                    isFlipped={flyingCard.face === "B" ? true : false} 
                    className="shadow-2xl w-full h-full"
                 />
             </motion.div>
         </div>
      )}
      </AnimatePresence>
    </div>
  );
}


