
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getStudyTips = async (topic: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `أنت مساعد تعليمي ذكي للتلميذ الحديدي. قدم 3 نصائح دراسية مختصرة ومحفزة لموضوع: ${topic}. اجعل الأسلوب ممتعاً وباللغة العربية.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "واصل الكفاح يا بطل، النجاح في انتظارك!";
  }
};

export const explainTerm = async (term: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `اشرح لي بأسلوب مبسط للطالب معنى المصطلح التالي: ${term}. اجعل الشرح في جملتين فقط.`,
      config: {
        temperature: 0.5,
      }
    });
    return response.text;
  } catch (error) {
    return "لا يمكنني الشرح حالياً، حاول لاحقاً.";
  }
};
