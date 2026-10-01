import React from "react";
import { Volume2, RotateCcw, Snail, Rabbit } from "lucide-react";

interface SpokenResponseCardProps {
  lastUserSpeech: string;
  lastAssistantSpeech: string;
  isSpeaking: boolean;
  speechRate: number;
  onReplay: () => void;
  onToggleSpeed: () => void;
  onStopSpeaking: () => void;
}

export const SpokenResponseCard: React.FC<SpokenResponseCardProps> = ({
  lastUserSpeech,
  lastAssistantSpeech,
  isSpeaking,
  speechRate,
  onReplay,
  onToggleSpeed,
  onStopSpeaking,
}) => {
  if (!lastAssistantSpeech && !lastUserSpeech) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-4 px-4">
      {/* What the user said */}
      {lastUserSpeech && (
        <div className="flex items-center justify-end mb-3">
          <div className="bg-amber-100/70 border border-amber-200/80 text-amber-950 px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-xs">
            <p className="text-xs text-amber-800/80 font-medium mb-0.5">நீங்கள் பேசியது:</p>
            <p className="text-base sm:text-lg font-medium leading-relaxed">
              "{lastUserSpeech}"
            </p>
          </div>
        </div>
      )}

      {/* Spoken Response from Thunai */}
      {lastAssistantSpeech && (
        <div className="relative bg-white border-2 border-amber-300/80 rounded-3xl p-5 sm:p-6 shadow-xl shadow-amber-900/5">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                து
              </div>
              <div>
                <span className="font-semibold text-slate-800 text-sm block">
                  துணை (குரல் பதில்)
                </span>
                <span className="text-xs text-amber-700 font-medium">
                  {isSpeaking ? "🔊 இப்போது பேசுகிறது..." : "✓ பேசிக் முடிந்தது"}
                </span>
              </div>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleSpeed}
                title={speechRate < 1 ? "இயல்பான வேகத்திற்கு மாற்றவும்" : "மெதுவாக பேச மாற்றவும்"}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  speechRate < 1
                    ? "bg-amber-500 text-white"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                {speechRate < 1 ? <Snail className="w-3.5 h-3.5" /> : <Rabbit className="w-3.5 h-3.5" />}
                <span>{speechRate < 1 ? "மெதுவாக (0.8x)" : "இயல்பு (1x)"}</span>
              </button>

              <button
                type="button"
                onClick={onReplay}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>மீண்டும் கேளுங்கள்</span>
              </button>
            </div>
          </div>

          {/* Large, comforting Tamil text */}
          <div className="py-1">
            <p className="text-xl sm:text-2xl font-medium text-slate-900 leading-relaxed tracking-normal font-sans">
              {lastAssistantSpeech}
            </p>
          </div>

          {/* Sound wave active visualizer if speaking */}
          {isSpeaking && (
            <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-4 bg-amber-500 rounded-full wave-bar-1" />
                <span className="w-1.5 h-7 bg-amber-600 rounded-full wave-bar-2" />
                <span className="w-1.5 h-9 bg-orange-500 rounded-full wave-bar-3" />
                <span className="w-1.5 h-6 bg-amber-600 rounded-full wave-bar-4" />
                <span className="w-1.5 h-4 bg-amber-500 rounded-full wave-bar-5" />
                <span className="text-xs text-amber-800 font-medium ml-2">
                  குரல் ஒலிக்கிறது...
                </span>
              </div>

              <button
                onClick={onStopSpeaking}
                className="text-xs text-stone-500 hover:text-stone-800 underline font-medium"
              >
                ஒலியை நிறுத்த
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
