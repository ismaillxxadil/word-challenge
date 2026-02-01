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
} from "lucide-react";
import { useRoomStore } from "@/store/useRoomStore";
import { Room } from "@/app/types";

const AVATAR_COLORS = [
  "bg-purple-500",
  "bg-blue-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-green-500",
];

interface LobbyPageProps {
  room: Room;
  handleLeave: () => void;
}

export default function LobbyPage({ room, handleLeave }: LobbyPageProps) {
  const { settings, setSettings, socket } = useRoomStore();
  const [roomLinkCopiedLocal, setRoomLinkCopiedLocal] = useState(false);

  const currentPlayerId = localStorage.getItem("vc:playerId");
  const currentPlayer = room.players.find((p) => p.id === currentPlayerId);
  const isHost = currentPlayer?.isHost ?? false;
  const players = room.players;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/${room.code}`;
    navigator.clipboard.writeText(url);
    setRoomLinkCopiedLocal(true);
    setTimeout(() => setRoomLinkCopiedLocal(false), 2000);
  };

  const handleSettingsChange = (newSettings: typeof settings) => {
    setSettings(newSettings);
    if (isHost && socket) {
      socket.emit("room:change-settings", {
        roomCode: room.code,
        settings: newSettings,
      });
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
      {/* زر المغادرة - أعلى يمين */}
      <button
        onClick={handleLeave}
        className="absolute top-6 left-6 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-slate-100 rounded-lg border border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 transition-all active:scale-[0.95] z-10"
      >
        مغادرة
      </button>

      <div className="relative w-full max-w-4xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* === القسم الأيمن: إعدادات الغرفة ومعلومات الرابط === */}
        <aside className="w-full md:w-1/3 bg-slate-950/50 border-l border-slate-800/50 p-6 flex flex-col gap-6">
          {/* عنوان الغرفة */}
          <div className="text-center">
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              غرفة رقم
            </h2>
            <div className="text-3xl font-black text-white tracking-widest font-mono">
              #{room.code}
            </div>
          </div>

          {/* زر نسخ الرابط */}
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-xs text-slate-500 mb-2 font-medium">
              دعوة الأصدقاء
            </p>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-2.5 rounded-lg transition-all group"
            >
              <span className="text-sm truncate max-w-[150px] opacity-70">
                {`${window.location.origin}/${room.code}`}
              </span>
              {roomLinkCopiedLocal ? (
                <Check size={18} className="text-green-400" />
              ) : (
                <Copy
                  size={18}
                  className="text-purple-400 group-hover:scale-110 transition-transform"
                />
              )}
            </button>
          </div>

          {/* لوحة الإعدادات */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2 text-slate-200 border-b border-slate-800 pb-2">
              <Settings size={18} className="text-purple-400" />
              <h3 className="font-bold text-sm">إعدادات المعركة</h3>
            </div>

            {/* إعداد الوقت */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> وقت الجولة
                </span>
                <span className="text-purple-300">
                  {settings.timePerTurn} ثانية
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={settings.timePerTurn}
                onChange={(e) =>
                  handleSettingsChange({
                    ...settings,
                    timePerTurn: parseInt(e.target.value),
                  })
                }
                disabled={!isHost}
                className={`w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* إعداد عدد البطاقات */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Layers size={12} /> عدد البطاقات
                </span>
                <span className="text-blue-300">
                  {settings.startingCards} بطاقات
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="15"
                step="1"
                value={settings.startingCards}
                onChange={(e) =>
                  handleSettingsChange({
                    ...settings,
                    startingCards: parseInt(e.target.value),
                  })
                }
                disabled={!isHost}
                className={`w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 ${!isHost ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* إعداد الـ VAR */}
            <div
              className={`flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800 ${!isHost ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert
                  size={16}
                  className={
                    settings.allowVar ? "text-yellow-400" : "text-slate-600"
                  }
                />
                <span className="text-xs font-medium text-slate-300">
                  تفعيل نظام VAR
                </span>
              </div>
              <div
                onClick={() => {
                  if (isHost) {
                    handleSettingsChange({
                      ...settings,
                      allowVar: !settings.allowVar,
                    });
                  }
                }}
                className={`w-10 h-5 rounded-full relative transition-colors ${
                  settings.allowVar ? "bg-green-500/20" : "bg-slate-700"
                } ${isHost ? "cursor-pointer" : "cursor-not-allowed"}`}
              >
                <div
                  className={`absolute top-1 w-3 h-3 rounded-full transition-all duration-300 ${settings.allowVar ? "left-1 bg-green-400" : "left-6 bg-slate-400"}`}
                ></div>
              </div>
            </div>
          </div>
        </aside>

        {/* === القسم الأيسر: قائمة اللاعبين وزر البدء === */}
        <section className="flex-1 p-6 md:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <span className="p-2 bg-slate-800 rounded-lg text-purple-400">
                <Users size={24} />
              </span>
              المحاربون
              <span className="text-sm font-normal text-slate-500 mt-1 mr-2">
                ({players.length}/4)
              </span>
            </h1>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full border animate-pulse ${
                players.length === 4
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                  : "bg-green-500/10 text-green-400 border-green-500/20"
              }`}
            >
              {players.length === 4 ? "جاهز للبدء!" : "في الانتظار..."}
            </span>
          </div>

          {/* شبكة اللاعبين */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 content-start">
            {players.map((player, idx) => (
              <div
                key={player.id}
                className={`group relative bg-slate-800/40 border rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 ${
                  player.socketId
                    ? "border-slate-700/50 hover:bg-slate-800/90 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/40"
                    : "border-slate-700/20 opacity-60"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                >
                  {player.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-100">{player.name}</h3>
                    {player.isHost && (
                      <Crown
                        size={14}
                        className="text-yellow-400 fill-yellow-400"
                      />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {player.socketId ? "🟢 متصل" : "🔴 غير متصل"}
                  </p>
                </div>
                {isHost && !player.isHost && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handlePromoteToHost(player.id)}
                      className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors"
                      title="ترقية إلى مضيف"
                    >
                      <Crown size={16} />
                    </button>
                    <button
                      onClick={() => handleRemovePlayer(player.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="إزالة اللاعب"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                {/* تأثير زخرفي */}
                {player.socketId && (
                  <div className="absolute right-0 top-1 w-1 h-[calc(100%-8px)] bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-2xl"></div>
                )}
              </div>
            ))}

            {/* مكان فارغ (Slot) */}
            {Array.from({ length: 4 - players.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="border-2 border-dashed border-slate-800 rounded-2xl p-4 flex items-center justify-center gap-4 text-slate-600 min-h-[88px]"
              >
                <span className="text-sm font-medium">في انتظار لاعب...</span>
              </div>
            ))}
          </div>

          {/* زر بدء اللعب */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <button
              disabled={!isHost || players.length < 2}
              className={`w-full group relative text-white font-bold py-4 rounded-xl shadow-xl transition-all duration-300 active:scale-[0.98] ${
                isHost && players.length >= 2
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:shadow-2xl hover:shadow-purple-500/40 cursor-pointer"
                  : "bg-slate-700 cursor-not-allowed opacity-50"
              }`}
              onClick={() => {
                if (isHost && socket) {
                  socket.emit("room:start-game", { roomCode: room.code });
                }
              }}
            >
              <span className="flex items-center justify-center gap-3 relative z-10 text-lg">
                بدء المعركة الآن
                <Play size={24} className="fill-white" />
              </span>
            </button>
            <p className="text-center text-xs text-slate-500 mt-4">
              {!isHost
                ? "المضيف فقط يستطيع بدء اللعبة"
                : players.length < 2
                  ? "ينتظر انضمام لاعب واحد على الأقل"
                  : "اضغط لبدء المعركة"}
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
