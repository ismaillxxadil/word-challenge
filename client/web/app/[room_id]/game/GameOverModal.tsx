import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GameOverModalProps {
  isVisible: boolean;
  winnerName: string;
  isHost: boolean;
  onRestart: () => void;
  onReturnToLobby: () => void;
  onLeave: () => void;
}

export const GameOverModal = ({
  isVisible,
  winnerName,
  isHost,
  onRestart,
  onReturnToLobby,
  onLeave,
}: GameOverModalProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="relative bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-sm w-full shadow-2xl overflow-hidden"
          >
            {/* Confetti / Decoration Background (Optional CSS effects) */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500" />
            
            <div className="flex flex-col items-center text-center gap-6">
              <div className="text-6xl animate-bounce">👑</div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  الفائز هو
                </h2>
                <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  {winnerName}
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full pt-4">
                {isHost ? (
                    <>
                      <button
                      onClick={onRestart}
                      className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-purple-500/25"
                      >
                      لعب مرة أخرى 🔄
                      </button>
                      <button
                        onClick={onReturnToLobby}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                      >
                        العودة للوبي (الجميع) 🏠
                      </button>
                    </>
                ) : (
                    <div className="text-sm text-slate-400 italic">
                        في انتظار المضيف...
                    </div>
                )}
                
                <div className="h-px bg-slate-700 w-full my-1" />

                <button
                  onClick={onLeave}
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 font-medium rounded-xl transition-colors text-sm"
                >
                  مغادرة الغرفة (خروج نهائي) 🚪
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
