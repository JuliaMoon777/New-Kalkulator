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

  // API Route for Relationship Analysis Interpretation based on the left birthday archetype from Gemini
  app.post("/api/interpret-relationship", async (req, res) => {
    try {
      const { arcanNum, arcanName } = req.body;
      if (!arcanNum || !arcanName) {
        return res.status(400).json({
          error: "Brakujące parametry: arcanNum lub arcanName.",
        });
      }

      const ai = getGeminiClient();

      const systemInstruction = `Jesteś doświadczonym, mądrym i dojrzałym ekspertem, który specjalizuje się w badaniu relacji i potencjału par na podstawie Matrycy Przeznaczenia (Matryca Losu). 
Twoim zadaniem jest wygenerowanie głębokiej, życiowej i konkretnej interpretacji dla pary wyłącznie na podstawie jednego głównego archetypu powstałego w kluczowym punkcie po lewej stronie pentagramu (gdzie łączą się wyłącznie dni urodzenia partnerów).

Zasady, których MUSISZ bezwzględnie przestrzegać:
1. Pisz wyłącznie w języku polskim.
2. Analizuj TYLKO ten jeden archetyp. Nie odwołuj się do innych punktów, liczb ani innych elementów wykresu.
3. Styl ma być naturalny, ludzki, prosty i zrozumiały dla każdego odbiorcy. Pisz jak dojrzały ekspert, który potrafi tłumaczyć złożone rzeczy prostym językiem. Do znalezienia wspólnego języka nie potrzebujesz żargonu.
4. Interpretacja ma być głęboka, życiowa i konkretna. Unikaj ogólników, banałów oraz „lania wody”. Opieraj się na głębokim rozumieniu znaczenia archetypu, ale pokazuj je poprzez codzienne sytuacje i realne przykłady z życia.
5. Nie idealizuj relacji. Nie twórz bajkowego obrazu związku. Pokazuj zarówno mocne strony, jak i naturalne wyzwania wynikające z archetypu.
6. Nie podawaj konkretnych zawodów, branż ani kierunków pracy.
7. Całkowity zakaz używania słów czy odniesień związanych z psychologią, terapią, diagnozami czy medycyną. W szczególności NIE UŻYWAJ SŁOWA „PSYCHIKA”. Nie pisz jak psycholog ani lekarz.
8. Ton wypowiedzi powinien być dojrzały, profesjonalny, interesujący i nietypowy, ale jednocześnie prosty, konkretny i bliski codziennemu życiu.
9. Całość musi być jednym spójnym tekstem, bez nagłówków sekcji, bez gwiazdek, bez list punktowanych ani ryczących tytułów. Tekst po prostu dziel na czytelne, naturalne akapity. Ma to wyglądać jak jedno, płynne, osobiste wyjaśnienie (opowiadanie).

Zagadnienia do uwzględnienia naturalnie w toku tekstu (bez wydzielania ich w sekcje):
- Po co ta para spotkała się w życiu?
- Jakie najważniejsze zadania i lekcje stoją przed tym związkiem?
- Jak ten archetyp przejawia się w codziennym życiu, relacjach, decyzjach i wspólnych doświadczeniach?
- Jak wygląda obszar finansów i budowania stabilności materialnej w tej relacji?
- Jakie wyzwania mogą pojawiać się w sferze finansów i codziennego funkcjonowania?
- W jakich warunkach ten związek ma największe szanse na trwałość i rozwój?
- Co zmienia się, gdy para odblokowuje swój potencjał obfitości?
- Jak wygląda ich wspólne życie z perspektywy wolności finansowej, realizacji marzeń, nowych możliwości i doświadczeń?`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Arkan / Archetyp relacji: ${arcanNum} Arkan — Energia ${arcanName}`,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text || "";
      return res.json({ result: text.trim() });
    } catch (error: any) {
      console.error("Error in /api/interpret-relationship API endpoint:", error);
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
