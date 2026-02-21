"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const AR_LETTERS = [
  "ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", 
  "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", 
  "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", 
  "ن", "ه", "و", "ي", "ى"
];

interface ArabicLetterPickerModalProps {
  isOpen: boolean;
  onSelect: (letter: string) => void;
  onClose: () => void;
}

export const ArabicLetterPickerModal = ({ isOpen, onSelect, onClose }: ArabicLetterPickerModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center isolate px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
              <h2 className="text-base font-bold text-slate-800 dark:text-white" dir="rtl">
                اختر الحرف
              </h2>
            </div>
            
            {/* Header Subtitle/Decorative */}
            <div className="bg-gradient-to-r from-purple-500/10 via-emerald-500/10 to-transparent p-2 border-b border-slate-100 dark:border-slate-800 text-center">
               <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 rtl" dir="rtl">
                 البطاقة النجمة يمكن أن تكون أي حرف!
               </p>
            </div>

            {/* Grid Area */}
            <div className="p-3 sm:p-4" dir="rtl">
              <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5 sm:gap-2 max-h-[45vh] overflow-y-auto px-1 py-1 custom-scrollbar">
                {AR_LETTERS.map((letter) => (
                  <motion.button
                    key={letter}
                    onClick={() => onSelect(letter)}
                    whileHover={{ scale: 1.1, backgroundColor: "rgb(20 184 166 / 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    className="aspect-square w-full rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg sm:text-xl font-bold font-serif text-slate-800 dark:text-slate-200 hover:border-teal-500 dark:hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors shadow-sm"
                  >
                    {letter}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
