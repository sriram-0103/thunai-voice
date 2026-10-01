import React from "react";
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";

interface VoiceSphereProps {
  status: "idle" | "listening" | "thinking" | "speaking";
  onToggleMic: () => void;
  isListening: boolean;
}

export const VoiceSphere: React.FC<VoiceSphereProps> = ({
  status,
  onToggleMic,
  isListening,
}) => {
  return (
    <div className="relative flex flex-col items-center justify-center my-6">
      {/* Outer ambient glow rings */}
      <div
        className={`absolute rounded-full transition-all duration-700 pointer-events-none ${
          status === "listening"
            ? "w-72 h-72 sm:w-84 sm:h-84 bg-rose-500/20 animate-ping"
            : status === "speaking"
            ? "w-72 h-72 sm:w-84 sm:h-84 bg-amber-500/25 animate-pulse-slow"
            : status === "thinking"
            ? "w-64 h-64 bg-amber-400/20 animate-spin"
            : "w-56 h-56 bg-amber-200/30"
        }`}
      />

      {/* Second ripple ring */}
      <div
        className={`absolute rounded-full transition-all duration-500 pointer-events-none ${
          status === "listening"
            ? "w-60 h-60 sm:w-72 sm:h-72 bg-gradient-to-tr from-rose-500/30 to-amber-500/30 animate-pulse"
            : status === "speaking"
            ? "w-60 h-60 sm:w-72 sm:h-72 bg-gradient-to-tr from-amber-500/30 to-orange-400/30 animate-pulse-slow"
            : "w-48 h-48 bg-amber-100/40"
        }`}
      />

      {/* Main Interactive Button */}
      <button
        onClick={onToggleMic}
        type="button"
        aria-label={
          status === "listening"
            ? "பேசுவதை நிறுத்துங்கள் (Stop listening)"
            : "பேசத் தொடங்குங்கள் (Tap to speak)"
        }
        className={`relative z-10 w-40 h-40 sm:w-48 sm:h-48 rounded-full shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-amber-400/50 ${
          status === "listening"
            ? "bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-rose-500/40 ring-4 ring-rose-300 scale-105"
            : status === "speaking"
            ? "bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white shadow-amber-600/40 ring-4 ring-amber-300 scale-105"
            : status === "thinking"
            ? "bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-amber-500/30"
            : "bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-amber-600/35 hover:scale-105"
        }`}
      >
        {status === "thinking" ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-14 h-14 sm:w-16 sm:h-16 animate-spin text-white mb-2" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-100">
              யோசிக்கிறது...
            </span>
          </div>
        ) : status === "listening" ? (
          <div className="flex flex-col items-center">
            <Mic className="w-14 h-14 sm:w-16 sm:h-16 text-white mb-2 animate-bounce" />
            <div className="flex items-center gap-1 my-1">
              <span className="w-1.5 h-6 bg-white rounded-full wave-bar-1 inline-block" />
              <span className="w-1.5 h-8 bg-white rounded-full wave-bar-2 inline-block" />
              <span className="w-1.5 h-10 bg-white rounded-full wave-bar-3 inline-block" />
              <span className="w-1.5 h-8 bg-white rounded-full wave-bar-4 inline-block" />
              <span className="w-1.5 h-6 bg-white rounded-full wave-bar-5 inline-block" />
            </div>
            <span className="text-xs font-bold tracking-wide text-white">
              நிறுத்த தொடவும்
            </span>
          </div>
        ) : status === "speaking" ? (
          <div className="flex flex-col items-center">
            <Volume2 className="w-14 h-14 sm:w-16 sm:h-16 text-white mb-2 animate-pulse" />
            <div className="flex items-center gap-1 my-1">
              <span className="w-1.5 h-5 bg-amber-100 rounded-full wave-bar-3 inline-block" />
              <span className="w-1.5 h-9 bg-amber-100 rounded-full wave-bar-2 inline-block" />
              <span className="w-1.5 h-11 bg-white rounded-full wave-bar-1 inline-block" />
              <span className="w-1.5 h-7 bg-amber-100 rounded-full wave-bar-4 inline-block" />
              <span className="w-1.5 h-5 bg-amber-100 rounded-full wave-bar-5 inline-block" />
            </div>
            <span className="text-xs font-bold tracking-wide text-amber-100">
              பேசுகிறது...
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Mic className="w-14 h-14 sm:w-16 sm:h-16 text-white mb-2" />
            <span className="text-sm sm:text-base font-bold text-white tracking-wide">
              பேச தொடங்குங்கள்
            </span>
            <span className="text-xs text-amber-100/90 font-medium mt-0.5">
              (இங்கே அழுத்தவும்)
            </span>
          </div>
        )}
      </button>

      {/* Status Badge */}
      <div className="mt-5 text-center">
        {status === "listening" && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-base font-semibold shadow-sm animate-pulse">
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping inline-block" />
            <span>உங்கள் குரலைக் கேட்கிறது... இப்போது பேசுங்கள்</span>
          </div>
        )}
        {status === "thinking" && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-base font-semibold shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping inline-block" />
            <span>துணை புரிந்துகொள்கிறது...</span>
          </div>
        )}
        {status === "speaking" && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-base font-semibold shadow-sm">
            <Volume2 className="w-4 h-4 text-amber-700 animate-spin" />
            <span>துணை பேசுகிறது... கவனியுங்கள்</span>
          </div>
        )}
        {status === "idle" && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>பேசத் தயார் • பொத்தானை அழுத்திப் பேசுங்கள்</span>
          </div>
        )}
      </div>
    </div>
  );
};
