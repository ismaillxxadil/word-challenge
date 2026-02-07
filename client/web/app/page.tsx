"use client";

import React, { useState } from "react";
import {
  Gamepad2,
  ScrollText,
  User,
  LogIn,
  Trophy,
  Timer,
  Swords,
  AlertTriangle,
  Layers,
  Share2,
  Settings,
  PlayCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function VocabularyChallengeHome() {
  const [activeTab, setActiveTab] = useState<"rules" | "howto">("rules");
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatar, setAvatar] = useState(
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  );

  const AVATAR_OPTIONS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Layla",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Omar",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Noor",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Zayd",
  ] as const;

  const handleEnterLobby = async (e: React.FormEvent) => {
    e.preventDefault();

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
        credentials: "include",
        body: JSON.stringify({ name, avatar }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to create room");
      }

      const { roomCode, playerId } = data;

      // خزّن بيانات اللاعب محليًا عشان صفحة اللوبي تستخدمها
      localStorage.setItem("vc:name", name);
      localStorage.setItem("vc:playerId", playerId);
      localStorage.setItem("vc:roomCode", roomCode);
      localStorage.setItem("vc:avatar", avatar);

      // روح لصفحة اللوبي
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
      className="min-h-screen bg-[#0f172a] relative overflow-hidden flex items-center justify-center p-4 font-sans text-slate-100 selection:bg-purple-500 selection:text-white"
    >
      {/* خلفية زخرفية */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 animate-pulse delay-700"></div>

      {/* الحاوية الرئيسية */}
      <div className="relative w-full max-w-lg bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-purple-900/20 overflow-hidden">
        {/* شريط علوي ملون */}
        <div className="h-2 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>

        <div className="p-6 md:p-8">
          {/* 1. عنوان اللعبة */}
          <header className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-3 bg-slate-800/50 rounded-full mb-3 border border-slate-700 shadow-inner group transition-transform hover:scale-105 duration-300">
              <Gamepad2
                size={32}
                className="text-purple-400 group-hover:text-purple-300 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]"
              />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-400 drop-shadow-sm mb-1">
              تحدي المفردات
            </h1>
            <p className="text-slate-400 text-xs font-medium tracking-wide">
              الكلمة الأقوى.. للفوز الأسرع
            </p>
          </header>

          {/* أزرار التبديل بين القوانين وطريقة اللعب */}
          <div className="flex bg-slate-800/50 p-1 rounded-xl mb-6 border border-slate-700/50 relative">
            <button
              onClick={() => setActiveTab("rules")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === "rules" ? "bg-slate-700 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
            >
              <ScrollText size={16} />
              قوانين اللعبة
            </button>
            <button
              onClick={() => setActiveTab("howto")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === "howto" ? "bg-slate-700 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
            >
              <PlayCircle size={16} />
              طريقة اللعب
            </button>
          </div>

          {/* محتوى المعلومات (متغير حسب التبويب) */}
          <div className="bg-slate-800/30 rounded-2xl p-5 mb-8 border border-slate-700/30 min-h-[260px]">
            {activeTab === "rules" ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex gap-3">
                  <span className="mt-1 p-1.5 bg-purple-500/10 text-purple-400 rounded-lg h-fit">
                    <Layers size={16} />
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white">البداية:</strong> 7 بطاقات
                    لكل لاعب، وكلمة ثلاثية في الوسط.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 p-1.5 bg-green-500/10 text-green-400 rounded-lg h-fit">
                    <Swords size={16} />
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white">اللعب:</strong> غيّر حرفاً
                    واحداً فقط لتكوين كلمة جديدة صحيحة (يمنع تكرار نفس الحرف).
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 p-1.5 bg-pink-500/10 text-pink-400 rounded-lg h-fit">
                    <Timer size={16} />
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white">التحدي:</strong> 15 ثانية
                    فقط! الخطأ أو التأخير = سحب بطاقة عقوبة.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 p-1.5 bg-yellow-500/10 text-yellow-400 rounded-lg h-fit">
                    <AlertTriangle size={16} />
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white">VAR:</strong> لديك فرصة واحدة
                    لاستخدام VAR للاعتراض على كلمة الخصم.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg h-fit">
                    <Trophy size={16} />
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong className="text-white">الفوز:</strong> أول من يتخلص
                    من جميع بطاقاته هو البطل!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Step 1 */}
                <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800/80 transition-colors">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-purple-500/20 text-purple-400 rounded-lg font-bold text-lg">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-0.5">
                      سجّل وابدأ
                    </h4>
                    <p className="text-xs text-slate-400">
                      أدخل اسمك بالأسفل لإنشاء الروم.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800/80 transition-colors">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-lg font-bold text-lg">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-0.5">
                      ادعُ الأصدقاء
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Share2 size={12} />
                      <span>انسخ الرابط وشاركه.</span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800/80 transition-colors">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-green-500/20 text-green-400 rounded-lg font-bold text-lg">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-0.5">
                      ابدأ التحدي
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Settings size={12} />
                      <span>اضبط الإعدادات والعب.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. نموذج الدخول + اختيار الصورة */}
          <form onSubmit={handleEnterLobby} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-semibold text-slate-300 mr-1 block"
              >
                اسم المحارب
              </label>
              <div className="relative group">
                <div className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-500 group-focus-within:text-purple-400 transition-colors">
                  <User size={20} />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسمك هنا..."
                  className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 pr-12 pl-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-slate-600"
                  autoComplete="off"
                />
              </div>
              {error && (
                <p className="text-red-400 text-xs mr-1 animate-pulse font-medium">
                  {error}
                </p>
              )}
            </div>

            {/* اختيار الصورة */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-300 mr-1 block">
                اختر صورتك
              </p>
              <div className="grid grid-cols-3 gap-3">
                {AVATAR_OPTIONS.map((url) => {
                  const isActive = avatar === url;
                  return (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={[
                        "relative rounded-2xl p-1 border transition-all",
                        "bg-slate-900/50 hover:bg-slate-800",
                        isActive
                          ? "border-purple-400 ring-2 ring-purple-500/40"
                          : "border-slate-700",
                      ].join(" ")}
                    >
                      <img
                        src={url}
                        alt="اختيار صورة"
                        className="w-full aspect-square rounded-xl object-cover bg-slate-800"
                      />
                      {isActive && (
                        <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-purple-500 border-2 border-slate-900" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              <span
                className={`flex items-center justify-center gap-2 relative z-10 transition-all ${isLoading ? "opacity-0" : "opacity-100"}`}
              >
                دخول اللوبي وإنشاء الروم
                <LogIn size={20} className="rotate-180" />
              </span>

              {/* Loading Spinner */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}

              {/* تأثير اللمعان */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"></div>
            </button>
          </form>
        </div>

        {/* تذييل بسيط */}
        <div className="bg-slate-950/30 p-4 text-center border-t border-slate-800">
          <p className="text-xs text-slate-600 font-mono">
            v1.1.0 • Vocabulary Challenge
          </p>
        </div>
      </div>
    </main>
  );
}
