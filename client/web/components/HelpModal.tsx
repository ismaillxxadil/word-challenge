"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  X, ChevronLeft, ChevronRight,
  Users, RefreshCw, Star, Lock, ShieldAlert,
  Share2, MousePointerClick, Repeat2, HelpCircle,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Step({ n, color, children }: { n: number; color: string; children: React.ReactNode }) {
  const ring: Record<string, string> = {
    purple: "bg-purple-500 text-white", blue: "bg-blue-500 text-white",
    yellow: "bg-yellow-500 text-slate-900", cyan: "bg-cyan-500 text-slate-900",
    red: "bg-red-500 text-white", orange: "bg-orange-500 text-white",
  };
  return (
    <div className="flex gap-3 items-start">
      <span className={`flex-shrink-0 w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center mt-0.5 ${ring[color]}`}>{n}</span>
      <div className="text-sm text-slate-300 leading-relaxed flex-1">{children}</div>
    </div>
  );
}

function Callout({ icon, text, color }: { icon: React.ReactNode; text: React.ReactNode; color: string }) {
  const c: Record<string, string> = {
    yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-300",
    cyan:   "bg-cyan-500/10   border-cyan-500/20   text-cyan-300",
    red:    "bg-red-500/10    border-red-500/20    text-red-300",
    orange: "bg-orange-500/10 border-orange-500/20 text-orange-300",
  };
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${c[color]}`}>
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div className="text-sm text-slate-300 leading-relaxed">{text}</div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
      <span className="flex-shrink-0">💡</span>
      <div className="text-xs text-slate-400 leading-relaxed">{children}</div>
    </div>
  );
}

function VarOutcome({ label, desc, win }: { label: string; desc: string; win: boolean }) {
  return (
    <div className={`p-3 rounded-xl border ${win ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
      <p className={`text-xs font-bold ${win ? "text-green-400" : "text-red-400"}`}>{label}</p>
      <p className="text-xs text-slate-400 mt-1">{desc}</p>
    </div>
  );
}

// ─── Slides ───────────────────────────────────────────────────────────────────
interface Slide { id: string; icon: React.ReactNode; accent: string; title: string; body: React.ReactNode; }

const slides: Slide[] = [
  {
    id: "room", icon: <Users size={20} />, accent: "purple",
    title: "إنشاء غرفة ومشاركة الأصدقاء",
    body: (
      <div className="space-y-3">
        <Step n={1} color="purple">أدخل اسمك واضغط <b>دخول اللوبي</b> من الصفحة الرئيسية.</Step>
        <Step n={2} color="purple">اضغط <b>إنشاء غرفة</b> أو <b>الانضمام</b> بكود الغرفة.</Step>
        <Step n={3} color="purple">
          اضغط <span className="inline-flex items-center gap-1 bg-slate-700 rounded px-1.5 py-0.5 text-xs text-purple-300"><Share2 size={11}/> مشاركة الرابط</span> لنسخ الرابط وإرساله لأصدقائك.
        </Step>
        <Step n={4} color="purple">بمجرد انضمام <b>لاعبَين على الأقل</b>، يمكن للمضيف الضغط على <b>ابدأ اللعبة</b>.</Step>
        <Tip>تستوعب الغرفة حتى 4 لاعبين. يمكن للمضيف ضبط الإعدادات قبل البدء.</Tip>
        <div className="mt-4 rounded-xl overflow-hidden border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] relative bg-slate-800/50 aspect-video">
          <video
            src="/videos/compressed/create-room.mp4"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    ),
  },
  {
    id: "cards", icon: <MousePointerClick size={20} />, accent: "blue",
    title: "كيف تلعب البطاقة؟",
    body: (
      <div className="space-y-3">
        <p className="text-sm text-slate-400 leading-relaxed">هدفك <b className="text-white">تغيير حرف واحد</b> في الكلمة المركزية لتكوين كلمة عربية صحيحة.</p>
        <Step n={1} color="blue"><b>انقر على بطاقة</b> من يدك — ستُرفع وتُحدَّد.</Step>
        <Step n={2} color="blue">
          كل بطاقة تحمل <b>وجهَين (أ / ب)</b> — الوجه الأخضر هو الحرف الفعّال. انقر زر الوجه لتبديله.
          <div className="flex gap-2 mt-2">
            <span className="w-7 h-7 rounded bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">أ</span>
            <span className="w-7 h-7 rounded bg-white/10 text-slate-300 text-xs font-bold flex items-center justify-center">ب</span>
          </div>
        </Step>
        <Step n={3} color="blue"><b>انقر الحرف</b> في الكلمة المركزية الذي تريد استبداله.</Step>
        <Step n={4} color="blue">✅ كلمة صحيحة → تُستهلك البطاقة وتنتقل النوبة.<br/>❌ كلمة خاطئة → ترجع البطاقة وتأخذ بطاقة عقوبة.</Step>
        <Tip>يمكنك سحب بطاقة من المجموعة وتخطي دورك إن لم تجد كلمة مناسبة.</Tip>
        <div className="mt-4 rounded-xl overflow-hidden border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] relative bg-slate-800/50 aspect-video">
          <video
            src="/videos/compressed/play-card.mp4"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    ),
  },
  {
    id: "star", icon: <Star size={20} />, accent: "yellow",
    title: "بطاقة النجمة ⭐",
    body: (
      <div className="space-y-3">
        <Callout color="yellow" icon={<Star size={22} className="text-yellow-400 fill-yellow-400"/>}
          text={<>بطاقة خاصة تتيح لك اختيار <b className="text-yellow-300">أي حرف عربي</b> بدلاً من حرف محدد.</>} />
        <Step n={1} color="yellow">اختر بطاقة النجمة ⭐ من يدك.</Step>
        <Step n={2} color="yellow">انقر الحرف الذي تريد استبداله في الكلمة.</Step>
        <Step n={3} color="yellow">تظهر <b>لوحة اختيار الحرف</b> — اختر الحرف الذي يكوّن كلمة صحيحة.</Step>
        <Tip>هذه أقوى بطاقة في اللعبة — استخدمها بذكاء في اللحظة الحاسمة!</Tip>
        <div className="mt-4 rounded-xl overflow-hidden border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)] relative bg-slate-800/50 aspect-video">
          <video
            src="/videos/compressed/star-card.mp4"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    ),
  },
  {
    id: "lock", icon: <Lock size={20} />, accent: "cyan",
    title: "بطاقة القفل 🔒",
    body: (
      <div className="space-y-3">
        <Callout color="cyan" icon={<Lock size={22} className="text-cyan-400"/>}
          text={<>تمنحك <b className="text-cyan-300">تثبيت حرف</b> في الكلمة — لا يستطيع أحد تغييره بعدها.</>} />
        <Step n={1} color="cyan">اختر بطاقة القفل 🔒 من يدك.</Step>
        <Step n={2} color="cyan">انقر الحرف الذي تريد تثبيته في الكلمة المركزية.</Step>
        <Step n={3} color="cyan">يظهر 🔒 على الحرف — محميّ حتى اللاعب المالك فقط يستطيع تغييره.</Step>
        <Step n={4} color="cyan">يُفتح القفل بعد عدد جولات يساوي عدد اللاعبين.</Step>
        <Tip>يمكن تعطيل هذه البطاقة من إعدادات الغرفة قبل البدء.</Tip>
        <div className="mt-4 rounded-xl overflow-hidden border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] relative bg-slate-800/50 aspect-video">
          <video
            src="/videos/compressed/lock-card.mp4"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    ),
  },
  {
    id: "var", icon: <ShieldAlert size={20} />, accent: "red",
    title: "نظام VAR — الطعن في الكلمة ⚖️",
    body: (
      <div className="space-y-3">
        <Callout color="red" icon={<ShieldAlert size={22} className="text-red-400"/>}
          text={<>إذا اعتقدت أن كلمة لاعب آخر <b className="text-red-300">خاطئة</b>، فعّل VAR للطعن فيها.</>} />
        <Step n={1} color="red">اضغط زر <b>VAR</b> بعد لعب الخصم مباشرةً.</Step>
        <Step n={2} color="red"><b>مرحلة التبرير:</b> اللاعب المتهم يشرح معنى الكلمة في وقت محدد.</Step>
        <Step n={3} color="red"><b>مرحلة التصويت:</b> يصوّت بقية اللاعبين — قبول أو رفض.</Step>
        <div className="grid grid-cols-2 gap-2">
          <VarOutcome win label="✅ قبول" desc="الكلمة صحيحة — اللعب يكمل." />
          <VarOutcome win={false} label="❌ رفض" desc="الكلمة باطلة — يأخذ بطاقات عقوبة." />
        </div>
        <Tip>لكل لاعب استخدام VAR مرة واحدة فقط بالمباراة. يمكن تعطيله من الإعدادات.</Tip>
        <div className="mt-4 rounded-xl overflow-hidden border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] relative bg-slate-800/50 aspect-video">
          <video
            src="/videos/compressed/var.mp4"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    ),
  },
  {
    id: "repeat", icon: <Repeat2 size={20} />, accent: "orange",
    title: "قاعدة حظر التكرار 🔁",
    body: (
      <div className="space-y-3">
        <Callout color="orange" icon={<RefreshCw size={22} className="text-orange-400"/>}
          text={<>عند التفعيل، <b className="text-orange-300">لا يمكن إعادة لعب كلمة سبق لعبها</b> في نفس المباراة.</>} />
        <Step n={1} color="orange">المضيف يفعّل القاعدة من <b>إعدادات الغرفة</b> قبل البدء.</Step>
        <Step n={2} color="orange">يمكن ضبط <b>الحد الأقصى للتكرار</b> (مثلاً مرة أو مرتين).</Step>
        <Step n={3} color="orange">محاولة لعب كلمة مكررة → ترجع البطاقة مع رسالة تحذير.</Step>
        <Tip>هذه القاعدة تضيف تحدياً إضافياً وتمنع حيل التكرار — جرّبها!</Tip>
      </div>
    ),
  },
];

const accentMap: Record<string, string> = {
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  blue:   "bg-blue-500/15   text-blue-400   border-blue-500/30",
  yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  cyan:   "bg-cyan-500/15   text-cyan-400   border-cyan-500/30",
  red:    "bg-red-500/15    text-red-400    border-red-500/30",
  orange: "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

// ─── Modal ────────────────────────────────────────────────────────────────────
export function HelpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const slide = slides[idx];
  const isFirst = idx === 0;
  const isLast  = idx === slides.length - 1;

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [idx]);

  if (!isOpen) return null;

  const modal = (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet / Modal */}
      <div className="relative z-10 w-full sm:max-w-lg bg-slate-900 border border-slate-700/50 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90dvh] flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 flex-shrink-0">
          <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
            <X size={17} />
          </button>
          <div className="flex items-center gap-2">
            <HelpCircle size={15} className="text-purple-400" />
            <span className="text-sm font-bold text-slate-200">كيف تلعب؟</span>
          </div>
          {/* Dots */}
          <div className="flex gap-1.5 items-center">
            {slides.map((s, i) => (
              <button key={s.id} onClick={() => setIdx(i)}
                className={`rounded-full transition-all duration-300 ${i === idx ? "w-5 h-2 bg-purple-400" : "w-2 h-2 bg-slate-700 hover:bg-slate-500"}`}
              />
            ))}
          </div>
        </div>

        {/* ── Tab strip ── */}
        <div className="flex gap-1 px-3 pt-3 overflow-x-auto scrollbar-none flex-shrink-0" style={{ scrollbarWidth: "none" }}>
          {slides.map((s, i) => (
            <button key={s.id} onClick={() => setIdx(i)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0 border ${
                i === idx
                  ? accentMap[s.accent]
                  : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800"
              }`}
            >
              {s.icon}
              <span>{s.title.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
          <div className={`flex items-center gap-3 mb-4 p-3 rounded-xl border ${accentMap[slide.accent]}`}>
            {slide.icon}
            <h3 className="text-sm font-black text-white leading-tight">{slide.title}</h3>
          </div>
          {slide.body}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 flex-shrink-0">
          {/* Next / Done */}
          <button onClick={() => isLast ? onClose() : setIdx((i) => i + 1)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isLast ? "bg-purple-600 hover:bg-purple-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}>
            {isLast ? "فهمت! 🎉" : "التالي"}{!isLast && <ChevronLeft size={15} />}
          </button>

          <span className="text-[11px] text-slate-600">{idx + 1} / {slides.length}</span>

          {/* Prev */}
          <button onClick={() => setIdx((i) => i - 1)} disabled={isFirst}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isFirst ? "opacity-30 cursor-not-allowed text-slate-500" : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}>
            <ChevronRight size={15} />السابق
          </button>
        </div>

        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pb-3 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-800" />
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}

// ─── Self-contained trigger button ───────────────────────────────────────────
export function HelpButton({ variant = "icon-text" }: { variant?: "icon-only" | "icon-text" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <HelpModal isOpen={open} onClose={() => setOpen(false)} />
      <button type="button" onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:border-slate-600 hover:text-white transition-all duration-200"
        title="كيف تلعب؟"
      >
        <HelpCircle size={16} className="text-purple-400" />
        {variant === "icon-text" && <span className="hidden sm:block">مساعدة</span>}
      </button>
    </>
  );
}
