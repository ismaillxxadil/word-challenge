import { LogIn, User, Loader } from "lucide-react";

export default function Model({
  roomCode,
  handleJoinRoom,
  joinName,
  setJoinName,
  isJoining,
  joinError,
  handleLeave,
  isConnectingToRoom,
}: {
  roomCode: string;
  handleJoinRoom: (e: React.FormEvent<HTMLFormElement>) => void;
  joinName: string;
  setJoinName: (name: string) => void;
  isJoining: boolean;
  joinError: string;
  handleLeave: () => void;
  isConnectingToRoom?: boolean;
}) {
  return (
    <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-purple-900/20 overflow-hidden p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-white mb-2">
          {isConnectingToRoom ? "جارٍ الاتصال..." : "دخول الغرفة"}
        </h2>
        <p className="text-slate-400 text-sm">
          غرفة رقم{" "}
          <span className="text-purple-400 font-mono font-bold">
            #{roomCode}
          </span>
        </p>
      </div>

      {isConnectingToRoom ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
            <Loader
              size={24}
              className="absolute inset-0 m-auto text-purple-400 animate-pulse"
            />
          </div>
          <div className="text-center space-y-1">
            <p className="text-slate-300 font-medium">جارٍ دخول اللوبي...</p>
            <p className="text-xs text-slate-500">يرجى الانتظار</p>
          </div>
        </div>
      ) : (
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
      )}

      <button
        onClick={handleLeave}
        className="w-full mt-3 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
      >
        رجوع
      </button>
    </div>
  );
}
