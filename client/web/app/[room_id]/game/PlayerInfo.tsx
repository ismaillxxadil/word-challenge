import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRoomStore } from "@/store/useRoomStore";

const EMOJIS = ["😂", "😍", "😡", "😭", "👍", "👎", "🔥", "🤔"];

interface EmojiReaction {
  id: string;
  emoji: string;
}

interface PlayerInfoProps {
  playerId: string;
  isMe?: boolean;
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
  playerId,
  isMe = false,
  name = "",
  avatar,
  cards = [],
  onVarClick,
  varDisabledReason, // New prop
  className = "",
  isActiveTurn = false,
  isOnline = true,
}: PlayerInfoProps) => {
  const { socket, room } = useRoomStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactions, setReactions] = useState<EmojiReaction[]>([]);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveEmoji = (data: { playerId: string; emoji: string }) => {
      // Only process emojis meant for THIS specific player's avatar
      if (data.playerId === playerId) {
        const id = `${Date.now()}-${Math.random()}`;
        setReactions((prev) => [...prev, { id, emoji: data.emoji }]);

        // Remove the emoji after animation completes
        setTimeout(() => {
          setReactions((prev) => prev.filter((r) => r.id !== id));
        }, 2000); // match animation duration roughly
      }
    };

    socket.on("room:receive-emoji", handleReceiveEmoji);

    return () => {
      socket.off("room:receive-emoji", handleReceiveEmoji);
    };
  }, [socket, playerId]);

  const sendEmoji = (emoji: string) => {
    if (!socket || !room) return;
    
    socket.emit("room:send-emoji", {
      roomCode: room.code,
      playerId,
      emoji,
    });
    
    setShowEmojiPicker(false);
  };

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

          {/* Floating Emojis Container */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-50">
            <AnimatePresence>
              {reactions.map((reaction) => (
                <motion.div
                  key={reaction.id}
                  initial={{ opacity: 0, scale: 0.5, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: -40 }}
                  exit={{ opacity: 0, scale: 0.8, y: -50 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute bottom-0 text-3xl filter drop-shadow-md"
                >
                  {reaction.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
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

      <div className="flex items-center gap-2">
        {/* Emoji Trigger Button & Picker (Only for current user) */}
        {isMe && (
          <div className="relative">
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center text-sm shadow-sm transition-transform active:scale-95 border border-white/5"
              title="تفاعل"
            >
              😊
            </button>

            {/* Framer Motion Emoji Picker */}
            <AnimatePresence>
              {showEmojiPicker && (
                <>
                  {/* Backdrop to close picker on click outside */}
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowEmojiPicker(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="absolute bottom-full right-0 mb-2 p-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl z-50 grid grid-cols-4 gap-1.5 w-max"
                  >
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => sendEmoji(emoji)}
                        className="text-xl sm:text-2xl p-1.5 hover:scale-125 transition-transform hover:bg-white/10 rounded-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* VAR Button / Indicator */}
        {(!varDisabledReason || (!varDisabledReason.includes("VAR is disabled in room settings") && !varDisabledReason.includes("needs at least 3 players"))) && (
          isMe ? (
            !varDisabledReason?.includes("VAR_ALREADY_USED") && (
              <button
                type="button"
                onClick={onVarClick}
                title={varDisabledReason || "تحدي VAR"}
                className={[
                  "shrink-0 inline-flex items-center gap-1.5 rounded-lg font-bold transition-all shadow-md border-b-2 px-[clamp(8px,1.5vw,12px)] py-[clamp(2px,0.8vw,6px)] text-[clamp(9px,1vw,11px)]",
                  !varDisabledReason
                    ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-95 border-slate-950"
                    : "bg-slate-400/40 text-slate-500 border-slate-500/30 active:scale-95 opacity-70"
                ].join(" ")}
              >
                <span>VAR</span>
              </button>
            )
          ) : (
            !varDisabledReason?.includes("VAR_ALREADY_USED") && (
              <div
                title="بطاقة VAR المتاحة"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg font-bold shadow-md border-b-2 px-[clamp(8px,1.5vw,12px)] py-[clamp(2px,0.8vw,6px)] text-[clamp(9px,1vw,11px)] bg-slate-400/20 text-slate-400 border-slate-500/20 opacity-80 cursor-default select-none"
              >
                <span>VAR</span>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
};
