"use client";

import React, { useState, useEffect } from "react";
import {
  Gamepad2,
  User,
  LogIn,
  Share2,
  Settings,
  Github,
  Linkedin,
  PlayCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSound } from "@/hooks/useSound";
import { AvatarSelector } from "@/components/AvatarSelector";
import { motion } from "framer-motion";
import { HelpButton } from "@/components/HelpModal";

interface FloatingLetter {
  id: number;
  char: string;
  top: number;
  left: number;
  size: number;
  rotate: number;
  duration: number;
  delay: number;
}

const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

const howToList = [
  {
    id: 1,
    title: "سجّل وابدأ",
    text: "أدخل اسمك بالأسفل لإنشاء الروم.",
    icon: User,
    color: "text-purple-400",
    bg: "bg-purple-500/20",
  },
  {
    id: 2,
    title: "ادعُ الأصدقاء",
    text: "انسخ الرابط وشاركه.",
    icon: Share2,
    color: "text-blue-400",
    bg: "bg-blue-500/20",
  },
  {
    id: 3,
    title: "ابدأ التحدي",
    text: "اضبط الإعدادات والعب.",
    icon: Settings,
    color: "text-green-400",
    bg: "bg-green-500/20",
  },
];

export default function VocabularyChallengeHome() {
  // only showing the "howto" (طريقة اللعب) section on the landing page
  const router = useRouter();
  const { play } = useSound();

  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatar, setAvatar] = useState(
    "https://api.dicebear.com/7.x/avataaars/svg?seed=flex-089",
  );

  useEffect(() => {
    const savedName = localStorage.getItem("vc:name");
    const savedAvatar = localStorage.getItem("vc:avatar");
    if (savedName) setUsername(savedName);
    if (savedAvatar) setAvatar(savedAvatar);
  }, []);

  const [backgroundLetters, setBackgroundLetters] = useState<FloatingLetter[]>(
    [],
  );

  useEffect(() => {
    const chars = "أبتثجحخدذرزسشصضطظعغفقكلمنهوي";
    const letterCount = 55;
    const newLetters: FloatingLetter[] = [];

    for (let i = 0; i < letterCount; i++) {
      newLetters.push({
        id: i,
        char: chars.charAt(Math.floor(Math.random() * chars.length)),
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.floor(Math.random() * 60) + 20,
        rotate: Math.floor(Math.random() * 360),
        duration: Math.floor(Math.random() * 14) + 11,
        delay: Math.random() * -20,
      });
    }
    setBackgroundLetters(newLetters);
  }, []);

  const handleEnterLobby = async (e: React.FormEvent) => {
    e.preventDefault();
    play("click");

    const name = username.trim();
    if (!name) {
      setError("يرجى إدخال اسم اللاعب للمتابعة!");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to create room");
      }

      const { roomCode, playerId } = data;

      localStorage.setItem("vc:name", name);
      localStorage.setItem("vc:playerId", playerId);
      localStorage.setItem("vc:roomCode", roomCode);
      localStorage.setItem("vc:avatar", avatar);

      router.push(`/${roomCode}`);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "حدث خطأ غير متوقع";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#060b19] relative overflow-hidden flex items-center justify-center p-4 selection:bg-purple-500 selection:text-white"
    >
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translate(0px, 0px) rotate(var(--tw-rotate));
          }
          33% {
            transform: translate(30px, -50px)
              rotate(calc(var(--tw-rotate) + 15deg));
          }
          66% {
            transform: translate(-20px, 20px)
              rotate(calc(var(--tw-rotate) - 10deg));
          }
          100% {
            transform: translate(0px, 0px) rotate(var(--tw-rotate));
          }
        }
      `}</style>

      {/* Background Letters */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {backgroundLetters.map((letter) => {
          const letterStyle: React.CSSProperties & { "--tw-rotate": string } = {
            top: `${letter.top}%`,
            left: `${letter.left}%`,
            fontSize: `${letter.size}px`,
            transform: `rotate(${letter.rotate}deg)`,
            "--tw-rotate": `${letter.rotate}deg`,
            animationName: "float",
            animationDuration: `${letter.duration}s`,
            animationDelay: `${letter.delay}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
          };

          return (
            <div
              key={letter.id}
              className="absolute font-black opacity-[0.1] text-purple-100 select-none blur-[0.6px]"
              style={letterStyle}
            >
              {letter.char}
            </div>
          );
        })}
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-1000 pointer-events-none z-0"></div>
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[100px] animate-pulse delay-700 pointer-events-none z-0"></div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "tween", bounce: 0.4 }}
        className="relative w-full max-w-[500px] md:max-w-[650px] lg:max-w-[800px] z-10"
      >
        <div className="bg-transparent backdrop-blur-md border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(147,51,234,0.08)] overflow-hidden">
          {/* Top Gradient Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          <div className="p-6 sm:p-8 md:p-10 lg:p-12">
            {/* Header */}
            <header className="text-center mb-8 relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
                className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30 border border-purple-400/30 relative"
              >
                <Gamepad2 size={36} className="text-white drop-shadow-md" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-2 relative inline-block"
              >
                <motion.span
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                  className="bg-clip-text pb-5 text-transparent bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#FF0080] bg-[length:200%_auto] drop-shadow-[0_0_12px_rgba(121,40,202,0.6)]"
                >
                  تحدي المفردات
                </motion.span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-purple-300/80 text-sm lg:text-base font-bold tracking-wide mb-6"
              >
                اختبر سرعتك وخزينتك اللغوية...واستمتع مع الاصدقاء
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3 justify-center mt-2 relative z-20"
              >
                <HelpButton variant="icon-text" />
                <a
                  href="https://github.com/ismaillxxadil/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/40 transition"
                >
                  <Github size={18} />
                </a>
                <a
                  href="https://www.linkedin.com/in/ismail-adil-529173346/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/40 transition"
                >
                  <Linkedin size={18} />
                </a>
              </motion.div>
            </header>

            {/* (title moved into content area for better harmony) */}

            {/* Content Area (طريقة اللعب only) */}
            <div className="bg-[#0b1121]/50 rounded-2xl p-4 lg:p-6 mb-8 lg:mb-10 border border-slate-700/50 min-h-[260px] lg:min-h-[320px] overflow-hidden relative">
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <PlayCircle size={18} className="text-purple-400" />
                  <h3 className="text-sm text-slate-300 font-semibold">
                    طريقة اللعب
                  </h3>
                </div>
                <div className="h-[1px] bg-slate-700/30 mt-3 rounded" />
              </div>

              <motion.div
                key="howto"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-3"
              >
                {howToList.map((step, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.12 }}
                    key={step.id}
                    className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10 relative overflow-hidden group backdrop-blur-[1px]"
                  >
                    <div
                      className={`w-10 h-10 flex-shrink-0 flex items-center justify-center ${step.bg} ${step.color} rounded-lg font-black text-base shadow-inner group-hover:scale-105 transition-transform duration-250`}
                    >
                      {step.id}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm mb-0.5 leading-tight">
                        {step.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <step.icon size={13} className={step.color} />
                        <span>{step.text}</span>
                      </div>
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Form */}
            <form onSubmit={handleEnterLobby} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-sm font-bold text-slate-200 mr-2 block"
                >
                  اسم اللاعب
                </label>
                <div className="relative group">
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 lg:right-5 text-slate-400 group-focus-within:text-purple-400 transition-colors">
                    <User className="w-[20px] h-[20px] lg:w-[24px] lg:h-[24px]" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسمك المميز..."
                    maxLength={15}
                    className="w-full bg-[#0b1121] border-2 border-slate-700 text-white pr-12 lg:pr-14 pl-4 py-3.5 lg:py-4 rounded-2xl focus:outline-none focus:border-purple-500 hover:border-slate-600 transition-all placeholder:text-slate-500 shadow-inner font-medium text-lg lg:text-xl"
                    autoComplete="off"
                  />
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-pink-400 text-xs mr-2 font-bold absolute"
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              {/* Avatar Selection */}
              <div className="pb-1">
                <AvatarSelector
                  selectedAvatar={avatar}
                  onSelect={(url) => {
                    setAvatar(url);
                    play("click");
                  }}
                />
              </div>

              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 0 20px rgba(168,85,247,0.4)",
                }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] hover:bg-[position:right_center] text-white font-black text-lg lg:text-xl py-4 lg:py-5 rounded-2xl shadow-[0_4px_15px_rgba(147,51,234,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed border border-purple-400/20"
              >
                <span
                  className={`flex items-center justify-center gap-2 relative z-10 transition-all ${isLoading ? "opacity-0" : "opacity-100"}`}
                >
                  دخول اللوبي
                  <LogIn className="w-[22px] h-[22px] lg:w-[26px] lg:h-[26px] rotate-180" />
                </span>

                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin shadow-md"></div>
                  </div>
                )}
              </motion.button>
            </form>
          </div>

          <div className="bg-slate-900/80 px-4 py-4 flex items-center justify-between border-t border-slate-800/50 rounded-b-3xl">
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/ismaillxxadil/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/40 transition"
              >
                <Github size={16} />
              </a>
              <a
                href="https://www.linkedin.com/in/ismail-adil-529173346/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/40 transition"
              >
                <Linkedin size={16} />
              </a>
            </div>

            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest opacity-80">
              &copy; تحدي المفردات
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
