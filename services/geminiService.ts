
import { GoogleGenAI } from "@google/genai";
import { TradeRecord, TrustMetrics } from '../types';

// NOTE: In a real production app, API calls should go through a backend proxy 
// to keep the API KEY secret. For this architecture, we assume process.env is injected.
// If not present, we handle gracefully.

const apiKey = process.env.API_KEY || ''; 

export const generateTrustSummary = async (metrics: TrustMetrics, recentRecords: TradeRecord[]): Promise<string> => {
  if (!apiKey) {
    return "AI Service Unavailable: API Key missing.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare context for the model
    const recordsSummary = recentRecords.slice(0, 5).map(r => 
      `- ${r.role} deal of ₹${r.originalAmount}, Status: ${r.status}`
    ).join('\n');

    const prompt = `
      You are SAAKSHY AI, a neutral infrastructure assistant. 
      Analyze this anonymous commerce profile. Do not judge, do not assign a credit score.
      
      Metrics:
      - Confirmed Records: ${metrics.totalConfirmed}
      - On-Time Payments: ${metrics.onTimePercentage}%
      - Disputes: ${metrics.disputeCount}
      
      Recent Activity:
      ${recordsSummary}
      
      Task: Write a 2-sentence summary of this business's reliability based ONLY on the evidence provided. 
      Tone: Professional, Factual, Neutral.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Analysis could not be generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI Analysis currently unavailable due to connectivity.";
  }
};

export const generateRecordSummary = async (record: TradeRecord): Promise<string> => {
  if (!apiKey) {
    return "AI Service Unavailable: API Key missing.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const eventLog = record.events.map(e => 
      `- ${new Date(e.timestamp).toLocaleDateString()}: ${e.type} (Actor: ${e.actorId})`
    ).join('\n');

    const prompt = `
      You are SAAKSHY AI, a neutral infrastructure assistant.
      Summarize the lifecycle of this specific transaction based strictly on the event log below.
      
      Context:
      Role: ${record.role}
      Counterparty: ${record.counterpartyName}
      Original Amount: ${record.originalAmount}
      Remaining Amount: ${record.remainingAmount}
      Current Status: ${record.status}

      Event Log:
      ${eventLog}

      Task: Provide a purely factual, chronological summary of what has happened so far. 
      Rules:
      1. Do not express opinions.
      2. Do not predict future behavior.
      3. Focus on creation, confirmation, payments, and disputes.
      4. Keep it under 50 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Summary could not be generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI Analysis currently unavailable.";
  }
};
