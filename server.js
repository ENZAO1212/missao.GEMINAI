
import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.error("Configure OPENAI_API_KEY no arquivo .env");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(helmet());
app.use(express.json({ limit: "20kb" }));
app.use(express.static("public"));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

app.use("/api/", limiter);

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    name: "Missão IA",
    version: "1.0.0"
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, previousResponseId } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Digite uma mensagem válida."
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: "Sua mensagem ultrapassou 4000 caracteres."
      });
    }

    const request = {
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      instructions: `
        Você é a Missão IA, uma assistente virtual inteligente,
        amigável, educada e prestativa.

        Seu idioma padrão é português brasileiro.
        Responda de maneira clara e organizada.
        Ajude com estudos, tecnologia, programação,
        criatividade, produtividade e conhecimentos gerais.
        Se não souber algo, seja honesta.
      `,
      input: message.trim(),
      max_output_tokens: 1200
    };

    if (
      typeof previousResponseId === "string" &&
      /^resp_[a-zA-Z0-9_]+$/.test(previousResponseId)
    ) {
      request.previous_response_id = previousResponseId;
    }

    const response = await openai.responses.create(request);

    res.json({
      answer: response.output_text || "Não consegui gerar uma resposta.",
      responseId: response.id
    });

  } catch (error) {
    console.error("Erro na Missão IA:", error.message);

    res.status(500).json({
      error: "Não consegui responder agora. Tente novamente."
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Missão IA rodando em http://localhost:${PORT}`);
});
