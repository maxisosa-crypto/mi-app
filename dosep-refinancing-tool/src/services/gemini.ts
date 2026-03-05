import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

export const generateAIResponseStream = async function*(prompt: string, context: any): AsyncGenerator<string, void, unknown> {
  if (!API_KEY) {
    yield "La clave de API de Gemini no está configurada.";
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const model = "gemini-3-flash-preview";

    const systemInstruction = `
      Eres un asistente experto en el sistema de la Obra Social del Empleado Público (DOSEP) de San Luis, Argentina.
      Tu objetivo es ayudar a los empleados administrativos y afiliados a entender los cálculos de refinanciación, 
      planes de pago, coseguros y normativas de la obra social.
      
      Contexto de la aplicación:
      - La aplicación calcula refinanciaciones de órdenes médicas.
      - Maneja conceptos como: Lotes, Cuotas pagas, Cuotas totales, Planes especiales, Coseguros.
      - El usuario actual está viendo un cálculo con los siguientes datos: ${JSON.stringify(context)}
      
      Reglas:
      - Responde de manera profesional, amable y clara.
      - Si el usuario pregunta sobre un cálculo específico, analízalo y explícalo.
      - Usa terminología local de San Luis si es pertinente.
      - No inventes normativas si no las conoces, pero puedes dar consejos generales basados en el contexto de DOSEP.
      - Usa formato Markdown para resaltar información importante (negritas, listas, etc.).
    `;

    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    yield "Hubo un error al procesar tu consulta con la IA.";
  }
};
