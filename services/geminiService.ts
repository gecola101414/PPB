
import { GoogleGenAI, Type } from "@google/genai";
import { WorkOrder } from "../types";

export const getExpenseInsights = async (orders: WorkOrder[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const summary = orders.map(o => ({
    id: o.orderNumber,
    desc: o.description,
    val: o.originalValue,
    bidVal: o.bidResult?.bidValue,
    status: o.status,
    chapter: o.chapter
  }));

  const prompt = `Analizza i seguenti ordini di lavoro e i dati di spesa dell'ufficio. Fornisci approfondimenti di alto livello su:
  1. Efficienza della spesa (risparmi/economie derivanti dalle gare d'appalto).
  2. Distribuzione del budget tra i vari capitoli.
  3. Eventuali avvisi o raccomandazioni per il lavoro futuro.
  
  Dati: ${JSON.stringify(summary)}
  
  Formatta la risposta in markdown professionale, rigorosamente in lingua ITALIANA.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    return response.text || "Impossibile generare analisi al momento.";
  } catch (error) {
    console.error("Errore Gemini:", error);
    return "Errore durante la connessione al servizio AI.";
  }
};
