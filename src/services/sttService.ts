/**
 * Speech-to-Text service supporting:
 * - Native Web SpeechRecognition API in Tamil (ta-IN)
 * - Fallback MediaRecorder audio recording sent to /api/transcribe (gemini-3.5-transcribe)
 */

export interface STTCallbacks {
  onInterim?: (text: string) => void;
  onFinal: (text: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

let activeRecognition: any = null;
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

export function isMediaRecorderSupported(): boolean {
  if (typeof window === "undefined" || !navigator.mediaDevices) return false;
  return typeof MediaRecorder !== "undefined";
}

/**
 * Start listening in Tamil
 */
export function startListening(callbacks: STTCallbacks): { stop: () => void } {
  // If native SpeechRecognition is supported, prefer it for real-time responsiveness
  if (isSpeechRecognitionSupported()) {
    return startWebSpeechRecognition(callbacks);
  }

  // Fallback to MediaRecorder + Gemini 3.5 Transcribe
  if (isMediaRecorderSupported()) {
    return startMediaRecorderTranscription(callbacks);
  }

  callbacks.onError?.("உங்கள் உலாவியில் குரல் அறிதல் வசதி கிடைக்கவில்லை.");
  return { stop: () => {} };
}

function startWebSpeechRecognition(callbacks: STTCallbacks): { stop: () => void } {
  try {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    activeRecognition = recognition;
    recognition.lang = "ta-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";

    recognition.onstart = () => {
      callbacks.onStart?.();
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      if (interim) {
        callbacks.onInterim?.(interim);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        callbacks.onError?.("குரல் கேட்கவில்லை. தயவுசெய்து மீண்டும் பேசுங்கள்.");
      } else if (event.error === "not-allowed") {
        callbacks.onError?.("மைக்ரோஃபோன் அனுமதியை சரிபார்க்கவும்.");
      } else {
        callbacks.onError?.("குரல் கேட்பதில் பிழை ஏற்பட்டது.");
      }
      callbacks.onEnd?.();
    };

    recognition.onend = () => {
      activeRecognition = null;
      callbacks.onEnd?.();
      if (finalTranscript.trim()) {
        callbacks.onFinal(finalTranscript.trim());
      }
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch (e) {
          // ignore
        }
      },
    };
  } catch (err: any) {
    callbacks.onError?.("குரல் அறிதல் தொடங்குவதில் பிழை: " + (err.message || ""));
    return { stop: () => {} };
  }
}

function startMediaRecorderTranscription(callbacks: STTCallbacks): { stop: () => void } {
  let stream: MediaStream | null = null;
  audioChunks = [];

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((s) => {
      stream = s;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(s, { mimeType });
      mediaRecorder = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };

      recorder.onstart = () => {
        callbacks.onStart?.();
      };

      recorder.onstop = async () => {
        callbacks.onEnd?.();
        // Stop all tracks
        stream?.getTracks().forEach((track) => track.stop());

        if (audioChunks.length === 0) return;

        const blob = new Blob(audioChunks, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64Audio = (reader.result as string).split(",")[1];
            callbacks.onInterim?.("குரல் செயலாக்கப்படுகிறது...");
            const res = await fetch("/api/transcribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audioBase64: base64Audio, mimeType }),
            });
            const data = await res.json();
            if (data.transcript && data.transcript.trim()) {
              callbacks.onFinal(data.transcript.trim());
            } else {
              callbacks.onError?.("குரல் கேட்கவில்லை. தயவுசெய்து மீண்டும் பேசுங்கள்.");
            }
          } catch (e) {
            callbacks.onError?.("குரல் மொழிபெயர்ப்பில் பிழை ஏற்பட்டது.");
          }
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
    })
    .catch((err) => {
      callbacks.onError?.("மைக்ரோஃபோன் அணுகல் மறுக்கப்பட்டது: " + err.message);
      callbacks.onEnd?.();
    });

  return {
    stop: () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    },
  };
}

export function stopAnyActiveListening() {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch (e) {
      // ignore
    }
    activeRecognition = null;
  }

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    try {
      mediaRecorder.stop();
    } catch (e) {
      // ignore
    }
    mediaRecorder = null;
  }
}
