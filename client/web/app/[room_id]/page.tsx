"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoomStore } from "@/store/useRoomStore";
import Model from "@/components/Model";
import LobbyPage from "./LobbyPage";
import GamePage from "./gamePage";

export default function RoomPage() {
  const params = useParams<{ room_id: string }>();
  const router = useRouter();

  const roomCode = String(params?.room_id || "").toUpperCase();

  const {
    room,
    error,
    showJoinModal,
    isConnectingToRoom,
    setShowJoinModal,
    setIsConnectingToRoom,
    connectToRoom,
    leaveRoom,
  } = useRoomStore();

  const [joinName, setJoinName] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Initialize room connection on mount
  useEffect(() => {
    const playerId = localStorage.getItem("vc:playerId");
    const name = localStorage.getItem("vc:name");

    // User doesn't have player data - show join modal
    if (!playerId || !name) {
      setShowJoinModal(true);
      return;
    }

    // User has player data - connect to room
    setIsConnectingToRoom(true);
    connectToRoom(roomCode, playerId);
  }, [roomCode, connectToRoom, setShowJoinModal, setIsConnectingToRoom]);

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
      setIsConnectingToRoom(true);
      connectToRoom(roomCode, playerId);
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
    leaveRoom(roomCode, playerId || "");

    // Clean up local storage
    localStorage.removeItem("vc:name");
    localStorage.removeItem("vc:playerId");
    localStorage.removeItem("vc:roomCode");

    // Redirect to home
    router.replace("/");
  };

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

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#0f172a] relative overflow-hidden flex items-center justify-center  font-sans text-slate-100 selection:bg-purple-500 selection:text-white"
    >
      {/* خلفية زخرفية */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>

      {showJoinModal || !room ? (
        <Model
          roomCode={roomCode}
          handleJoinRoom={handleJoinRoom}
          joinName={joinName}
          setJoinName={setJoinName}
          isJoining={isJoining}
          joinError={joinError}
          handleLeave={handleLeave}
          isConnectingToRoom={isConnectingToRoom}
        />
      ) : room.state.phase === "lobby" ? (
        <div className="animate-fadeIn">
          <LobbyPage room={room} handleLeave={handleLeave} />
        </div>
      ) : (
        <div className="animate-fadeIn">
          <GamePage room={room} handleLeave={handleLeave} />
        </div>
      )}
    </main>
  );
}
