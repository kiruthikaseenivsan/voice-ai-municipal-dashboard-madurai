import express from "express";
import path from "path";
import http from "http";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "15mb" }));

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      }
    }
  });

  // 1. API: Process Grievance with Gemini AI & Optional Grounding
  app.post("/api/process-grievance", async (req, res) => {
    try {
      const { text, zone, useSearchGrounding, useMapsGrounding } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const tools: any[] = [];
      if (useSearchGrounding) {
        tools.push({ googleSearch: {} });
      } else if (useMapsGrounding) {
        tools.push({ googleMaps: {} });
      }

      const prompt = `Analyze the following municipal grievance/citizen complaint for Madurai City.
Location Zone: ${zone || "Unknown"}
Raw Complaint: "${text}"

Guidelines:
1. Translate to professional English if written in Tamil, mixed Tamil-English dialect, or phonetic slang.
2. Filter/Scrub PII (phone numbers, email addresses) inside the redacted_text field, replacing them with [REDACTED_CONFIDENTIAL].
3. Detect category (must be one of: 'Roads & Highways', 'Water Supply', 'Electrical & Streetlights', 'Sanitation & Waste', 'Public Safety', 'Others') and assign severity index (1 to 5).
4. Identify any offensive or abusive slang terms in Tamil or English.
5. If Google Search or Google Maps grounding is enabled, use the tools to retrieve accurate up-to-date information or verify location/landmarks in Madurai, and include verified context inside the english_translation field if helpful.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: "Extracted municipal category. MUST be one of: 'Roads & Highways', 'Water Supply', 'Electrical & Streetlights', 'Sanitation & Waste', 'Public Safety', 'Others'",
              },
              english_translation: {
                type: Type.STRING,
                description: "Accurate translation of the regional Tamil/English dialect prose to professional English.",
              },
              severity_index: {
                type: Type.INTEGER,
                description: "Assessed severity level of the issue on a scale of 1 to 5.",
              },
              confidence_score: {
                type: Type.NUMBER,
                description: "Confidence score of the classification (between 0.0 and 1.0).",
              },
              pii_detected: {
                type: Type.BOOLEAN,
                description: "True if any personally identifiable information (phone numbers, emails, addresses) is present.",
              },
              redacted_text: {
                type: Type.STRING,
                description: "The original text but with all phone numbers, email addresses, and names replaced with [REDACTED_CONFIDENTIAL].",
              },
              redacted_phone: {
                type: Type.STRING,
                description: "The exact phone number extracted if PII is detected, else an empty string or null.",
              },
              offensive_words_detected: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of any abusive, offensive, or slang swear words found in English or Tamil dialect.",
              },
            },
            required: [
              "category",
              "english_translation",
              "severity_index",
              "confidence_score",
              "pii_detected",
              "redacted_text",
              "redacted_phone",
              "offensive_words_detected"
            ],
          }
        }
      });

      const responseText = response.text || "{}";
      const parsedData = JSON.parse(responseText);

      // Extract Grounding Metadata
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const citations = chunks ? chunks.map((c: any) => ({
        uri: c.web?.uri || "",
        title: c.web?.title || ""
      })).filter((c: any) => c.uri) : [];

      res.json({ ...parsedData, citations });
    } catch (error: any) {
      console.error("Error processing grievance:", error);
      res.status(500).json({ error: error.message || "Failed to process grievance" });
    }
  });

  // 2. API: Generate Video (Veo Video Generation)
  app.post("/api/generate-video", async (req, res) => {
    try {
      const { prompt, imageBytes, mimeType, aspectRatio } = req.body;
      if (!imageBytes) {
        return res.status(400).json({ error: "Image bytes are required for image-to-video generation." });
      }

      // Start video generation with veo-3.1-fast-generate-preview
      const operation = await ai.models.generateVideos({
        model: "veo-3.1-fast-generate-preview",
        prompt: prompt || "Animate the municipal street view realistically with smooth continuous motion.",
        image: {
          imageBytes: imageBytes,
          mimeType: mimeType || "image/png"
        },
        config: {
          numberOfVideos: 1,
          resolution: "720p",
          aspectRatio: aspectRatio || "16:9"
        }
      });

      res.json({ operationName: operation.name });
    } catch (error: any) {
      console.error("Error starting video generation:", error);
      res.status(500).json({ error: error.message || "Failed to start video generation" });
    }
  });

  // 3. API: Video Status
  app.post("/api/video-status", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        return res.status(400).json({ error: "Operation name is required" });
      }

      const op = { name: operationName } as any;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      res.json({ done: updated.done, error: updated.error });
    } catch (error: any) {
      console.error("Error polling video status:", error);
      res.status(500).json({ error: error.message || "Failed to poll video status" });
    }
  });

  // 4. API: Video Download
  app.post("/api/video-download", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        return res.status(400).json({ error: "Operation name is required" });
      }

      const op = { name: operationName } as any;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) {
        return res.status(404).json({ error: "Video URI not found or video is still processing" });
      }

      const videoRes = await fetch(uri, {
        headers: { "x-goog-api-key": process.env.GEMINI_API_KEY! },
      });

      res.setHeader("Content-Type", "video/mp4");
      const arrayBuffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (error: any) {
      console.error("Error downloading video:", error);
      res.status(500).json({ error: error.message || "Failed to download video" });
    }
  });

  // WebSocket upgrade and connection routing
  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
    if (pathname === "/live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // WebSocket Live API handlers
  wss.on("connection", async (clientWs) => {
    console.log("WebSocket connection established for Live API session");
    let session: any = null;

    try {
      session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a friendly municipal assistant for Madurai City Corporation. Help citizens with issues like water leaks, potholes, garbage, or streetlights. Keep answers extremely brief, warm, and helpful. You natively understand and speak Tamil and English.",
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        },
        callbacks: {
          onmessage: (message: any) => {
            // Live audio output streaming back to client
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ type: "audio", audio }));
            }

            // Remote interruption trigger
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: "interrupted" }));
            }

            // Real-time voice transcriptions (User and AI)
            const userText = message.serverContent?.userTurn?.parts?.[0]?.text;
            if (userText) {
              clientWs.send(JSON.stringify({ type: "inputTranscription", text: userText }));
            }

            const modelText = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (modelText) {
              clientWs.send(JSON.stringify({ type: "outputTranscription", text: modelText }));
            }
          },
        },
      });

      clientWs.on("message", (data) => {
        try {
          const { audio } = JSON.parse(data.toString());
          if (audio && session) {
            session.sendRealtimeInput({
              audio: { data: audio, mimeType: "audio/pcm;rate=16000" },
            });
          }
        } catch (e) {
          console.error("Error processing user audio payload:", e);
        }
      });

      clientWs.on("close", () => {
        console.log("WebSocket Live API connection closed");
        if (session) {
          session.close();
        }
      });

    } catch (err) {
      console.error("Error creating Live API connection:", err);
      clientWs.send(JSON.stringify({ type: "error", message: "Failed to establish real-time voice assistant link" }));
      clientWs.close();
    }
  });

  // Attach Vite development middleware or serve production static assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Development Server listening successfully on port ${PORT}`);
  });
}

startServer();
