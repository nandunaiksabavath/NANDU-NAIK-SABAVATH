import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getSystemInstruction = (language: string) => `You are Kisan Mitra, an expert agricultural advisor AI. Your purpose is to provide farmers with clear, concise, and actionable advice based on their queries. Address the user directly and respectfully. Structure your answers with headings, bullet points, or numbered lists for maximum readability. If a query is about a specific crop, pest, or disease, provide scientific names where appropriate but explain them in simple terms. Always prioritize safe, sustainable, and economically viable farming practices.
Your final output must be a JSON object. The JSON object must have two properties:
1. "advice": (string) Your full advisory response, formatted in Markdown, in the ${language} language.
2. "imagePrompt": (string) A concise, descriptive English prompt for an image generation model to create a photorealistic image relevant to the advice. For example, if the advice is about Colorado potato beetle, the prompt could be "A photorealistic close-up of a Colorado potato beetle on a green potato leaf". If no specific visual is relevant, return an empty string.`;


export const getAdvisory = async (query: string, language: string): Promise<{ advice: string; imageUrl: string | null }> => {
  try {
    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: getSystemInstruction(language),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            advice: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
          },
          required: ["advice", "imagePrompt"],
        },
      },
    });

    const responseJson = JSON.parse(textResponse.text);
    const advice = responseJson.advice;
    const imagePrompt = responseJson.imagePrompt;

    let imageUrl: string | null = null;
    if (imagePrompt && imagePrompt.trim() !== "") {
      const imageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
      });

      if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
        const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
        imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
      }
    }

    return { advice, imageUrl };
  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    // Fallback for when JSON parsing or image generation fails. Try to get text advice only.
    try {
        const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: query,
            config: {
                systemInstruction: `You are Kisan Mitra, an expert agricultural advisor AI. Your purpose is to provide farmers with clear, concise, and actionable advice based on their queries. Address the user directly and respectfully. Structure your answers with headings, bullet points, or numbered lists for maximum readability. If a query is about a specific crop, pest, or disease, provide scientific names where appropriate but explain them in simple terms. Always prioritize safe, sustainable, and economically viable farming practices. Your response must be in well-formatted Markdown and written in ${language}.`
            }
        });
        return { advice: fallbackResponse.text, imageUrl: null };
    } catch (fallbackError) {
        console.error("Fallback failed:", fallbackError);
        throw new Error("Failed to fetch advisory from Gemini API.");
    }
  }
};

export interface MarketPrice {
  commodity: string;
  variety: string;
  minPrice: number;
  maxPrice: number;
  market: string;
}

const marketPriceSystemInstruction = (location: string) => `You are an agricultural market data analyst. Your task is to provide the latest available market prices for common agricultural commodities in and around the specified location: ${location}.
Provide data for at least 5 to 10 common commodities found in that region. The prices should be per quintal (100 kg).
Your final output must be a JSON object containing a single key "prices" which is an array of objects. Each object in the array represents a commodity and must have the following properties:
- "commodity": (string) The name of the commodity (e.g., "Wheat", "Tomato").
- "variety": (string) The specific variety (e.g., "Lokwan", "Deshi").
- "minPrice": (number) The minimum price per quintal.
- "maxPrice": (number) The maximum price per quintal.
- "market": (string) The name of the market (mandi) where this price was recorded.

If you cannot find data for the specific location, state that in a user-friendly format within the 'advice' of a fallback response, not in the structured data. For the structured data, try to find data for the nearest major agricultural market.
Do not include any introductory text, just the JSON object.`;

export const getMarketPrices = async (location: string): Promise<MarketPrice[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Get market prices for ${location}`,
      config: {
        systemInstruction: marketPriceSystemInstruction(location),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  commodity: { type: Type.STRING },
                  variety: { type: Type.STRING },
                  minPrice: { type: Type.NUMBER },
                  maxPrice: { type: Type.NUMBER },
                  market: { type: Type.STRING },
                },
                required: ["commodity", "variety", "minPrice", "maxPrice", "market"],
              },
            },
          },
          required: ["prices"],
        },
      },
    });

    const responseJson = JSON.parse(response.text);
    return responseJson.prices || [];
  } catch (error) {
    console.error("Error fetching market prices from Gemini API:", error);
    throw new Error("Failed to fetch market prices. The AI expert might be busy or the location may not be found. Please try again.");
  }
};
