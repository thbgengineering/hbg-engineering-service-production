import { GoogleGenAI } from "@google/genai";
import { Machine, ProductionOrder, Material } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProduction = async (
  orders: ProductionOrder[],
  machines: Machine[],
  materials: Material[]
): Promise<string> => {
  try {
    const prompt = `
      Agis comme un expert en Gestion de Production Industrielle (Lean Manufacturing).
      Analyse les données JSON suivantes concernant notre usine :

      1. Ordres de Production (OP) : ${JSON.stringify(orders)}
      2. Machines : ${JSON.stringify(machines)}
      3. Stocks Matières Premières : ${JSON.stringify(materials)}

      Fournis une analyse concise (format HTML simple sans balises html/body, utilise des <h3>, <ul>, <li>, <strong>) couvrant :
      - Les goulots d'étranglement potentiels ou avérés.
      - Les machines nécessitant une attention immédiate (pannes, maintenance).
      - Les risques de rupture de stock.
      - 3 recommandations prioritaires pour améliorer le TRS (OEE) et réduire les délais.
      
      Sois direct, professionnel et orienté solution.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "<p>Impossible de générer l'analyse pour le moment.</p>";
  } catch (error) {
    console.error("Error fetching AI analysis:", error);
    return "<p>Erreur lors de la communication avec l'IA Assistant.</p>";
  }
};