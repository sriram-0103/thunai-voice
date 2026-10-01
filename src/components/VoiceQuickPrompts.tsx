import React from "react";
import { MessageSquare, Sparkles } from "lucide-react";

interface VoiceQuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

const QUICK_PROMPTS = [
  {
    category: "தொடங்க (To Start)",
    text: "நான் கர்ப்பமாக இருக்கிறேன். அரசாங்கத்திடம் இருந்து ஏதாவது உதவி கிடைக்குமா?",
    label: "நான் கர்ப்பமாக இருக்கிறேன், உதவி கிடைக்குமா?",
  },
  {
    category: "பதில் (Answer)",
    text: "இது என் முதல் குழந்தை.",
    label: "இது என் முதல் குழந்தை",
  },
  {
    category: "பதில் (Answer)",
    text: "இரண்டாவது குழந்தை, பெண் குழந்தை.",
    label: "இரண்டாவது குழந்தை பெண் குழந்தை",
  },
  {
    category: "ஆவணங்கள் (Documents)",
    text: "விண்ணப்பிக்க என்னென்ன ஆவணங்கள் தேவைப்படும்?",
    label: "என்னென்ன ஆவணங்கள் தேவை?",
  },
  {
    category: "இடம் (Office)",
    text: "இந்த உதவித்தொகைக்கு எங்கு சென்று விண்ணப்பிக்க வேண்டும்?",
    label: "எங்கு சென்று விண்ணப்பிக்க வேண்டும்?",
  },
  {
    category: "விளக்கம் (Clarity)",
    text: "எனக்கு புரியவில்லை.",
    label: "எனக்கு புரியவில்லை",
  },
  {
    category: "மறுமுறை (Repeat)",
    text: "மீண்டும் சொல்லுங்கள்.",
    label: "மீண்டும் சொல்லுங்கள்",
  },
  {
    category: "தெரியவில்லை (Unsure)",
    text: "எனக்குத் தெரியாது.",
    label: "எனக்குத் தெரியாது",
  },
];

export const VoiceQuickPrompts: React.FC<VoiceQuickPromptsProps> = ({
  onSelectPrompt,
  disabled,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 mt-6">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>குரல் மூலம் கேட்க வேண்டியவை (தட்டிப் பேசலாம்):</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(item.text)}
            className="text-left px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100/90 text-amber-950 border border-amber-200/80 text-xs sm:text-sm font-medium transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <span className="font-semibold text-amber-700 mr-1">🎙️</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
