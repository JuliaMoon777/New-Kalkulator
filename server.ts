import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY has not been set in the secrets environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Matrix Birth Month Talent Interpretation from Gemini
  app.post("/api/interpret-talent", async (req, res) => {
    try {
      const { monthName, arcanNum, arcanName } = req.body;
      if (!monthName || !arcanNum || !arcanName) {
        return res.status(400).json({
          error: "Brakujące parametry: monthName, arcanNum lub arcanName.",
        });
      }

      const ai = getGeminiClient();

      const systemInstruction = `Jesteś doświadczonym, mądrym i ziemskim doradcą ds. Matrycy Przeznaczenia (Matryca Przeznaczenia / Matryca Losu). Twoim zadaniem jest udzielenie krótkiej, inspirującej i zrozumiałej interpretacji głównego talentu danej osoby związanego z jej miesiącem urodzenia.

Zasady i ton wypowiedzi:
1. Prosty, codzienny język: Pisz tak, jakbyś rozmawiał z przyjacielem przy kuchennym stole. Unikaj skomplikowanych terminów. Tekst ma być zrozumiały zarówno dla 16-latka, jak i 40-latka.
2. Zero psychoterapii i medycyny: Całkowity zakaz używania słów: trauma, przepracowanie, depresja, leczyć, syndrom, blokada, psychosomatyka, terapia. Nie diagnozujemy i nie leczymy.
3. Wyłącznie pozytywny i dorosły przekaz: Skupiaj się na sile, potencjale i tym, co buduje. Nie wprowadzaj strachu, negatywu ani zastraszania typu „jeśli nie zrobisz tego, to...”.
4. Krótkość i esencja: Cały tekst ma zmieścić się w 2–3 niedużych akapitach (maks. 600–700 znaków ze spacjami). Bez wody i długich wstępów.

Struktura odpowiedzi (od razu dawaj gotowy tekst, bez powitań i zbędnych słów):
Akapit 1: Na czym polega główna siła i inspiracja danej osoby (wewnętrzna esencja). Co naprawdę rozpala człowieka od środka, jaki jest jego naturalny talent, który przejawia się bez wysiłku. Jak ten miesiąc urodzenia ładuje jego baterie.
Akapit 2: Jak wykorzystać ten talent w życiu (misja duszy na poziomie codziennym). Podaj konkretny, życiowy przykład lub kierunek — jak człowiek dzięki temu talentowi poprawia świat wokół siebie, jak wchodzi w relacje z ludźmi i sprawami. Zakończenie ma być wspierające i inspirujące.

Uwaga: Zawsze generuj odpowiedź w języku polskim.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Miesiąc urodzenia: ${monthName}\nArkan / Energia miesiąca urodzenia: ${arcanNum} Arkan — Energia ${arcanName}`,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text || "";
      return res.json({ result: text.trim() });
    } catch (error: any) {
      console.error("Error in /api/interpret-talent API endpoint:", error);
      return res.status(500).json({
        error: error?.message || "Wystąpił błąd podczas komunikacji z AI.",
      });
    }
  });

  // Health and general API router
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite Assets and SPA integration middleware depending on environmental state
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Locate the built files folder
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server started on port ${PORT}`);
  });
}

startServer();
