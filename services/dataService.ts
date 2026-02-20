import { TradeRecord, RecordStatus, EventType } from '../types';

// --- Helper: Local Date String ---
const getLocalISODate = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- OFFLINE MOCK DATA ---
const MOCK_RECORDS: TradeRecord[] = [
    {
        id: 'mock-1',
        creatorId: 'demo-user-offline',
        counterpartyName: 'Rahul Distributors',
        counterpartyMobile: '9876543210',
        role: 'SELLER',
        originalAmount: 15000,
        remainingAmount: 15000,
        dueDate: getLocalISODate(5), // 5 days from now
        status: RecordStatus.CONFIRMED,
        createdAt: Date.now() - 86400000 * 2,
        events: [
            { id: 'e1', type: EventType.RECORD_CREATED, timestamp: Date.now() - 86400000 * 2, actorId: 'demo-user-offline', payload: { amount: 15000 }, hash: 'h1' },
            { id: 'e2', type: EventType.RECORD_CONFIRMED, timestamp: Date.now() - 86400000 * 1.8, actorId: 'counterparty', payload: {}, hash: 'h2' }
        ],
        paymentHistory: []
    },
    {
        id: 'mock-2',
        creatorId: 'demo-user-offline',
        counterpartyName: 'Singh Logistics',
        counterpartyMobile: '9123456789',
        role: 'BUYER',
        originalAmount: 8500,
        remainingAmount: 3500,
        dueDate: getLocalISODate(0), // Due Today
        status: RecordStatus.CONFIRMED,
        createdAt: Date.now() - 86400000 * 10,
        events: [
            { id: 'e3', type: EventType.RECORD_CREATED, timestamp: Date.now() - 86400000 * 10, actorId: 'counterparty', payload: { amount: 8500 }, hash: 'h3' },
            { id: 'e4', type: EventType.RECORD_CONFIRMED, timestamp: Date.now() - 86400000 * 9.5, actorId: 'demo-user-offline', payload: {}, hash: 'h4' },
            { id: 'e5', type: EventType.PAYMENT_ADDED, timestamp: Date.now() - 86400000 * 5, actorId: 'demo-user-offline', payload: { amount: 5000 }, hash: 'h5' }
        ],
        paymentHistory: [
            { amount: 5000, date: Date.now() - 86400000 * 5, loggedBy: 'demo-user-offline' }
        ]
    },
    {
        id: 'mock-3',
        creatorId: 'demo-user-offline',
        counterpartyName: 'Amit General Store',
        counterpartyMobile: '9988776655',
        role: 'SELLER',
        originalAmount: 2200,
        remainingAmount: 2200,
        dueDate: getLocalISODate(-2), // Overdue (2 days ago)
        status: RecordStatus.PENDING_CONFIRMATION,
        createdAt: Date.now() - 86400000 * 4,
        events: [
            { id: 'e6', type: EventType.RECORD_CREATED, timestamp: Date.now() - 86400000 * 4, actorId: 'demo-user-offline', payload: { amount: 2200 }, hash: 'h6' }
        ],
        paymentHistory: []
    }
];

// --- API Interactions ---

export const getRecords = async (): Promise<TradeRecord[]> => {
    return MOCK_RECORDS;
};

export const getRecordById = async (id: string): Promise<TradeRecord | undefined> => {
    return MOCK_RECORDS.find(r => r.id === id);
};

export const getRecordByLink = async (id: string): Promise<TradeRecord | null> => {
    const mock = MOCK_RECORDS.find(r => r.id === id);
    return mock || null;
};

// --- Actions (Commands) ---

export const createRecord = async (payload: any): Promise<string> => {
    const newId = `mock-${Date.now()}`;
    MOCK_RECORDS.unshift({
        id: newId,
        creatorId: 'demo-user-offline',
        counterpartyName: payload.counterpartyName,
        counterpartyMobile: payload.counterpartyMobile,
        role: payload.role,
        originalAmount: parseFloat(payload.amount),
        remainingAmount: parseFloat(payload.amount),
        dueDate: payload.dueDate,
        note: payload.note,
        status: RecordStatus.PENDING_CONFIRMATION,
        createdAt: Date.now(),
        events: [],
        paymentHistory: []
    });
    return newId;
};

export const confirmRecord = async (recordId: string, confirmedBy: string): Promise<void> => {
    const rec = MOCK_RECORDS.find(r => r.id === recordId);
    if (rec) rec.status = RecordStatus.CONFIRMED;
};

export const addPayment = async (recordId: string, amount: number, date: string, reference?: string): Promise<void> => {
    const rec = MOCK_RECORDS.find(r => r.id === recordId);
    if (rec) {
        rec.remainingAmount -= amount;
        rec.paymentHistory.push({
            amount,
            date: new Date(date).getTime(),
            loggedBy: 'demo-user-offline'
        });
        if (rec.remainingAmount <= 0) rec.status = RecordStatus.SETTLED;
    }
};

export const raiseDispute = async (recordId: string, reason: string, actorId: string): Promise<void> => {
    const rec = MOCK_RECORDS.find(r => r.id === recordId);
    if (rec) {
        rec.status = RecordStatus.DISPUTED;
        rec.disputeReason = reason;
    }
};

// --- Dashboard Intelligence & Analytics (Client Side Calculation) ---

export const getDashboardStats = async () => {
    const records = await getRecords();
    const today = getLocalISODate(0);

    const overdueRecords = records.filter(r => 
        r.status !== RecordStatus.SETTLED && 
        r.dueDate && r.dueDate < today
    );

    const dueTodayRecords = records.filter(r => 
        r.status !== RecordStatus.SETTLED && 
        r.dueDate && r.dueDate === today
    );

    const pendingRecords = records.filter(r => r.status === RecordStatus.PENDING_CONFIRMATION);

    const overdueAmount = overdueRecords.reduce((sum, r) => sum + r.remainingAmount, 0);
    const dueTodayAmount = dueTodayRecords.reduce((sum, r) => sum + r.remainingAmount, 0);

    return {
        overdueCount: overdueRecords.length,
        overdueAmount: overdueAmount,
        pendingCount: pendingRecords.length,
        dueTodayCount: dueTodayRecords.length,
        dueTodayAmount: dueTodayAmount
    };
};

export const getRecentEvents = async () => {
    const records = await getRecords();
    const allEvents: any[] = [];

    records.forEach(r => {
        r.events.forEach(e => {
            let description = "";
            let amount = undefined;

            if (e.type === 'RecordCreated') { 
                description = `New Record with ${r.counterpartyName}`;
                amount = e.payload?.amount ? parseFloat(e.payload.amount) : undefined;
            } else if (e.type === 'RecordConfirmed') {
                description = `Confirmed: ${r.counterpartyName}`;
            } else if (e.type === 'PaymentAdded') {
                description = `Payment from ${r.counterpartyName}`;
                amount = e.payload?.amount ? parseFloat(e.payload.amount) : undefined;
            } else if (e.type === 'DisputeRaised') {
                description = `Dispute Flagged: ${r.counterpartyName}`;
            } else if (e.type === 'RecordSettled') {
                description = `Settled: ${r.counterpartyName}`;
            }

            if (description) {
                allEvents.push({
                    id: e.id || Math.random().toString(), 
                    type: e.type,
                    timestamp: e.timestamp,
                    description,
                    recordId: r.id,
                    amount
                });
            }
        });
    });

    return allEvents.sort((a, b) => b.timestamp - a.timestamp).slice(0, 7);
};

export const getCounterpartyStats = async () => {
    const records = await getRecords();
    const stats: Record<string, {name: string, count: number, lastInteracted: number}> = {};

    records.forEach(r => {
        if (!stats[r.counterpartyName]) {
            stats[r.counterpartyName] = {
                name: r.counterpartyName,
                count: 0,
                lastInteracted: 0
            };
        }
        stats[r.counterpartyName].count++;
        // Safe check for events array
        if (r.events && r.events.length > 0) {
            const latestEvent = r.events[r.events.length - 1];
            if (latestEvent.timestamp > stats[r.counterpartyName].lastInteracted) {
                stats[r.counterpartyName].lastInteracted = latestEvent.timestamp;
            }
        }
    });

    return Object.values(stats)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); 
};

export const getMetrics = async () => {
  const records = await getRecords();
  const confirmed = records.filter(r => r.status === RecordStatus.CONFIRMED || r.status === RecordStatus.SETTLED);
  
  return {
    totalConfirmed: confirmed.length,
    onTimePercentage: 92, 
    avgDelayDays: 3,
    disputeCount: records.filter(r => r.status === RecordStatus.DISPUTED).length,
    relationshipDays: 124
  };
};

// --- Trust Scoring ---

export const getCounterpartyScore = (mobile: string): number => {
    return 750; // Mock default
};
