import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API: Gemini SOS Guidance
app.post("/api/gemini/sos-guide", async (req, res) => {
  const { type, description } = req.body;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `You are an emergency response AI for a Philippine Barangay. 
      A resident has triggered an SOS with type: "${type}" and details: "${description}".
      Provide 3-4 ultra-concise, life-saving instructions for the user to follow while waiting for the Tanod (First Responders).
      Respond in a professional yet reassuring tone. Use local Filipino context where appropriate.
      Keep it in bullet points and under 100 words.`,
    });
    
    res.json({ guidance: response.text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to generate AI guidance" });
  }
});

// Vite middleware for development
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupServer();
