
import { GoogleGenAI } from "@google/genai";
import { TradeRecord, TrustMetrics, EventType } from '../types';

// NOTE: In a real production app, API calls should go through a backend proxy 
// to keep the API KEY secret. For this architecture, we assume process.env is injected.
// If not present, we handle gracefully.

const apiKey = process.env.API_KEY || ''; 

// Helper to calculate on-time rates per counterparty
function calculateCounterpartyStats(records: TradeRecord[]) {
  const stats: Record<string, { total: number, onTime: number }> = {};
  
  records.forEach(r => {
    if (r.status !== 'SETTLED') return;
    if (!stats[r.counterpartyName]) stats[r.counterpartyName] = { total: 0, onTime: 0 };
    
    stats[r.counterpartyName].total++;
    
    // Check if on time
    const settleEvent = r.events?.find(e => e.type === EventType.RECORD_SETTLED);
    if (settleEvent && r.dueDate) {
        const settledAt = settleEvent.timestamp;
        const dueDate = new Date(r.dueDate).getTime() + (24 * 60 * 60 * 1000); // End of day buffer
        if (settledAt <= dueDate) {
            stats[r.counterpartyName].onTime++;
        }
    } else {
        // If settled but no event timestamp (legacy data), assume on time or skip. 
        // We'll count it as on time to be generous for now.
        stats[r.counterpartyName].onTime++;
    }
  });
  
  return Object.entries(stats).map(([name, s]) => ({
    name,
    rate: Math.round((s.onTime / s.total) * 100),
    total: s.total
  })).sort((a, b) => b.total - a.total).slice(0, 3); // Top 3
}

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

    const topCounterparties = calculateCounterpartyStats(recentRecords);
    const counterpartyContext = topCounterparties.length > 0 
      ? `Top Counterparty Performance:\n${topCounterparties.map(c => `- ${c.name}: ${c.rate}% On-Time (${c.total} settled)`).join('\n')}`
      : "No specific counterparty history available.";

    const prompt = `
      You are SAAKSHY AI, a neutral infrastructure assistant. 
      Analyze this anonymous commerce profile. Do not judge, do not assign a credit score.
      
      Metrics:
      - Confirmed Records: ${metrics.totalConfirmed}
      - On-Time Payments: ${metrics.onTimePercentage}%
      - Disputes: ${metrics.disputeCount}
      
      ${counterpartyContext}

      Recent Activity:
      ${recordsSummary}
      
      Task: Write a 2-sentence summary of this business's reliability based ONLY on the evidence provided. 
      Include specific details about payment behavior with top counterparties if available.
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

export const generateRecordSummary = async (record: TradeRecord, history: TradeRecord[] = []): Promise<string> => {
  if (!apiKey) {
    return "AI Service Unavailable: API Key missing.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const eventLog = record.events.map(e => 
      `- ${new Date(e.timestamp).toLocaleDateString()}: ${e.type} (Actor: ${e.actorId})`
    ).join('\n');

    // Calculate specific stats for this counterparty from history
    let counterpartyStats = "";
    if (history.length > 0) {
        const relevantHistory = history.filter(r => r.counterpartyName === record.counterpartyName && r.status === 'SETTLED');
        if (relevantHistory.length > 0) {
            let onTime = 0;
            relevantHistory.forEach(r => {
                const settleEvent = r.events?.find(e => e.type === EventType.RECORD_SETTLED);
                if (settleEvent && r.dueDate) {
                    if (settleEvent.timestamp <= new Date(r.dueDate).getTime() + 86400000) onTime++;
                } else {
                    onTime++;
                }
            });
            const rate = Math.round((onTime / relevantHistory.length) * 100);
            counterpartyStats = `Historical Performance with ${record.counterpartyName}: ${rate}% On-Time over ${relevantHistory.length} settled records.`;
        }
    }

    const prompt = `
      You are SAAKSHY AI, a neutral infrastructure assistant.
      Summarize the lifecycle of this specific transaction based strictly on the event log below.
      
      Context:
      Role: ${record.role}
      Counterparty: ${record.counterpartyName}
      Original Amount: ${record.originalAmount}
      Remaining Amount: ${record.remainingAmount}
      Current Status: ${record.status}
      ${counterpartyStats}

      Event Log:
      ${eventLog}

      Task: Provide a purely factual, chronological summary of what has happened so far. 
      If historical performance data is provided above, mention it briefly to provide context on the relationship.
      Rules:
      1. Do not express opinions.
      2. Do not predict future behavior.
      3. Focus on creation, confirmation, payments, and disputes.
      4. Keep it under 60 words.
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
