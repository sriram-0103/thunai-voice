/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { VoiceSphere } from "./components/VoiceSphere.tsx";
import { SpokenResponseCard } from "./components/SpokenResponseCard.tsx";
import { VoiceQuickPrompts } from "./components/VoiceQuickPrompts.tsx";
import { SchemePocketGuide } from "./components/SchemePocketGuide.tsx";
import { speakTamil, stopSpeaking, isCurrentlySpeaking } from "./services/audioService.ts";
import { startListening, stopAnyActiveListening } from "./services/sttService.ts";
import { Volume2, VolumeX, RotateCcw, Send, HelpCircle, HeartHandshake } from "lucide-react";

interface MessageItem {
  role: "user" | "model";
  text: string;
}

const INITIAL_GREETING = "வணக்கம். நான் துணை. அரசு உதவி பெறுவதற்கு உங்களுக்கு நான் உதவுகிறேன். உங்களுக்கு என்ன உதவி தேவை என்று சொல்லுங்கள்.";

export default function App() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [lastUserSpeech, setLastUserSpeech] = useState<string>("");
  const [lastAssistantSpeech, setLastAssistantSpeech] = useState<string>(INITIAL_GREETING);
  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeListenerRef = useRef<{ stop: () => void } | null>(null);

  // Play the assistant response aloud
  const playAssistantSpeech = useCallback(
    async (text: string, rate: number = speechRate) => {
      if (isMuted) return;

      setStatus("speaking");
      await speakTamil(text, {
        speechRate: rate,
        callbacks: {
          onStart: () => setStatus("speaking"),
          onEnd: () => setStatus("idle"),
          onError: () => setStatus("idle"),
        },
      });
    },
    [isMuted, speechRate]
  );

  // Handle user speech submission to the AI
  const handleUserSpeech = useCallback(
    async (spokenText: string) => {
      if (!spokenText.trim()) return;

      stopSpeaking();
      stopAnyActiveListening();
      setErrorMessage(null);
      setLastUserSpeech(spokenText);
      setStatus("thinking");

      // Append to local message history
      const updatedMessages: MessageItem[] = [
        ...messages,
        { role: "user", text: spokenText },
      ];
      setMessages(updatedMessages);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages,
            userMessage: spokenText,
          }),
        });

        if (!response.ok) {
          throw new Error("அரசு சேவையகத்தை அணுக முடியவில்லை.");
        }

        const data = await response.json();
        const reply = data.replyText || "மன்னிக்கவும், மீண்டும் ஒருமுறை சொல்லுங்கள்.";

        setLastAssistantSpeech(reply);
        setMessages((prev) => [...prev, { role: "model", text: reply }]);

        // Automatically speak response aloud to the user
        await playAssistantSpeech(reply, speechRate);
      } catch (err: any) {
        console.error("Chat API error:", err);
        const errorReply = "மன்னிக்கவும், இப்போது தொடர்பு கொள்ள முடியவில்லை. தயவுசெய்து மீண்டும் பேசுங்கள்.";
        setLastAssistantSpeech(errorReply);
        setErrorMessage("இணைப்பில் சிறு தாமதம் ஏற்பட்டுள்ளது.");
        await playAssistantSpeech(errorReply, speechRate);
      }
    },
    [messages, speechRate, playAssistantSpeech]
  );

  // Toggle Microphone Listening
  const handleToggleMic = useCallback(() => {
    if (status === "listening") {
      // Stop listening
      activeListenerRef.current?.stop();
      activeListenerRef.current = null;
      setStatus("idle");
      return;
    }

    // Stop speaking if currently speaking
    stopSpeaking();
    setErrorMessage(null);

    const listener = startListening({
      onStart: () => {
        setStatus("listening");
      },
      onInterim: (interimText) => {
        setLastUserSpeech(interimText);
      },
      onFinal: (finalText) => {
        setStatus("thinking");
        handleUserSpeech(finalText);
      },
      onError: (err) => {
        setStatus("idle");
        setErrorMessage(err);
      },
      onEnd: () => {
        setStatus((prev) => (prev === "listening" ? "idle" : prev));
      },
    });

    activeListenerRef.current = listener;
  }, [status, handleUserSpeech]);

  // Replay the current assistant response
  const handleReplay = useCallback(() => {
    if (lastAssistantSpeech) {
      playAssistantSpeech(lastAssistantSpeech, speechRate);
    }
  }, [lastAssistantSpeech, speechRate, playAssistantSpeech]);

  // Toggle speech speed
  const handleToggleSpeed = useCallback(() => {
    const newRate = speechRate < 1 ? 1.0 : 0.8;
    setSpeechRate(newRate);
    if (lastAssistantSpeech) {
      playAssistantSpeech(lastAssistantSpeech, newRate);
    }
  }, [speechRate, lastAssistantSpeech, playAssistantSpeech]);

  // Reset conversation
  const handleResetConversation = useCallback(() => {
    stopSpeaking();
    stopAnyActiveListening();
    setMessages([]);
    setLastUserSpeech("");
    setLastAssistantSpeech(INITIAL_GREETING);
    setStatus("idle");
    setErrorMessage(null);
    playAssistantSpeech(INITIAL_GREETING, speechRate);
  }, [speechRate, playAssistantSpeech]);

  // Manual text submission fallback
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const text = textInput.trim();
    setTextInput("");
    handleUserSpeech(text);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-between selection:bg-amber-100">
      {/* Top Header */}
      <header className="border-b border-amber-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3.5 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-600/30">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  துணை <span className="text-sm font-semibold text-amber-700 font-sans">(Thunai)</span>
                </h1>
                <span className="bg-amber-100 text-amber-900 text-2xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  குரல் உதவி
                </span>
              </div>
              <p className="text-xs text-slate-600 hidden sm:block">
                அரசு திட்டங்களை அறிய உதவும் எளிய தமிழ் குரல் உதவியாளர்
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                if (nextMuted) stopSpeaking();
              }}
              title={isMuted ? "ஒலியை இயக்கவும்" : "ஒலியை அணைக்கவும்"}
              className={`p-2 rounded-xl border transition-colors ${
                isMuted
                  ? "bg-rose-50 border-rose-300 text-rose-700"
                  : "bg-white border-amber-200 text-amber-800 hover:bg-amber-50"
              }`}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={handleResetConversation}
              title="புதிய உரையாடல் தொடங்கவும்"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs sm:text-sm font-semibold transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">புதிய உரையாடல்</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start py-6 px-2">
        {/* Error notification if any */}
        {errorMessage && (
          <div className="w-full max-w-xl mx-auto px-4 mb-4">
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm px-4 py-2.5 rounded-xl text-center font-medium shadow-2xs">
              {errorMessage}
            </div>
          </div>
        )}

        {/* Gentle welcome reminder on first use */}
        {messages.length === 0 && (
          <div className="text-center px-4 mb-2 max-w-lg">
            <p className="text-sm sm:text-base text-slate-700 font-medium">
              கீழே உள்ள பொத்தானைத் தொட்டு உங்கள் தேவையைத் தமிழில் பேசுங்கள். துணை உங்களுடன் பேசி வழிகாட்டும்.
            </p>
          </div>
        )}

        {/* Central Voice Action Sphere */}
        <VoiceSphere
          status={status}
          onToggleMic={handleToggleMic}
          isListening={status === "listening"}
        />

        {/* Spoken Response Card */}
        <SpokenResponseCard
          lastUserSpeech={lastUserSpeech}
          lastAssistantSpeech={lastAssistantSpeech}
          isSpeaking={status === "speaking"}
          speechRate={speechRate}
          onReplay={handleReplay}
          onToggleSpeed={handleToggleSpeed}
          onStopSpeaking={() => {
            stopSpeaking();
            setStatus("idle");
          }}
        />

        {/* Quick Spoken Voice Prompts */}
        <VoiceQuickPrompts
          onSelectPrompt={(prompt) => {
            handleUserSpeech(prompt);
          }}
          disabled={status === "thinking" || status === "listening"}
        />

        {/* Optional Text input fallback (subtle and accessible) */}
        <div className="w-full max-w-2xl mx-auto px-4 mt-8">
          <form
            onSubmit={handleTextSubmit}
            className="flex items-center gap-2 bg-white border border-stone-300 rounded-2xl p-1.5 pl-4 shadow-2xs focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200 transition-all"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="அல்லது இங்கு எழுதி அனுப்பலாம் (எ.கா: எனக்கு உதவி வேண்டும்)"
              className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || status === "thinking"}
              aria-label="அனுப்புக"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl font-medium text-sm flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">அனுப்புக</span>
            </button>
          </form>
        </div>

        {/* Verified PMMVY Scheme Reference Details Drawer */}
        <SchemePocketGuide />
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200/60 bg-amber-50/50 py-3 text-center px-4">
        <p className="text-xs text-amber-900/80">
          துணை ஒரு உதவி வழிகாட்டி மட்டுமே. இறுதி தகுதி முடிவுகளை அரசு அதிகாரிகளே எடுப்பார்கள் • ரகசிய எண்களை யாரிடமும் பகிராதீர்கள்.
        </p>
      </footer>
    </div>
  );
}
