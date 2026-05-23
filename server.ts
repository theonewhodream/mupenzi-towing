import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization helper for Gemini SDK to prevent server startup crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("GEMINI_API_KEY is not configured or uses the placeholder. Demonstration mode activated.");
    return null;
  }
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    return aiClient;
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI client:", err);
    return null;
  }
}

// 1. API: Diagnostic safety checklist & advisory
app.post("/api/diagnose", async (req, res) => {
  const { incidentType, driverName, locationName, vehicleModel } = req.body;

  const ai = getGenAI();
  if (!ai) {
    // Demonstration Fallback Content
    return res.json({
      checklists: [
        "Immediately move yourself and passengers to a secure location off the main driving lane.",
        "Turn on your vehicle's emergency flashers (hazard lights) to maximize road visibility.",
        "Set up a reflective triangle or safety flares at least 30 meters behind the vehicle.",
        "Pop open the hood only when it is safe to do so to signal roadside distress to passing experts."
      ],
      safetyFirst: [
        "In Rwanda, vehicles pass on the right. Keep clear of the left-hand traffic, especially on highway bends.",
        "Never stay inside the vehicle if it is parked on high-speed provincial roadways."
      ],
      aiCommentary: `Mupenzi Roadside Dispatch System has prioritized your incident. A certified technician is being prepared for ${vehicleModel || "your vehicle"} at ${locationName || "your location"}. Please remain calm—expert help is coming.`
    });
  }

  try {
    const prompt = `
      You are Mupenzi Breakdown's core emergency dispatch advisor.
      We have an active roadside vehicular breakdown in Rwanda with the following details:
      - Driver: ${driverName || "Unknown driver"}
      - Vehicle: ${vehicleModel || "Unknown car"}
      - Location in Rwanda: ${locationName || "Unknown location"}
      - Incident reported: ${incidentType || "Mechanical Breakdown"}

      Provide a strict JSON response containing professional, reassuring, and immediate roadside emergency action steps.
      The output structure must match this schema:
      {
        "checklists": ["step 1", "step 2", "step 3", "step 4"],
        "safetyFirst": ["critical safety warning 1", "critical safety warning 2"],
        "aiCommentary": "A highly authoritative, reassuring message in English, addressing the driver directly and showing utmost command of the situation."
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            checklists: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Four immediate high-visibility sequential steps to secure the vehicle and passengers."
            },
            safetyFirst: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Two critical safety warnings specific to Rwanda traffic patterns or roadside environments."
            },
            aiCommentary: {
              type: Type.STRING,
              description: "A strong, brief, calm, and reassuring expert dispatcher message addressed to the user."
            }
          },
          required: ["checklists", "safetyFirst", "aiCommentary"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini diagnosis API error:", error);
    return res.status(500).json({ error: "Failed to query Gemini diagnostic models." });
  }
});

// 2. API: Dynamic 100% vehicular breakdown image generator
app.post("/api/generate-breakdown-image", async (req, res) => {
  const { promptInput } = req.body;

  if (!promptInput) {
    return res.status(400).json({ error: "Prompt input is required." });
  }

  // Refine and expand the user's prompt strictly targeting vehicular breakdowns in Rwanda
  let refinedPrompt = promptInput;
  const lower = promptInput.toLowerCase();
  
  if (lower.includes("nighttime towing") || lower.includes("kigali streets")) {
    refinedPrompt = "Hyper-realistic nighttime towing on Kigali streets, capital of Rwanda. A modern heavy-duty recovery tow truck with flashing high-visibility yellow and amber hazard beacons loading a disabled elegant SUV. The background shows Kigali wet asphalt pavement, reflection of street lamps, misty night atmosphere, photorealistic cinematic raw render, premium detailed engineering.";
  } else if (lower.includes("heavy rain") || lower.includes("fixing an engine")) {
    refinedPrompt = "An expert professional auto mechanic in heavy yellow industrial safety rainwear diagnosing a breakdown car under the open hood in Musanze during torrential rain. Dramatic amber hazard flasher lights illuminated on the wet black ground, mist-veiled atmospheric highway, cinematic high contrast, true-to-life mechanics details, hyper-photorealistic.";
  } else if (lower.includes("mountain highway") || lower.includes("flat tire")) {
    refinedPrompt = "An emergency tire change on a broken-down family crossover by roadside patrol crew on a mountain highway passing by Musanze, Rwanda. Backdrop of magnificent dark Virunga mountains shrouded in clouds. High visibility amber strobe safety bars glowing on the response patrol vehicle. Photorealistic, crisp raw details, 4K depth.";
  } else {
    refinedPrompt = `${promptInput}. Focus 100% strictly on a realistic roadside breakdown rescue, vehicle mechanics, heavy tow truck, or automotive repair operations inside Rwanda. High-visibility orange/yellow strobe emergency lighting under dramatic atmospheric skies, realistic depth, photorealistic details. Absolute zero tropical, beautiful beach, or sunrise landscapes.`;
  }

  const ai = getGenAI();
  if (!ai) {
    // Demonstration mode - return high-quality SVG illustration + prompt detail to demonstrate perfect visual response
    return res.json({
      demo: true,
      refinedPrompt,
      message: "Demonstration mode: Set GEMINI_API_KEY in Secrets to generate photorealistic imagery via Gemini.",
      imageUrl: null
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: refinedPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    // Traverse candidates to locate the generated base64 image bytes
    let base64Image: string | null = null;
    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          base64Image = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (base64Image) {
      return res.json({
        demo: false,
        refinedPrompt,
        imageUrl: base64Image
      });
    } else {
      throw new Error("No image data found in Gemini response parts.");
    }
  } catch (error: any) {
    console.error("Gemini Image generation failure:", error);
    return res.status(500).json({
      error: "Gemini Image generation failed. Make sure your API key has sufficient access, or run in demonstration mode.",
      details: error.message
    });
  }
});

// Serve Vite dev server or static files depending on environment
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mupenzi Breakdown Core running on http://localhost:${PORT}`);
  });
}

initServer();
