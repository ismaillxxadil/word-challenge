"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
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
  User,
  LogIn,
  Trash2,
} from "lucide-react";

type Player = {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: number;
  socketId: string | null;
};

type Room = {
  code: string;
  players: Player[];
  createdAt: number;
  state: {
    phase: string;
    turnIndex: number;
    startedAt: number | null;
  };
};

const AVATAR_COLORS = [
  "bg-purple-500",
  "bg-blue-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-green-500",
];

export default function LobbyPage() {
  const params = useParams<{ room_id: string }>();
  const router = useRouter();

  const roomCode = String(params?.room_id || "").toUpperCase();

  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string>("");
  const [roomLinkCopied, setRoomLinkCopied] = useState(false);
  const [settings, setSettings] = useState({
    timePerTurn: 15,
    startingCards: 7,
    allowVar: true,
  });

  // Join room modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinName, setJoinName] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const socket: Socket = useMemo(() => {
    return io(process.env.NEXT_PUBLIC_API_URL as string, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: false,
    });
  }, []);

  const connectToRoom = useCallback(
    (playerId: string) => {
      socket.connect();

      const onConnect = () => {
        socket.emit("room:join", { roomCode, playerId });
      };

      const onSnapshot = (payload: { room: Room }) => {
        setRoom(payload.room);
        setError("");
      };

      const onUpdate = (payload: { room: Room }) => {
        setRoom(payload.room);
      };

      const onSettingsUpdate = (payload: { settings: typeof settings }) => {
        setSettings(payload.settings);
      };

      const onPlayerRemoved = () => {
        // Current player was removed from the room
        localStorage.removeItem("vc:name");
        localStorage.removeItem("vc:playerId");
        localStorage.removeItem("vc:roomCode");
        router.replace("/");
      };

      const onRoomError = (payload: { message: string }) => {
        setError(payload?.message || "خطأ في الغرفة");
      };

      socket.on("connect", onConnect);
      socket.on("room:snapshot", onSnapshot);
      socket.on("room:update", onUpdate);
      socket.on("room:settings-update", onSettingsUpdate);
      socket.on("room:player-removed", onPlayerRemoved);
      socket.on("room:error", onRoomError);

      return () => {
        socket.off("connect", onConnect);
        socket.off("room:snapshot", onSnapshot);
        socket.off("room:update", onUpdate);
        socket.off("room:settings-update", onSettingsUpdate);
        socket.off("room:player-removed", onPlayerRemoved);
        socket.off("room:error", onRoomError);
        socket.disconnect();
      };
    },
    [roomCode, socket, router],
  );

  useEffect(() => {
    const playerId = localStorage.getItem("vc:playerId");
    const name = localStorage.getItem("vc:name");

    // User doesn't have player data - show join modal
    if (!playerId || !name) {
      setShowJoinModal(true);
      return;
    }

    // User has player data - connect to room
    const cleanup = connectToRoom(playerId);
    return cleanup;
  }, [connectToRoom]);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = joinName.trim();
    if (!name) {
      setJoinError("يرجى إدخال اسمك");
      return;
    }

    setIsJoining(true);
    setJoinError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/room/${roomCode}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name }),
        },
      );

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "فشل الانضمام للغرفة");
      }

      const { playerId } = data;

      // Store player data
      localStorage.setItem("vc:name", name);
      localStorage.setItem("vc:playerId", playerId);
      localStorage.setItem("vc:roomCode", roomCode);

      // Close modal and connect to room
      setShowJoinModal(false);
      connectToRoom(playerId);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setJoinError(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = () => {
    const playerId = localStorage.getItem("vc:playerId");

    // Emit leave event to server
    if (socket && playerId && roomCode) {
      socket.emit("room:leave", { roomCode, playerId });
    }

    // Clean up local storage
    localStorage.removeItem("vc:name");
    localStorage.removeItem("vc:playerId");
    localStorage.removeItem("vc:roomCode");

    // Redirect to home
    router.replace("/");
  };

  const handleSettingsChange = (newSettings: typeof settings) => {
    setSettings(newSettings);
    // Emit settings change to other players if user is host
    if (isHost && socket) {
      socket.emit("room:change-settings", { roomCode, settings: newSettings });
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    if (!isHost || !socket) return;
    socket.emit("room:remove-player", { roomCode, playerId });
  };

  const handlePromoteToHost = (playerId: string) => {
    if (!isHost || !socket) return;
    socket.emit("room:promote-to-host", { roomCode, playerId });
  };

  // Join Modal UI
  if (showJoinModal) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#0f172a] relative overflow-hidden flex items-center justify-center p-4 font-sans text-slate-100"
      >
        {/* خلفية زخرفية */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 animate-pulse delay-700"></div>

        {/* Modal */}
        <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-purple-900/20 overflow-hidden p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white mb-2">دخول الغرفة</h2>
            <p className="text-slate-400 text-sm">
              غرفة رقم{" "}
              <span className="text-purple-400 font-mono font-bold">
                #{roomCode}
              </span>
            </p>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="joinName"
                className="text-sm font-semibold text-slate-300 block"
              >
                اسم المحارب
              </label>
              <div className="relative group">
                <div className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-500 group-focus-within:text-purple-400 transition-colors">
                  <User size={20} />
                </div>
                <input
                  id="joinName"
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="أدخل اسمك هنا..."
                  className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 pr-12 pl-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all placeholder:text-slate-600"
                  autoComplete="off"
                  disabled={isJoining}
                />
              </div>
              {joinError && (
                <p className="text-red-400 text-xs animate-pulse font-medium">
                  {joinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isJoining}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              <span
                className={`flex items-center justify-center gap-2 relative z-10 transition-all ${
                  isJoining ? "opacity-0" : "opacity-100"
                }`}
              >
                الانضمام للغرفة
                <LogIn size={20} className="rotate-180" />
              </span>

              {isJoining && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}

              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"></div>
            </button>
          </form>

          <button
            onClick={handleLeave}
            className="w-full mt-3 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
          >
            رجوع
          </button>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-8">
          <h1 className="font-bold text-lg mb-2 text-red-400">خطأ</h1>
          <p className="text-sm opacity-90 mb-4">{error}</p>
          <button
            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            onClick={handleLeave}
          >
            رجوع
          </button>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm opacity-80">جارٍ دخول اللوبي...</p>
        </div>
      </main>
    );
  }

  const currentPlayerId = localStorage.getItem("vc:playerId");
  const currentPlayer = room.players.find((p) => p.id === currentPlayerId);
  const isHost = currentPlayer?.isHost ?? false;
  const players = room.players;

  // دالة نسخ الرابط
  const handleCopyLink = () => {
    const url = `${window.location.origin}/${roomCode}`;
    navigator.clipboard.writeText(url);
    setRoomLinkCopied(true);
    setTimeout(() => setRoomLinkCopied(false), 2000);
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0f172a] relative overflow-hidden flex items-center justify-center p-4 font-sans text-slate-100 selection:bg-purple-500 selection:text-white"
    >
      {/* خلفية زخرفية */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>

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
                game.com/play...
              </span>
              {roomLinkCopied ? (
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
    </main>
  );
}
