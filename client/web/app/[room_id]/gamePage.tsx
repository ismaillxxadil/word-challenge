import React, { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { CenterBoard } from "./game/CenterBoard";
import { OpponentPlayer } from "./game/OpponentPlayer";
import { Check, X } from "lucide-react";
import { Player } from "./game/player";
import { Room, Player as RoomPlayer } from "../types";
import { useRoomStore } from "@/store/useRoomStore";
import { useSound } from "@/hooks/useSound";
import { LayoutGroup, AnimatePresence, motion } from "framer-motion";
import { FlyingCardLayer, FlyingCardState } from "./game/FlyingCardLayer";
import { GameOverModal } from "./game/GameOverModal";
import { VarVotingLayer } from "./game/VarVotingLayer";
import { toast } from "sonner";

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
  const { play } = useSound();
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(
    settings.timePerTurn ?? 30,
  );

  // --- Interaction State ---
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(
    null,
  );
  const [selectedFace, setSelectedFace] = useState<"A" | "B" | null>(null);

  // animation State
  const [hiddenCardId, setHiddenCardId] = useState<string | null>(null);

  // what card is currently flying + where it’s going
  const [flying, setFlying] = useState<FlyingCardState | null>(null);

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

  const isMyTurn =
    state.currentPlayerIndex !== null &&
    room.players[state.currentPlayerIndex]?.id === currentPlayerId;

  // --- Game Over Logic ---
  const isHost = me?.isHost ?? false;
  const winnerId = state.phase === "game-over" ? state.winner : null;
  const winnerName = winnerId
    ? players.find((p) => p.id === winnerId)?.name || "لاعب"
    : "";

  // Sound Effects for Turn and Game Over
  useEffect(() => {
    if (isMyTurn) {
      play("turn");
    }
  }, [isMyTurn, play]);

  // Prevent repeating game over sounds
  const playedGameOverSoundRef = useRef(false);

  // Reset sound flag when game starts (or phase changes to playing)
  useEffect(() => {
    if (state.phase === "in-game" || state.phase === "playing") {
      playedGameOverSoundRef.current = false;
    }
  }, [state.phase]);

  useEffect(() => {
    if (state.phase === "game-over" && !playedGameOverSoundRef.current) {
      playedGameOverSoundRef.current = true;
      if (winnerId === me?.id) {
        play("win");
      } else {
        play("lose");
      }
    }
  }, [state.phase, winnerId, me?.id, play]);

  const handleRestart = () => {
    play("click");
    if (socket && room.code) {
      socket.emit("room:start-game", { roomCode: room.code });
    }
  };

  const handleReturnToLobby = () => {
    play("click");
    if (socket && room.code) {
      socket.emit("room:reset-to-lobby", { roomCode: room.code });
    }
  };

  const handleVarStart = () => {
    console.log("🖱️ VAR Button Clicked!");
    // Temporary alert to confirm interaction
    // toast.info("🖱️ VAR Button Clicked! Sending request...");

    if (socket && room.code) {
      play("click");
      console.log("📡 Emitting var:start for room:", room.code);
      socket.emit("var:start", { roomCode: room.code });
    } else {
      console.error("❌ Socket or Room Code missing!", {
        socket: !!socket,
        roomCode: room.code,
      });
    }
  };

  // Listen for VAR events
  const [varResult, setVarResult] = useState<{
    result: "ACCEPT" | "REJECT";
  } | null>(null);

  useEffect(() => {
    if (!socket) return;

    const onVarError = (err: { code: string }) => {
      console.error("❌ VAR Error received:", err);
      toast.error(`VAR Error: ${err.code}`);
    };

    const onVarStarted = (data: any) => {
      console.log("✅ VAR Session Started:", data);
      play("var");
      toast.info("بدأت جلسة الـ VAR! ⚖️");
    };

    const onVarResolved = (data: { result: "ACCEPT" | "REJECT" }) => {
      setVarResult(data);
      setTimeout(() => {
        setVarResult(null);
      }, 3000); // Hide after 3 seconds
    };

    socket.on("var:error", onVarError);
    socket.on("var:started", onVarStarted);
    socket.on("var:resolved", onVarResolved);

    return () => {
      socket.off("var:error", onVarError);
      socket.off("var:started", onVarStarted);
      socket.off("var:resolved", onVarResolved);
    };
  }, [socket]);

  // --- Interaction Handlers ---
  const handleCardClick = (index: number, face?: "A" | "B") => {
    if (!isMyTurn) return;

    if (selectedCardIndex === index) {
      // Toggle face if already selected
      setSelectedFace((prev) => (prev === "A" ? "B" : "A"));
    } else {
      // Select new card with the face currently shown (or default A)
      setSelectedCardIndex(index);
      setSelectedFace(face || "A");
    }
  };

  const handleFaceSelect = (index: number, face: "A" | "B") => {
    if (!isMyTurn) return;
    setSelectedCardIndex(index);
    setSelectedFace(face);
  };

  const handleTargetClick = async (targetIndex: number) => {
    if (selectedCardIndex === null || !selectedFace || !isMyTurn || !socket)
      return;
    if (selectedCardIndex >= myCards.length) return;

    // 1. Prepare Data
    const currentWord = state.centerWord;
    const cardIdx = selectedCardIndex;
    const face = selectedFace;

    // 2. Clear selection
    flushSync(() => {
      setSelectedCardIndex(null);
      setSelectedFace(null);
    });
    const card = myCards[cardIdx]; // contains id, letterA, letterB

    // 3. Measure DOM positions
    const startEl = document.getElementById(`player-card-${cardIdx}`);
    const targetEl = document.getElementById(`center-card-${targetIndex}`);

    if (startEl && targetEl) {
      const startRect = startEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      // 4. Start Flight
      play("play"); // Play sound
      flushSync(() => {
        setHiddenCardId(card.id);
        setFlying({
          id: `fly-${card.id}-${Date.now()}`,
          cardId: card.id,
          letterA: card.letterA,
          letterB: card.letterB,
          pick: face,
          startRect: {
            top: startRect.top,
            left: startRect.left,
            width: startRect.width,
            height: startRect.height,
          },
          targetRect: {
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          },
          status: "flying",
          onComplete: () => {
            // 5. On flight arrival, switching to "waiting" state
            setFlying((prev) => (prev ? { ...prev, status: "waiting" } : null));
          },
        });
      });
    }

    // 5. Send move to server
    socket.emit(
      "room:play-card",
      {
        roomCode: room.code,
        playerId: currentPlayerId,
        cardIndex: cardIdx,
        pick: face,
        targetIndex: targetIndex,
        currentWord: currentWord,
      },
      (response: { ok: boolean; error?: string }) => {
        if (!response.ok) {
          console.error("Play card failed:", response.error);
          toast.error(response.error || "فشل لعب البطاقة");

          // Revert UI state
          flushSync(() => {
            setHiddenCardId(null);
            setFlying(null);
          });
        }
      },
    );
  };

  // Listen for specific game events for effects if needed (animations handled by state changes mostly)
  useEffect(() => {
    if (!socket) return;
    return () => {};
  }, [socket]);

  // Sync hidden card state with real hand updates AND handle "Wait & Return"
  useEffect(() => {
    if (!hiddenCardId) return;

    // Check if card still exists in my hand
    // If it's gone, the move was successful (or server removed it).
    const stillExists = myCards.some((c) => c.id === hiddenCardId);

    if (!stillExists) {
      // SUCCESS: Server accepted move.
      // If we are flying or waiting, just clear.
      if (flying?.cardId === hiddenCardId) {
        setFlying(null);
      }
      setHiddenCardId(null);
    } else {
      // Card still exists.
      // If we are in "waiting" state, it means we reached the target but server hasn't removed card yet.
      // We should wait a bit, then if it's STILL there, fly back (invalid move or lag).
      // For now, let's say if we are "waiting" and we get a room update but card is still there...
      // Actually, "waiting" is triggered by onComplete of flight.

      if (flying?.status === "waiting" && flying.cardId === hiddenCardId) {
        // We are waiting. If this runs, it means a render happened (maybe room update).
        // If card is still here, we might want to trigger return.
        // But we don't want to return immediately on *any* update (e.g. timer tick).
        // Let's use a timeout for the return?
        // Or better: The user said "if not (valid word) ... return".
        // We assume the server sends an event or update.
        // If we get an error or the turn ends without card removal, we return.

        const timer = setTimeout(() => {
          play("invalid");
          setFlying((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              status: "returning",
              // target becomes start (play card position)
              // start becomes current target (center slot)
              // But we don't need to swap them in state if our component handles it.
              // However, our FlyingCardLayer expects "targetRect" to be where we go.
              // So we MUST swap them.
              startRect: prev.targetRect,
              targetRect: prev.startRect,
              onComplete: () => {
                setFlying(null);
                setHiddenCardId(null); // Reveal original
              },
            };
          });
        }, 2000); // Wait 2 seconds for server success
        return () => clearTimeout(timer);
      }
    }
  }, [myCards, hiddenCardId, flying?.status, flying?.cardId, play]);

  // Deck to Hand Animation
  const previousCardsRef = useRef<RoomPlayer["cards"]>([]);
  useEffect(() => {
    const prevCards = previousCardsRef.current || [];
    const newCards = myCards;

    // Detect added cards
    if (newCards.length > prevCards.length) {
      const addedCards = newCards.filter(
        (nc) => !prevCards.some((pc) => pc.id === nc.id),
      );

      addedCards.forEach((card, i) => {
        play("draw");

        // Simple "Fly from Deck" animation
        // Fly from center bottom/right to hand area
        setFlying({
          id: `fly-draw-${card.id}`,
          cardId: card.id,
          letterA: card.letterA,
          letterB: card.letterB,
          pick: "A",
          startRect: {
            top: window.innerHeight / 2 - 50, // Center of screen
            left: window.innerWidth / 2 - 40,
            width: 80,
            height: 110,
          },
          targetRect: {
            top: window.innerHeight - 120, // Near bottom
            left:
              window.innerWidth / 2 - 150 + i * 60 + (Math.random() * 40 - 20), // Rough hand position
            width: 80,
            height: 110,
          },
          status: "flying",
          onComplete: () => {
            setFlying(null);
            setHiddenCardId(null);
          },
        });
        setHiddenCardId(card.id);
      });
    }

    previousCardsRef.current = newCards;
  }, [myCards, play]);

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
  }, [
    state.turnStartedAt,
    state.startedAt,
    settings.timePerTurn,
    room.code,
    isMyTurn,
  ]);

  const mm = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const ss = String(remainingSeconds % 60).padStart(2, "0");

  return (
    <LayoutGroup>
      <div className="fixed inset-0 w-full h-full bg-slate-900 bg-[url('/bg.png')] bg-cover bg-center overflow-hidden z-0">
        {/* Small overlay header so it doesn't push layout down */}
        <div className="absolute top-2 right-3 z-30 flex items-center gap-2 text-xs text-slate-200">
          <span className="font-mono text-[10px] bg-red-900/70 px-2 py-1 rounded-lg border border-red-700">
            Phase: {state.phase}
          </span>
          <span className="font-mono text-[11px] bg-slate-900/70 px-2 py-1 rounded-lg border border-slate-700">
            غرفة #{room.code}
          </span>
          <button
            type="button"
            onClick={() => {
              play("click");
              handleLeave();
            }}
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
                <div id={`player-avatar-${leftOpponent.id}`}>
                  <OpponentPlayer
                    variant="side"
                    name={leftOpponent.name}
                    avatar={getAvatarUrl(leftOpponent)}
                    cards={leftOpponent.cards ?? []}
                  />
                </div>
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
                <div id={`player-avatar-${rightOpponent.id}`}>
                  <OpponentPlayer
                    variant="side"
                    name={rightOpponent.name}
                    avatar={getAvatarUrl(rightOpponent)}
                    cards={rightOpponent.cards ?? []}
                  />
                </div>
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
                hiddenCardId={hiddenCardId}
                onCardClick={handleCardClick}
                onFaceSelect={handleFaceSelect}
                onVarClick={handleVarStart}
              />
            )}
          </div>
        </div>

        {/* 🚀 FLYING CARD LAYER 🚀 */}
        <FlyingCardLayer flyingCard={flying} />

        {/* ⚖️ VAR VOTING LAYER ⚖️ */}
        <AnimatePresence>
          {state.phase === "var" && state.varSession && (
            <VarVotingLayer
              session={state.varSession}
              players={players}
              currentPlayerId={currentPlayerId}
            />
          )}
        </AnimatePresence>

        {/* 🏁 VAR RESULT OVERLAY 🏁 */}
        <AnimatePresence>
          {varResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
            >
              <div className="bg-slate-900/90 backdrop-blur-md p-8 rounded-3xl border border-slate-700 shadow-2xl flex flex-col items-center gap-4 text-center">
                {varResult.result === "ACCEPT" ? (
                  <>
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 mb-2">
                      <Check size={48} className="text-white" strokeWidth={3} />
                    </div>
                    <h2 className="text-4xl font-black text-green-400">
                      تم قبول الحركة!
                    </h2>
                    <p className="text-slate-300">الكلمة صحيحة. يستمر اللعب.</p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20 mb-2">
                      <X size={48} className="text-white" strokeWidth={3} />
                    </div>
                    <h2 className="text-4xl font-black text-red-500">
                      تم رفض الحركة!
                    </h2>
                    <p className="text-slate-300">
                      الكلمة خاطئة. تم إلغاء الحركة.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🏆 GAME OVER MODAL 🏆 */}
        <GameOverModal
          isVisible={!!winnerId}
          winnerName={winnerName}
          isHost={isHost}
          onRestart={handleRestart}
          onReturnToLobby={handleReturnToLobby}
          onLeave={handleLeave}
        />
      </div>
    </LayoutGroup>
  );
}
