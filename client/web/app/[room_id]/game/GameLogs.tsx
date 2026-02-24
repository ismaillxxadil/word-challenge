"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRoomStore } from "@/store/useRoomStore";
import { History, X, AlertCircle, CheckCircle2, MessageSquareWarning, Lock } from "lucide-react";
import { submitComplaint } from "../../actions/complaint";
import { toast } from "sonner";

export const GameLogs = () => {
  const room = useRoomStore((state) => state.room);
  const [isOpen, setIsOpen] = useState(false);
  const [complainingWords, setComplainingWords] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!room) return null;

  const validLogs = room.state.playedWords.filter(
    (w) => w.centerWordAfter || (w.attempt && w.attempt.newWord)
  );

  const handleComplain = async (word: string, type: string) => {
    if (complainingWords[word]) return;
    
    setComplainingWords((prev) => ({ ...prev, [word]: true }));
    toast.loading(`تقديم شكوى على كلمة "${word}"...`, { id: `complaint-${word}` });
    
    const res = await submitComplaint(word, type);
    
    if (res.success) {
      toast.success(`تم تقديم الشكوى بنجاح`, { id: `complaint-${word}` });
    } else {
      toast.error(`حدث خطأ أثناء تقديم الشكوى`, { id: `complaint-${word}` });
      setComplainingWords((prev) => ({ ...prev, [word]: false }));
    }
  };

  const recentLogs = validLogs.slice(-5);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-2 right-2 sm:bottom-6 sm:right-6 z-40 bg-zinc-950/80 backdrop-blur-lg border border-zinc-700/60 rounded-2xl shadow-xl cursor-pointer hover:bg-zinc-900/90 hover:border-zinc-500/80 transition-all hover:scale-102 group hidden sm:flex flex-col overflow-hidden w-[110px] sm:w-[180px]"
            title="سجل اللعب (انقر للتفاصيل)"
            dir="rtl"
          >
            {/* Header of mini view */}
            <div className="flex items-center justify-between bg-black/20 px-1.5 py-1.5 sm:px-3 sm:py-2 border-b border-white/5">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <History className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-300 group-hover:text-indigo-200 transition-colors" />
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 group-hover:text-white transition-colors">أحدث الحركات</span>
              </div>
              {validLogs.length > 5 && (
                <span className="text-[8px] sm:text-[10px] text-zinc-400 font-bold bg-white/5 px-1 sm:px-1.5 py-0.5 rounded-sm sm:rounded-md">
                  +{validLogs.length - 5}
                </span>
              )}
            </div>

            {/* List of 5 recent items */}
            <div className="flex flex-col p-1 sm:p-2 gap-0.5 sm:gap-1 h-[100px] sm:h-[155px] overflow-hidden">
              {recentLogs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[9px] sm:text-[11px] text-zinc-500 pb-2">لا يوجد سجل</div>
              ) : (
                recentLogs.map((log, idx) => {
                  const isAccepted = log.ok;
                  const isLocked = log.move?.isLockAction;
                  const word = isAccepted ? log.centerWordAfter : log.attempt?.newWord;
                  if (!word) return null;
                  
                  const statusConfig = isLocked 
                    ? { color: "slate", icon: Lock, bg: "bg-slate-500/10", textIcon: "text-slate-400" }
                    : isAccepted 
                      ? { color: "emerald", icon: CheckCircle2, bg: "bg-emerald-500/10", textIcon: "text-emerald-400" }
                      : { color: "rose", icon: AlertCircle, bg: "bg-rose-500/10", textIcon: "text-rose-400" };
                      
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div key={idx} className={`flex items-center justify-between px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg ${statusConfig.bg}`}>
                      <div className="flex items-center gap-1 sm:gap-1.5 overflow-hidden">
                        <StatusIcon className={`flex-shrink-0 h-2.5 w-2.5 sm:h-3 sm:w-3 ${statusConfig.textIcon}`} />
                        <span className={`text-[9px] sm:text-[11px] font-bold tracking-wide truncate ${statusConfig.textIcon}`}>{word}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="pointer-events-auto w-full max-w-md bg-zinc-900/95 backdrop-blur-md border border-zinc-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
              ref={containerRef}
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-100 font-bold text-lg">
                  <History className="h-5 w-5 text-indigo-400" />
                  سجل اللعب
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {validLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2 py-8">
                    <History className="h-10 w-10 opacity-20" />
                    <p>لا يوجد سجل بعد</p>
                  </div>
                ) : (
                  validLogs.map((log, idx) => {
                    const isAccepted = log.ok;
                    const isLocked = log.move?.isLockAction;
                    const word = isAccepted ? log.centerWordAfter : log.attempt?.newWord;
                    const player = room.players.find(p => p.id === log.playerId);
                    
                    if (!word) return null;

                    const statusConfig = isLocked 
                      ? { color: "slate", icon: Lock, text: "قفل", border: "border-slate-500/30", bgGlow: "bg-slate-500/5", bgGlowHover: "group-hover:bg-slate-500/10", textIcon: "text-slate-400", badgeBg: "bg-slate-500/10", badgeBorder: "border-slate-500/20" }
                      : isAccepted 
                        ? { color: "emerald", icon: CheckCircle2, text: "مقبولة", border: "border-emerald-500/30", bgGlow: "bg-emerald-500/5", bgGlowHover: "group-hover:bg-emerald-500/10", textIcon: "text-emerald-400", badgeBg: "bg-emerald-500/10", badgeBorder: "border-emerald-500/20" }
                        : { color: "rose", icon: AlertCircle, text: "مرفوضة", border: "border-rose-500/30", bgGlow: "bg-rose-500/5", bgGlowHover: "group-hover:bg-rose-500/10", textIcon: "text-rose-400", badgeBg: "bg-rose-500/10", badgeBorder: "border-rose-500/20" };

                    const StatusIcon = statusConfig.icon;

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`bg-zinc-800/50 rounded-xl p-3 border ${statusConfig.border} flex flex-col gap-2 relative overflow-hidden group`}
                      >
                        {/* Background glow effect based on status */}
                        <div className={`absolute top-0 right-0 w-32 h-32 ${statusConfig.bgGlow} rounded-full blur-2xl -mr-16 -mt-16 ${statusConfig.bgGlowHover} transition-colors`} />

                        <div className="flex justify-between items-center relative z-10">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`h-4 w-4 ${statusConfig.textIcon}`} />
                            <span className="text-white font-bold text-lg tracking-wide">{word}</span>
                          </div>
                          {player && (
                            <span className="text-xs text-zinc-400 truncate max-w-[100px]">
                              {player.name}
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-1 relative z-10">
                          <span className={`text-xs px-2 py-1 rounded-md ${statusConfig.badgeBg} ${statusConfig.textIcon} font-medium border ${statusConfig.badgeBorder}`}>
                            {statusConfig.text}
                          </span>

                          <button
                            onClick={() => handleComplain(word, isLocked ? "locked" : isAccepted ? "accepted" : "rejected")}
                            disabled={complainingWords[word]}
                            className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 px-2 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <MessageSquareWarning className="h-3.5 w-3.5" />
                            {complainingWords[word] ? "تم التقديم..." : "شكوى"}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(63, 63, 70, 0.8);
          border-radius: 20px;
        }
      `}</style>
    </>
  );
};
