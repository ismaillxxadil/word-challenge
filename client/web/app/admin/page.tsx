"use client";

import React, { useState } from "react";
import { loginAdmin } from "../actions/auth";
import { useRouter } from "next/navigation";
import { Lock, LogIn, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginAdmin(email, password);
      if (res.success) {
        router.push("/admin/logs");
      } else {
        setError(res.error || "خطأ في تسجيل الدخول");
      }
    } catch {
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" dir="rtl">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-md bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/50 rounded-3xl shadow-2xl p-8 sm:p-10 overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-inner mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Lock className="w-8 h-8 text-indigo-400 relative z-10" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">لوحة الإدارة</h1>
          <p className="text-zinc-500 text-sm">أدخل كلمة المرور للوصول إلى السجلات</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 mr-1">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-zinc-900 border border-zinc-700/50 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono tracking-wide"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 mr-1">كلمة المرور</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-900 border border-zinc-700/50 text-white rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono tracking-widest text-center"
                  required
                />
              </div>
            </div>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20 mt-2"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password || !email}
            className="w-full relative overflow-hidden group bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg rounded-xl py-3.5 px-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-[0.98]"
          >
            <div className="flex items-center justify-center gap-2 relative z-10">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} className="rotate-180" />
                  دخول
                </>
              )}
            </div>
            {/* Glossy sheen effect */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-white/10" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
