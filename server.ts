import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Gemini API helper endpoint for DSL Analysis & Optimization
  app.post("/api/ai/analyze-dsl", async (req, res) => {
    try {
      const { dslCode, context } = req.body;
      if (!dslCode) {
        return res.status(400).json({ error: "dslCode is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `You are an expert Industrial IoT (IIoT) & Spatial Computing Systems Engineer specializing in Industrial Bluetooth Gateway DSL, RSSI Statistical Reservoir Filtering, Geofencing, and AR Valve Automation.

Analyze the following DSL Script:
\`\`\`
${dslCode}
\`\`\`

System Context / Telemetry:
${JSON.stringify(context || {}, null, 2)}

Please provide a structured JSON response with:
1. "summary": Short explanation of what this DSL logic will execute across the 4 layers: Environment, Spatial Geometry, Signal Reservoir, and Discovery/AR.
2. "layerBreakdown": An object detailing each statement's effect.
3. "recommendations": Array of actionable engineering suggestions (e.g., RSSI filter window size, Geofence vertex tolerance, safety interlock checks).
4. "optimizedDsl": An optimized version of the DSL script with added safety or filtering enhancements.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (error: any) {
      console.error("Error analyzing DSL with Gemini:", error);
      res.status(500).json({
        error: "Failed to analyze DSL script",
        message: error?.message || "Internal server error",
      });
    }
  });

  // Vite development middleware or production static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`IIoT DSL Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
