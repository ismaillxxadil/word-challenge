import React from "react";

const AVATAR_OPTIONS = [
  // رجال (ستايل عربي – لحى خفيفة / شعر طبيعي)
  "https://api.dicebear.com/7.x/avataaars/svg?seed=flex-089",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed-202",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Yusuf-303",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Khalid-404",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Ibrahim-505",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zayd-606",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Hassan-707",

  // نساء (محجبات + مظهر محتشم)
  "https://api.dicebear.com/7.x/avataaars/svg?seed=flex-008",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha-222",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariam-333",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zahra-444",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Layla-555",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Huda-666",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Noor-777",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Salma-888",
] as const;


interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelect: (avatar: string) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onSelect,
}) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-300 block">اختر صورتك</p>
      <div className="grid grid-cols-5 gap-2">
        {AVATAR_OPTIONS.map((url) => {
          const isActive = selectedAvatar === url;
          return (
            <button
              key={url}
              type="button"
              onClick={() => onSelect(url)}
              className={[
                "relative rounded-xl p-0.5 border transition-all aspect-square",
                "bg-slate-900/50 hover:bg-slate-800",
                isActive
                  ? "border-purple-400 ring-2 ring-purple-500/40 scale-105 z-10"
                  : "border-slate-700 hover:scale-105",
              ].join(" ")}
            >
              <img
                src={url}
                alt="avatar"
                className="w-full h-full rounded-lg object-cover bg-slate-800"
              />
              {isActive && (
                <span className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-purple-500 border-2 border-slate-900" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
