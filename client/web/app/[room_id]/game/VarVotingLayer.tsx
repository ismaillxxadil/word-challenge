import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Check, X, Gavel, Timer } from "lucide-react";
import { useRoomStore } from "@/store/useRoomStore";
import { toast } from "sonner";
import { VarSession, Player } from "../../types";

interface VarVotingLayerProps {
  session: VarSession;
  players: Player[];
  currentPlayerId: string | null;
}

export function VarVotingLayer({
  session,
  players,
  currentPlayerId,
}: VarVotingLayerProps) {
  const { socket, room } = useRoomStore();
  const [timeLeft, setTimeLeft] = useState(0);
  const [explanationInput, setExplanationInput] = useState("");
  const [isSubmittingExplanation, setIsSubmittingExplanation] = useState(false);

  // Identify roles
  const challenger = players.find((p) => p.id === session.challengerId);
  const accused = players.find((p) => p.id === session.accusedId);
  const isAccused = currentPlayerId === session.accusedId;
  const isChallenger = currentPlayerId === session.challengerId;
  const isEligible =
    currentPlayerId && session.eligibleVoters.includes(currentPlayerId);
  const hasVoted = currentPlayerId ? !!session.votes[currentPlayerId] : false;

  // Snapshot details
  const { move, centerWordBefore, centerWordAfter } = session.snapshot;
  const playedCard = move?.card;
  const pick = move?.pick;
  const chosenLetter = pick === "B" ? playedCard?.letterB : playedCard?.letterA;

  // Vote counts
  const voteCount = Object.keys(session.votes).length;
  const totalEligible = session.eligibleVoters.length;

  // Timer logic
  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const left = Math.max(0, Math.ceil((session.expiresAt - now) / 1000));
      setTimeLeft(left);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [session.expiresAt]);

  // Handle errors
  useEffect(() => {
    if (!socket) return;
    const handleError = (data: { code: string }) => {
      console.error("VAR error:", data.code);
      setIsSubmittingExplanation(false);
      toast.error("حدث خطأ أثناء الاتصال بالخادم", { id: "var-error", duration: 3000 });
    };

    socket.on("var:error", handleError);
    return () => {
      socket.off("var:error", handleError);
    };
  }, [socket]);

  const handleVote = (choice: "ACCEPT" | "REJECT") => {
    if (!socket || !room) return;
    socket.emit("var:vote", { roomCode: room.code, choice });
  };

  const handleSubmitExplanation = () => {
    if (!socket || !room || !explanationInput.trim() || isSubmittingExplanation) return;
    setIsSubmittingExplanation(true);
    socket.emit("var:submit-explanation", {
      roomCode: room.code,
      explanation: explanationInput.trim(),
    });
  };

  const isAwaitingExplanation = session.status === "awaiting_explanation";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-lg md:max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-800/50 p-4 md:p-6 text-center border-b border-slate-700">
          <div className="flex items-center justify-center gap-3 mb-2">
            <ShieldAlert size={28} className="text-yellow-400 animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-wider">
              محكمة الـ VAR
            </h2>
          </div>
          <p className="text-slate-400 text-sm md:text-base">
            <span className="text-yellow-400 font-bold">{challenger?.name}</span>{" "}
            يشكك في حركة{" "}
            <span className="text-red-400 font-bold">{accused?.name}</span>
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar">
          {/* Replay Section */}
          <div className="flex flex-row flex-wrap items-center justify-center gap-2 md:gap-8 mb-8">
           
            {/* After */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] md:text-xs text-slate-500 uppercase font-bold mb-1">
                بعد
              </span>
              <div
                className={`px-2 py-1 md:px-4 rounded-xl text-sm md:text-2xl font-mono font-bold border transition-colors duration-500 ${
                  timeLeft % 2 === 0 
                  ? "bg-red-950/50 text-red-400 border-red-500/50" 
                  : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                {centerWordAfter}
              </div>
            </div>

            {/* Arrow */}
            <div className="text-slate-600">➜</div>

            {/* The Move */}
            <div className="relative group scale-75 md:scale-100">
              <div className="w-16 h-24 md:w-20 md:h-28 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl shadow-lg flex flex-col items-center justify-center border-2 border-yellow-400/50 relative overflow-hidden">
                 {/* Card shiny effect */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                 
                <span
                  className={`text-xl md:text-2xl font-black ${
                    pick === "A" ? "text-white" : "text-white/30"
                  }`}
                >
                  {playedCard?.letterA}
                </span>
                <div className="w-10 h-[2px] bg-white/20 my-1 md:my-2"></div>
                <span
                  className={`text-xl md:text-2xl font-black ${
                    pick === "B" ? "text-white" : "text-white/30"
                  }`}
                >
                  {playedCard?.letterB}
                </span>
              </div>
              <div className="absolute -bottom-6 md:-bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-yellow-500 whitespace-nowrap bg-slate-900/80 px-2 py-1 rounded-full border border-yellow-500/30">
                لعب: {chosenLetter}
              </div>
            </div>

            {/* Arrow */}
            <div className="text-slate-600">➜</div>

             {/* Before */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] md:text-xs text-slate-500 uppercase font-bold mb-1">
                قبل
              </span>
              <div className="bg-slate-800 px-2 py-1 md:px-4 rounded-xl text-sm md:text-2xl font-mono text-slate-300 border border-slate-700">
                {centerWordBefore}
              </div>
            </div>
           
          </div>

          {/* Explanation Display Bubble */}
          {session.explanation && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/80 rounded-2xl p-4 mb-6 relative border border-slate-700"
            >
              {/* Tooltip triangle */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-b-[12px] border-b-slate-700 border-r-[10px] border-r-transparent"></div>
              <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-b-[12px] border-b-slate-800/80 border-r-[10px] border-r-transparent"></div>
              
              <div className="flex gap-3 text-right" dir="rtl">
                 <span className="text-xl">💬</span>
                 <div>
                    <p className="text-xs text-slate-400 font-bold mb-1">دفاع {accused?.name}:</p>
                    <p className="text-sm md:text-base text-white">{session.explanation}</p>
                 </div>
              </div>
            </motion.div>
          )}

          {/* Controls Container */}
          <div className="bg-slate-950/50 rounded-2xl p-5 md:p-6 border border-slate-800">
            <div className={`flex items-center mb-6 transition-all ${isAwaitingExplanation ? "justify-center" : "justify-between"}`}>
              <div className="flex items-center gap-2 text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
                <Timer size={16} className="text-blue-400" />
                <span className="font-mono text-lg font-bold text-blue-100">{timeLeft}s</span>
              </div>
              {!isAwaitingExplanation && (
                <div className="flex items-center gap-2 text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Gavel size={16} className="text-purple-400" />
                  <span className="text-sm md:text-base font-medium">
                    تم التصويت: <span className="text-white font-bold">{voteCount}</span> / <span className="text-slate-500">{totalEligible}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Awaiting Explanation Phase Content */}
            {isAwaitingExplanation ? (
              <div className="animate-in fade-in duration-300">
                {isAccused ? (
                  <div className="flex flex-col gap-3" dir="rtl">
                    <label className="text-sm text-yellow-400 font-bold mb-1 block">
                      لديك {timeLeft} ثانية لتبرير هذه الكلمة!
                    </label>
                    <input 
                       autoFocus
                       disabled={isSubmittingExplanation}
                       type="text" 
                       value={explanationInput}
                       onChange={(e) => setExplanationInput(e.target.value)}
                       onKeyDown={(e) => {
                         if (e.key === "Enter") handleSubmitExplanation();
                       }}
                       placeholder="اشرح خطتك بسرعة..." 
                       className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm md:text-base disabled:opacity-50"
                    />
                    <button 
                      onClick={handleSubmitExplanation}
                      disabled={!explanationInput.trim() || isSubmittingExplanation}
                      className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-colors active:scale-95 flex justify-center items-center gap-2"
                    >
                      {isSubmittingExplanation ? "يتم الإرسال..." : "تأكيد الدفاع"}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-900/30 rounded-xl border border-slate-800/50 dashed flex flex-col items-center gap-3">
                     <span className="text-3xl animate-bounce">✍️</span>
                     <p className="text-slate-300 font-medium">
                        في انتظار <span className="text-red-400 font-bold">{accused?.name}</span> للدفاع عن الكلمة...
                     </p>
                     <p className="text-slate-500 text-xs mt-2">التصويت سيبدأ بعد التبرير أو انتهاء الوقت.</p>
                  </div>
                )}
              </div>
            ) : (
              /* Voting Phase Content */
              <div className="animate-in fade-in zoom-in-95 duration-500">
                {isEligible && !hasVoted ? (
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <button
                  onClick={() => handleVote("ACCEPT")}
                  className="flex flex-col items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-400 text-green-400 p-4 rounded-xl transition-all group active:scale-95"
                >
                  <div className="bg-green-500/20 p-3 rounded-full group-hover:bg-green-500/30 transition-colors">
                    <Check size={28} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-bold text-sm md:text-base">صحيحة (قبول)</span>
                </button>
                <button
                  onClick={() => handleVote("REJECT")}
                  className="flex flex-col items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-400 text-red-400 p-4 rounded-xl transition-all group active:scale-95"
                >
                  <div className="bg-red-500/20 p-3 rounded-full group-hover:bg-red-500/30 transition-colors">
                    <X size={28} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-bold text-sm md:text-base">خاطئة (رفض)</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-900/30 rounded-xl border border-slate-800/50 dashed">
                {hasVoted ? (
                  <div className="text-green-400 font-bold flex flex-col items-center justify-center gap-2 animate-in zoom-in">
                    <div className="bg-green-500/20 p-2 rounded-full">
                       <Check size={24} /> 
                    </div>
                    <span>تم تسجيل صوتك بنجاح</span>
                    <span className="text-xs text-green-500/60 font-normal">بانتظار بقية اللاعبين...</span>
                  </div>
                    ) : isAccused ? (
                      <div className="flex flex-col items-center gap-2">
                         <span className="text-2xl">🤐</span>
                         <p className="text-slate-400 font-medium">أنت المتهم</p>
                         <p className="text-slate-600 text-xs">لقد انتهى وقت الدفاع، انتظر الحكم!</p>
                      </div>
                    ) : isChallenger ? (
                      <div className="flex flex-col items-center gap-2">
                         <span className="text-2xl">👀</span>
                         <p className="text-slate-400 font-medium">أنت المدعي</p>
                         <p className="text-slate-600 text-xs">انتظر حكم بقية اللاعبين</p>
                      </div>
                    ) : (
                      <p className="text-slate-500 animate-pulse">انتظر نتيجة التصويت...</p>
                    )}
                  </div>
                )}

                {/* Votes Progress Bar */}
                <div className="mt-6">
                   <div className="flex justify-between text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">
                      <span>نسبة التصويت</span>
                      <span>{Math.round((voteCount / Math.max(1, totalEligible)) * 100)}%</span>
                   </div>
                   <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                     <motion.div 
                       className="h-full bg-blue-500"
                       initial={{ width: 0 }}
                       animate={{ width: `${(voteCount / Math.max(1, totalEligible)) * 100}%` }}
                       transition={{ type: "spring", stiffness: 100 }}
                     />
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
