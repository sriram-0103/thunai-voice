/**
 * Audio service handling:
 * - Gemini TTS playback (/api/tts)
 * - Browser Web Speech API fallback (ta-IN)
 * - Rate control (0.8x for slow/clarity, 1.0x for standard)
 * - Audio analysis for waveform visualization
 */

let currentAudio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let isSpeakingGlobal = false;

export interface AudioPlaybackCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export function stopSpeaking() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    } catch (e) {
      // ignore
    }
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
  }

  isSpeakingGlobal = false;
}

export function isCurrentlySpeaking(): boolean {
  return isSpeakingGlobal;
}

/**
 * Speak text in Tamil using Gemini TTS or Web Speech API fallback
 */
export async function speakTamil(
  text: string,
  options: {
    speechRate?: number; // 0.8 to 1.0
    useGeminiTTSFirst?: boolean;
    callbacks?: AudioPlaybackCallbacks;
  } = {}
): Promise<void> {
  stopSpeaking();
  isSpeakingGlobal = true;
  options.callbacks?.onStart?.();

  const rate = options.speechRate || 0.95;
  const useGemini = options.useGeminiTTSFirst !== false;

  if (useGemini) {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioBase64) {
          await playBase64Wav(data.audioBase64, rate, options.callbacks);
          return;
        }
      }
    } catch (err) {
      console.warn("Gemini TTS request failed, falling back to Web Speech API:", err);
    }
  }

  // Fallback to browser SpeechSynthesis
  speakWithWebSpeech(text, rate, options.callbacks);
}

/**
 * Play base64 WAV audio through HTMLAudioElement with playbackRate
 */
function playBase64Wav(
  base64Audio: string,
  rate: number,
  callbacks?: AudioPlaybackCallbacks
): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audioUrl = `data:audio/wav;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      audio.playbackRate = Math.min(Math.max(rate, 0.75), 1.25);

      audio.onended = () => {
        isSpeakingGlobal = false;
        currentAudio = null;
        callbacks?.onEnd?.();
        resolve();
      };

      audio.onerror = (e) => {
        console.warn("Audio element playback error, falling back to Web Speech:", e);
        isSpeakingGlobal = false;
        currentAudio = null;
        // fallback
        callbacks?.onError?.(e);
        resolve();
      };

      audio.play().catch((err) => {
        console.warn("Audio play() rejected (autoplay policy?):", err);
        isSpeakingGlobal = false;
        currentAudio = null;
        callbacks?.onError?.(err);
        resolve();
      });
    } catch (e) {
      console.warn("Error creating audio from base64:", e);
      isSpeakingGlobal = false;
      callbacks?.onError?.(e);
      resolve();
    }
  });
}

/**
 * Fallback to browser SpeechSynthesis for Tamil
 */
function speakWithWebSpeech(
  text: string,
  rate: number,
  callbacks?: AudioPlaybackCallbacks
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    isSpeakingGlobal = false;
    callbacks?.onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ta-IN";
    utterance.rate = rate; // 0.8 or 0.95
    utterance.pitch = 1.05;

    // Look for a Tamil voice if available
    const voices = window.speechSynthesis.getVoices();
    const tamilVoice = voices.find(
      (v) => v.lang.startsWith("ta") || v.lang.includes("Tamil") || v.name.includes("Tamil")
    );
    if (tamilVoice) {
      utterance.voice = tamilVoice;
    }

    utterance.onstart = () => {
      isSpeakingGlobal = true;
      callbacks?.onStart?.();
    };

    utterance.onend = () => {
      isSpeakingGlobal = false;
      callbacks?.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis utterance error:", e);
      isSpeakingGlobal = false;
      callbacks?.onError?.(e);
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("SpeechSynthesis error:", e);
    isSpeakingGlobal = false;
    callbacks?.onError?.(e);
  }
}
