"use client";

import React, { useState } from "react";
import {
  Users,
  Copy,
  Check,
  Play,
  Settings,
  Clock,
  Layers,
  Crown,
  ShieldAlert,
  Trash2,
  LogOut,
  Lock,
  ChevronDown,
  Share2,
  RotateCcw,
  X,
} from "lucide-react";
import { useRoomStore } from "@/store/useRoomStore";
import { Room } from "@/app/types";
import { HelpButton } from "@/components/HelpModal";
import { useSound } from "@/hooks/useSound";

interface LobbyPageProps {
  room: Room;
  handleLeave: () => void;
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({
  enabled,
  onToggle,
  color = "bg-purple-500",
  disabled = false,
}: {
  enabled: boolean;
  onToggle: () => void;
  color?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${
        enabled ? color : "bg-slate-700"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

// ─── Slider ──────────────────────────────────────────────────────────────────
function SettingSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  accentClass,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  accentClass: string;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-slate-400">{label}</span>
        <span className={`font-bold ${accentClass}`}>{value} {unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        disabled={disabled}
        className={`w-full h-1.5 bg-slate-800 rounded-full appearance-none ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        style={{ accentColor: "currentColor" }}
      />
    </div>
  );
}

// ─── Collapsible Section ──────────────────────────────────────────────────────
function SettingSection({
  icon,
  title,
  badge,
  badgeActive,
  children,
  defaultOpen = false,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  badgeActive?: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors"
      >
        <span className="text-slate-500">{icon}</span>
        <span className="flex-1 text-right text-sm font-semibold text-slate-200">{title}</span>
        {badge && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            badgeActive ? "text-green-400 bg-green-500/10" : "text-slate-500 bg-slate-800"
          }`}>
            {badge}
          </span>
        )}
        <ChevronDown size={15} className={`text-slate-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-800/50 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

type RoomSettings = {
  timePerTurn: number;
  startingCards: number;
  allowVar: boolean;
  allowLockCard: boolean;
  varDuration?: number;
  varExplanationDuration?: number;
  noRepeatWords?: boolean;
  maxRepeatCount?: number;
};

// ─── Settings Modal ───────────────────────────────────────────────────────────
function SettingsModal({
  isOpen,
  onClose,
  settings,
  isHost,
  onChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  settings: RoomSettings;
  isHost: boolean;
  onChange: (patch: Partial<RoomSettings>) => void;
}) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet / Modal */}
      <div className="relative z-10 w-full sm:max-w-md bg-slate-900 border border-slate-700/60 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Settings size={15} className="text-purple-400" />
            إعدادات المعركة
          </h2>
          {!isHost && (
            <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
              للمضيف فقط
            </span>
          )}
          {isHost && <div className="w-10" />}
        </div>

        {/* Content (scrollable) */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-2">

          {/* Time */}
          <SettingSection icon={<Clock size={15} />} title="وقت الجولة"
            badge={`${settings.timePerTurn}ث`} badgeActive defaultOpen>
            <SettingSlider
              label="مدة كل دور" value={settings.timePerTurn}
              min={10} max={60} step={5} unit="ثانية" accentClass="text-purple-400"
              disabled={!isHost} onChange={(v) => onChange({ timePerTurn: v })}
            />
          </SettingSection>

          {/* Cards */}
          <SettingSection icon={<Layers size={15} />} title="عدد البطاقات"
            badge={`${settings.startingCards}`} badgeActive>
            <SettingSlider
              label="بطاقات البداية" value={settings.startingCards}
              min={5} max={15} step={1} unit="بطاقة" accentClass="text-blue-400"
              disabled={!isHost} onChange={(v) => onChange({ startingCards: v })}
            />
          </SettingSection>

          {/* Lock card */}
          <SettingSection icon={<Lock size={15} />} title="بطاقة القفل"
            badge={settings.allowLockCard ? "مفعّل" : "معطّل"}
            badgeActive={settings.allowLockCard}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 flex-1">السماح باستخدام بطاقة القفل</span>
              <Toggle enabled={settings.allowLockCard}
                onToggle={() => onChange({ allowLockCard: !settings.allowLockCard })}
                color="bg-cyan-500" disabled={!isHost} />
            </div>
          </SettingSection>

          {/* VAR */}
          <SettingSection icon={<ShieldAlert size={15} />} title="نظام VAR"
            badge={settings.allowVar ? "مفعّل" : "معطّل"}
            badgeActive={settings.allowVar}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 flex-1">السماح بالطعن في الكلمات</span>
              <Toggle enabled={settings.allowVar}
                onToggle={() => onChange({ allowVar: !settings.allowVar })}
                color="bg-yellow-500" disabled={!isHost} />
            </div>
            {settings.allowVar && (
              <div className="space-y-3 pt-2 border-t border-slate-800/50">
                <SettingSlider label="مدة التبرير" value={settings.varExplanationDuration ?? 15}
                  min={10} max={60} step={5} unit="ثانية" accentClass="text-pink-400"
                  disabled={!isHost} onChange={(v) => onChange({ varExplanationDuration: v })} />
                <SettingSlider label="مدة التصويت" value={settings.varDuration ?? 15}
                  min={15} max={120} step={5} unit="ثانية" accentClass="text-yellow-400"
                  disabled={!isHost} onChange={(v) => onChange({ varDuration: v })} />
              </div>
            )}
          </SettingSection>

          {/* No-repeat words */}
          <SettingSection icon={<RotateCcw size={15} />} title="حظر تكرار الكلمات"
            badge={settings.noRepeatWords ? "مفعّل" : "معطّل"}
            badgeActive={settings.noRepeatWords}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 flex-1">لا يمكن إعادة لعب كلمة سُبق لعبها</span>
              <Toggle enabled={!!settings.noRepeatWords}
                onToggle={() => onChange({ noRepeatWords: !settings.noRepeatWords })}
                color="bg-orange-500" disabled={!isHost} />
            </div>
            {settings.noRepeatWords && (
              <div className="pt-2 border-t border-slate-800/50">
                <SettingSlider label="الحد الأقصى للتكرار"
                  value={settings.maxRepeatCount ?? 1}
                  min={1} max={5} step={1}
                  unit={(settings.maxRepeatCount ?? 1) === 1 ? "مرة" : "مرات"}
                  accentClass="text-orange-400"
                  disabled={!isHost} onChange={(v) => onChange({ maxRepeatCount: v })} />
              </div>
            )}
          </SettingSection>

        </div>

        {/* Bottom drag handle on mobile */}
        <div className="sm:hidden flex justify-center pt-1 pb-4">
          <div className="w-10 h-1 rounded-full bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LobbyPage({ room, handleLeave }: LobbyPageProps) {
  const { settings, setSettings, socket } = useRoomStore();
  const { play } = useSound();
  const [roomLinkCopied, setRoomLinkCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const currentPlayerId = localStorage.getItem("vc:playerId");
  const currentPlayer = room.players.find((p) => p.id === currentPlayerId);
  const isHost = currentPlayer?.isHost ?? false;
  const players = room.players;
  const canStart = isHost && players.length >= 2;

  const getAvatarUrl = (name: string, avatar?: string | null) => {
    if (avatar) return avatar;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || "Player")}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${room.code}`);
    setRoomLinkCopied(true);
    setTimeout(() => setRoomLinkCopied(false), 2500);
  };

  const change = (patch: Partial<typeof settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    if (isHost && socket) {
      socket.emit("room:change-settings", { roomCode: room.code, settings: next });
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    if (!isHost || !socket) return;
    socket.emit("room:remove-player", { roomCode: room.code, playerId });
  };

  const handlePromoteToHost = (playerId: string) => {
    if (!isHost || !socket) return;
    socket.emit("room:promote-to-host", { roomCode: room.code, playerId });
  };

  return (
    <>
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        isHost={isHost}
        onChange={change}
      />

      <div className="relative w-full max-w-3xl flex flex-col bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden">

        {/* ── Hero: Room Code + Actions ──────────────────────────────── */}
        <div className="relative px-4 sm:px-6 pt-7 pb-6 bg-gradient-to-b from-purple-900/30 to-transparent border-b border-slate-800/50">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(147,51,234,0.15),_transparent_70%)] pointer-events-none" />

          <div className="relative flex flex-col items-center gap-4">
            {/* Room code */}
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">الغرفة</p>
              <div className="text-4xl sm:text-5xl font-black text-white tracking-[0.15em] font-mono drop-shadow-lg">
                {room.code}
              </div>
            </div>

            {/* Action buttons row */}
            <div className="flex items-center gap-2 w-full max-w-xs">
              {/* Share button */}
              <button
                onClick={handleCopyLink}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border ${
                  roomLinkCopied
                    ? "border-green-500/50 bg-green-500/10 text-green-400"
                    : "border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400"
                }`}
              >
                {roomLinkCopied
                  ? <><Check size={15} /><span className="text-[10px] sm:text-sm"> تم النسخ ! </span></>
                  : <><Share2 size={15}  /><span className="text-[10px] sm:text-sm"> مشاركة الرابط</span></>}
              </button>

              {/* Settings button */}
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:border-slate-600 hover:text-white transition-all duration-200"
                title="إعدادات المعركة"
              >
                <Settings size={16} className={isHost ? "text-purple-400" : "text-slate-500"} />
                <span className="hidden xs:inline">الإعدادات</span>
              </button>

              {/* Help button */}
              <HelpButton />
            </div>
          </div>
        </div>

        {/* ── Players Grid ─────────────────────────────────────────── */}
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-purple-400" />
              <h2 className="text-sm font-bold text-slate-300">اللاعبون</h2>
              <span className="text-xs text-slate-500">({players.length}/4)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[12px] sm:text-xs font-bold rounded-full border ${
                canStart
                  ? "bg-green-500/10 text-green-400 border-green-500/30 animate-pulse"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${canStart ? "bg-green-400" : "bg-amber-400"}`} />
                {canStart ? "جاهز!" : "في انتظار..."}
              </span>
              <button
                onClick={handleLeave}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-red-400 rounded-lg border border-slate-700 hover:border-red-500/40 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={13} /> <span className="hidden sm:block">خروج</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
            {players.map((player) => (
              <div
                key={player.id}
                className={`group relative flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-300 ${
                  player.id === currentPlayerId
                    ? "border-purple-500/50 bg-purple-500/5 shadow-md shadow-purple-500/10"
                    : "border-slate-700/50 bg-slate-800/30 hover:border-slate-600"
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900">
                  <img src={getAvatarUrl(player.name, player.avatar)} alt={player.name} className="w-full h-full object-cover" />
                  <span className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${player.socketId ? "bg-green-400" : "bg-red-400"}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-xs sm:text-sm text-slate-100 truncate">{player.name}</p>
                    {player.isHost && <Crown size={12} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                    {player.id === currentPlayerId && (
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-400/10 px-1.5 rounded">أنت</span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">{player.socketId ? "متصل" : "غير متصل"}</p>
                </div>

                {/* Host actions — always visible */}
                {isHost && !player.isHost && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handlePromoteToHost(player.id)}
                      className="p-1.5 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors" title="ترقية">
                      <Crown size={14} />
                    </button>
                    <button onClick={() => handleRemovePlayer(player.id)}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="إزالة">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                {player.id === currentPlayerId && (
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-purple-500/30 pointer-events-none" />
                )}
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 4 - players.length }).map((_, i) => (
              <div key={`empty-${i}`}
                className="flex items-center justify-center gap-2 p-3 sm:p-3.5 rounded-2xl border-2 border-dashed border-slate-800 text-slate-600 min-h-[60px] sm:min-h-[68px]">
                <Users size={14} className="opacity-40" />
                <span className="text-[11px] sm:text-xs">ينتظر لاعباً...</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Start Button ────────────────────────────────────────── */}
        <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-3 border-t border-slate-800/50">
          <button
            disabled={!canStart}
            onClick={() => { if (canStart && socket) { socket.emit("room:start-game", { roomCode: room.code }); } }}
            className={`w-full relative group overflow-hidden rounded-2xl py-3.5 sm:py-4 text-white font-black text-base sm:text-lg transition-all duration-300 active:scale-[0.98] shadow-xl ${
              canStart
                ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] hover:bg-[position:right_center] hover:shadow-purple-500/40 cursor-pointer"
                : "bg-slate-800 cursor-not-allowed opacity-50"
            }`}
          >
            {canStart && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            )}
            <span className="relative flex items-center justify-center gap-2 sm:gap-3 z-10">
             ابدأ اللعبة
              <Play size={16} className="fill-white sm:hidden" />
              <Play size={18} className="fill-white hidden sm:block" />
            </span>
          </button>

          <p className="text-center text-xs text-slate-600 mt-3">
            {!isHost
              ? "المضيف فقط يستطيع بدء اللعبة"
              : players.length < 2
                ? "يحتاج لاعبان على الأقل للبدء"
                : "الجميع جاهزون – اضغط للانطلاق!"}  
          </p>
        </div>
      </div>
    </>
  );
}
