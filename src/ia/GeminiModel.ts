import { GoogleGenAI } from "@google/genai";
import { IAInterface } from "./IAInterface";

interface GenerationConfig {
  responseMimeType:
  | "text/plain"
  | "text/html"
  | "application/json"
  | "text/markdown";
}

export class GeminiModel implements IAInterface {
  private genAI: GoogleGenAI;
  private modelName: string = "gemini-2.0-flash";
  private config: GenerationConfig;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({ apiKey: apiKey });
    this.modelName = this.modelName;
    this.config = {
      responseMimeType: "text/plain",
    };
  }

  async generateAnswer(tema: string, pregunta: string[]): Promise<string> {
    const prompt = `Actúa como un experto exclusivamente en ${tema}.
                    Responde solo desde la perspectiva de ${tema}, ignorando cualquier otro campo.
                    Si hay ambigüedad, interprétala siempre en el contexto de ${tema}.
                    Da una respuesta precisa, clara y breve (máx. 256 caracteres)  Esta es la pregunta: ${pregunta}.
`;
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ];

    const result = await this.genAI.models.generateContentStream({
      model: this.modelName,
      config: this.config,
      contents,
    });

    try {
      const chunks: string[] = [];

      for await (const chunk of result) {
        const candidate = chunk?.candidates?.[0];
        if (!candidate?.content?.parts) continue;

        for (const part of candidate.content.parts) {
          if (typeof part.text === "string") {
            chunks.push(part.text);
          }
        }
      }

      return chunks.join("");
    } catch (error) {
      console.error("Error al procesar la respuesta del modelo:", error);
      throw new Error("No se pudo procesar la respuesta del modelo");
    }
  }

  async generateMultipleAnswer(
    tema: string,
    questions: string[],
  ): Promise<string[]> {

    //1: Mapeamos las preguntas y enumeramos para ayudar al modelo
    const readyQuestions = questions
      .map((question, index) => `P${index + 1}: ${question}`)
      .join("\n");

    //2: Definimos un prompt para este metodo que trabaja multiples preguntas 
    const prompt = `Eres un experto en ${tema}. Responde con precisión, claridad y brevedad a las siguientes preguntas numeradas. Para cada respuesta, comienza con "Respuesta X:" donde X es el número de la pregunta. Las respuestas deben ser precisas y cortas:

${readyQuestions}

Asegúrate de mantener el formato exacto "Respuesta X:" para cada respuesta.`;

    //3:Definimos el contenido
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ];

    //4: Llamamos al modelo y obtenemos un resultado "raw"
    const rawResult = await this.genAI.models.generateContentStream({
      model: this.modelName,
      config: this.config,
      contents,
    });

    try {
      //5: Limpiamos los resultados y ordenamos para una mejor respuesta
      const chunks: string[] = [];

      for await (const chunk of rawResult) {
        const candidate = chunk?.candidates?.[0];
        if (!candidate?.content?.parts) continue;

        for (const part of candidate.content.parts) {
          if (typeof part.text === "string") {
            chunks.push(part.text);
          }
        }
      }

      const response = chunks.join("");

      // Procesamos las respuestas asegurando que coincidan con el índice de las preguntas
      const answers = new Array(questions.length).fill("");
      const responseMatches = response.match(/Respuesta\s+(\d+):(.*?)(?=Respuesta\s+\d+:|$)/gis);

      if (responseMatches) {
        responseMatches.forEach(match => {
          const indexMatch = match.match(/Respuesta\s+(\d+):/i);
          if (indexMatch) {
            const index = parseInt(indexMatch[1]) - 1;
            const answer = match.replace(/Respuesta\s+\d+:/i, "").trim();
            if (index >= 0 && index < questions.length) {
              answers[index] = answer;
            }
          }
        });
      }

      // Verificamos que todas las respuestas estén presentes
      if (answers.some(answer => answer === "")) {
        throw new Error("No se recibieron todas las respuestas esperadas");
      }

      return answers;
    } catch (error) {
      console.error("Error al procesar la respuesta del modelo:", error);
      throw new Error("No se pudo procesar la respuesta del modelo");
    }
  }
}
