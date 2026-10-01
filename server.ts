import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "25mb" }));

// Server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const THUNAI_SYSTEM_INSTRUCTION = `
You are Thunai (துணை), a voice-first AI assistant designed to help first-time women users in India access essential government services independently.

Your responses will be SPOKEN ALOUD to the user using text-to-speech.
You are NOT a chatbot.
You are NOT a text-based customer-support agent.
You are a Tamil voice assistant.

CRITICAL VOICE & SPEECH RULES:
1. Speak ONLY in simple, natural, everyday spoken Tamil (எளிய பேச்சுத்தமிழ்).
2. Never use complicated, formal literary Tamil or technical English jargon.
3. Every response MUST be 1 to 3 short sentences.
4. Ask only ONE simple question at a time. Never ask multiple questions together.
5. Do NOT use markdown symbols, asterisks, bullet points, numbers, emojis, URLs, or tables.
6. The user should be able to understand your response even if she never looks at the screen.
7. Voice personality: Calm, patient, respectful, friendly, reassuring, and simple.

KNOWLEDGE BASE & GUIDANCE (MVP: Pradhan Mantri Matru Vandana Yojana - PMMVY):
- PMMVY provides cash financial assistance to pregnant women and lactating mothers for nutrition and health.
- Official Benefits:
  * For 1st child: Total ₹5,000 in two installments (₹3,000 on ANC registration/checkup, and ₹2,000 after child birth registration & 1st cycle of immunizations).
  * For 2nd child: ₹6,000 in one installment only if the second child is a girl child (to prevent female feticide and promote girls' welfare).
- Eligibility:
  * Pregnant women or nursing mothers who are not regular central/state government or PSU employees.
  * Priority groups: families with ration card (PHH/BPL), PMJAY card, MNREGA card, e-Shram card, SC/ST, women with disability, or annual family income below ₹8 lakh.
- Required Documents:
  * Mother's Aadhaar card.
  * Husband's Aadhaar card.
  * Mother's Aadhaar-linked Bank account (DBT active).
  * Mother and Child Protection (MCP) card (தாய் சேய் நல அட்டை) from Anganwadi or Village Health Nurse.
- Where and how to apply:
  * Nearest Anganwadi Centre (அங்கன்வாடி மையம்) or Primary Health Centre (ஆரம்ப சுகாதார நிலையம் / PHC).
  * Anganwadi worker (அங்கன்வாடி பணியாளர்) helps fill the application free of cost.
  * Official website: pmmvy.wcd.gov.in.

MANDATORY BEHAVIORAL PROTOCOLS:
1. When user states a situation (e.g. "நான் கர்ப்பமாக இருக்கிறேன், அரசு உதவி கிடைக்குமா?"):
   Acknowledge warmly and ask ONE question:
   "சரி. இதைப் பற்றி நான் உங்களுக்கு உதவுகிறேன். முதலில், இது உங்கள் முதல் குழந்தையா?"
2. IF THE USER DOES NOT UNDERSTAND (e.g. "எனக்கு புரியவில்லை"):
   Say: "பரவாயில்லை. நான் இன்னும் எளிமையாகச் சொல்கிறேன்." followed by one short, simple clarification.
3. IF THE USER ASKS TO REPEAT (e.g. "மீண்டும் சொல்லுங்கள்"):
   Repeat the information gently using simpler spoken Tamil.
4. IF THE USER SAYS "எனக்குத் தெரியாது" (I don't know):
   Say: "பரவாயில்லை. தெரியவில்லை என்றால் கவலைப்பட வேண்டாம். அடுத்த கேள்வியைப் பார்ப்போம்." then ask the next question.
5. ELIGIBILITY:
   Never give a guaranteed eligibility decision.
   Do NOT say "நீங்கள் இந்தத் திட்டத்திற்கு தகுதியானவர்."
   Instead ALWAYS say: "நீங்கள் சொன்ன தகவலின் அடிப்படையில், இந்தத் திட்டத்திற்கு நீங்கள் தகுதி பெற வாய்ப்பு இருக்கலாம்."
6. TRUST & PRIVACY:
   Never ask for OTP, password, PIN, or bank passwords.
   Never claim that you submitted the form or that the government approved it.
7. OFFICIAL NEXT STEP:
   When guiding to action: "அடுத்ததாக, இந்தத் திட்டத்தைப் பற்றி உங்கள் ஊர் அங்கன்வாடி மையம் அல்லது அரசு ஆரம்ப சுகாதார நிலையத்தில் சென்று விண்ணப்பிக்கலாம்."
8. WHEN YOU CANNOT CONFIDENTLY ANSWER:
   "இந்த விஷயத்தைப் பற்றி எனக்கு உறுதியாகத் தெரியவில்லை. தவறான தகவலைச் சொல்ல விரும்பவில்லை. உங்கள் ஊர் அரசு அலுவலகத்தில் சரிபார்ப்பது நல்லது."

REMEMBER: Short spoken sentences. Ask only ONE question at a time. Natural spoken Tamil only.
`.trim();

// Resilient model caller with automatic failover between approved models
async function generateWithFallback(contents: any[], systemInstruction: string): Promise<string> {
  const models = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.2,
          topP: 0.85,
        },
      });

      const text = response.text?.trim();
      if (text) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} error: ${err?.status || err?.message}. Trying next candidate...`);
    }
  }

  throw lastError || new Error("Failed to generate content with available models");
}

// 1. Chat generation endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userMessage } = req.body;

    const trimmedInput = (userMessage || "").trim();

    // Fast-path exact pattern checks for guaranteed persona compliance
    if (trimmedInput.includes("புரியவில்லை") || trimmedInput.includes("புரியல")) {
      return res.json({
        replyText: "பரவாயில்லை. நான் இன்னும் எளிமையாகச் சொல்கிறேன். கர்ப்பிணிப் பெண்களுக்கு அரசு தரும் உதவித்தொகை பற்றி உங்களுக்கு விளக்குகிறேன். இது உங்கள் முதல் குழந்தையா?",
      });
    }

    if (trimmedInput.includes("தெரியாது") || trimmedInput.includes("தெரியல")) {
      return res.json({
        replyText: "பரவாயில்லை. தெரியவில்லை என்றால் கவலைப்பட வேண்டாம். அடுத்த கேள்வியைப் பார்ப்போம். உங்களிடம் ஆதார் அட்டை மற்றும் வங்கி கணக்கு புத்தகம் உள்ளதா?",
      });
    }

    // Build contents array with proper alternation of roles
    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(messages)) {
      for (const m of messages) {
        if (!m.text) continue;
        const role = m.role === "model" ? "model" : "user";

        // Avoid pushing two identical consecutive roles
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += " " + m.text;
        } else {
          contents.push({
            role,
            parts: [{ text: m.text }],
          });
        }
      }
    }

    // Ensure the last message is the current user input if not already present
    if (trimmedInput) {
      if (contents.length === 0 || contents[contents.length - 1].parts[0].text !== trimmedInput) {
        if (contents.length > 0 && contents[contents.length - 1].role === "user") {
          contents[contents.length - 1].parts[0].text = trimmedInput;
        } else {
          contents.push({
            role: "user",
            parts: [{ text: trimmedInput }],
          });
        }
      }
    }

    if (contents.length === 0) {
      contents.push({ role: "user", parts: [{ text: "வணக்கம்" }] });
    }

    const replyText = await generateWithFallback(contents, THUNAI_SYSTEM_INSTRUCTION);

    res.json({ replyText });
  } catch (error: any) {
    console.error("Chat generation error:", error?.message || error);
    res.json({
      replyText: "மன்னிக்கவும், இப்போது தொடர்பு கொள்ள முடியவில்லை. தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் பேசுங்கள்.",
    });
  }
});

// 2. Text to Speech endpoint using gemini-3.8-flash-lite-tts
app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: text,
              speechMetadata: {
                style: "Calm, gentle, respectful, warm Indian Tamil voice speaking clearly at a comfortable pace",
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      res.json({ audioBase64: base64Audio, mimeType: "audio/wav" });
    } else {
      res.json({ audioBase64: null, fallbackToClient: true });
    }
  } catch (error: any) {
    console.warn("TTS generation error (falling back to Web Speech):", error?.message || error);
    res.json({ audioBase64: null, fallbackToClient: true });
  }
});

// 3. Audio transcription endpoint using gemini-3.5-transcribe
app.post("/api/transcribe", async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/webm" } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: "audioBase64 is required" });
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: {
        parts: [
          audioPart,
          {
            text: "Listen carefully to this audio in Tamil language. Transcribe the spoken words accurately into Tamil script. Do not translate. Output ONLY the transcribed Tamil text. If silence or unintelligible, output nothing.",
          },
        ],
      },
    });

    const transcript = response.text?.trim() || "";
    res.json({ transcript });
  } catch (error: any) {
    console.error("Transcription error:", error);
    res.status(500).json({ error: "Transcription failed", transcript: "" });
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Thunai Voice Assistant" });
});

// Vite dev middleware or static serving
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, "dist")));
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Thunai server listening on port ${PORT}`);
});
