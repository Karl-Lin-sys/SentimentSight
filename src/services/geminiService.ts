import { GoogleGenAI, Type, Schema, ThinkingLevel } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AnalysisResult {
  executiveSummary: string;
  actionableAreas: { title: string; description: string }[];
  trendData: { date: string; sentimentScore: number }[];
  wordCloud: { word: string; weight: number; sentiment: 'positive' | 'negative' }[];
}

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: { type: Type.STRING, description: "A brief executive summary of the overall sentiment and key takeaways." },
    actionableAreas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        }
      },
      description: "Top 3 actionable areas for improvement based on the reviews."
    },
    trendData: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "Date in YYYY-MM-DD format. If reviews lack dates, generate a realistic sequence of dates over the past month to represent the trend." },
          sentimentScore: { type: Type.NUMBER, description: "Sentiment score from -1 (very negative) to 1 (very positive)." }
        }
      }
    },
    wordCloud: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          weight: { type: Type.NUMBER, description: "Frequency or importance weight (1-100)" },
          sentiment: { type: Type.STRING, description: "'positive' or 'negative'" }
        }
      }
    }
  },
  required: ["executiveSummary", "actionableAreas", "trendData", "wordCloud"]
};

export async function analyzeReviews(text: string): Promise<AnalysisResult> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Analyze the following customer reviews and generate a sentiment report.\n\nReviews:\n${text}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: analysisSchema,
      temperature: 0.2,
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate analysis.");
  }

  return JSON.parse(response.text) as AnalysisResult;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function chatWithData(
  history: ChatMessage[],
  newMessage: string,
  contextData: AnalysisResult | null
): Promise<string> {
  const systemInstruction = `You are a customer sentiment analysis expert. You are helping a user understand their customer reviews.
  Use the following analyzed data as context for your answers. If the user asks something outside this context, try to answer based on general knowledge but remind them of your primary role.
  
  Context Data:
  ${contextData ? JSON.stringify(contextData, null, 2) : 'No data analyzed yet.'}
  `;

  const contents = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));
  
  contents.push({ role: 'user', parts: [{ text: newMessage }] });

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents,
    config: {
      systemInstruction,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH
      }
    }
  });

  return response.text || "I'm sorry, I couldn't generate a response.";
}
