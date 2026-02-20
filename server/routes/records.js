
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');

// --- Helper: Build Projection from Events ---
const buildRecord = (recordId, events) => {
    // Filter events for this record and sort by time
    const recordEvents = events.filter(e => e.recordId === recordId).sort((a, b) => a.timestamp - b.timestamp);
    if (recordEvents.length === 0) return null;

    const createdEvent = recordEvents.find(e => e.type === 'RecordCreated');
    if (!createdEvent) return null;

    const record = {
        id: recordId,
        creatorId: createdEvent.actorId,
        counterpartyName: createdEvent.payload.counterpartyName,
        counterpartyMobile: createdEvent.payload.counterpartyMobile,
        role: createdEvent.payload.role,
        originalAmount: parseFloat(createdEvent.payload.amount),
        remainingAmount: parseFloat(createdEvent.payload.amount),
        dueDate: createdEvent.payload.dueDate,
        note: createdEvent.payload.note,
        status: 'PENDING_CONFIRMATION',
        createdAt: createdEvent.timestamp,
        events: recordEvents,
        paymentHistory: []
    };

    // Replay events to build current state
    recordEvents.forEach(e => {
        if (e.type === 'RecordConfirmed') {
            record.status = 'CONFIRMED';
        } else if (e.type === 'RecordSettled') {
            record.status = 'SETTLED';
        } else if (e.type === 'DisputeRaised') {
            record.status = 'DISPUTED';
            record.disputeReason = e.payload.reason;
        } else if (e.type === 'PaymentAdded') {
            const amount = parseFloat(e.payload.amount);
            record.remainingAmount -= amount;
            record.paymentHistory.push({
                amount: amount,
                // Use the custom date provided by user, otherwise fallback to system timestamp
                date: e.payload.date ? new Date(e.payload.date).getTime() : e.timestamp,
                loggedBy: e.actorId
            });
        }
    });
    return record;
};

// @route   GET /api/records
// @desc    Get all records for logged in user (as creator or counterparty)
router.get('/', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) return res.status(404).json({ msg: 'User not found' });
        
        const mobile = currentUser.mobile;

        // Build query conditions safely
        const queryConditions = [
            { actorId: req.user.id, type: 'RecordCreated' }
        ];

        // Only add counterparty check if mobile exists (skip for Google users with no mobile)
        if (mobile) {
             queryConditions.push({ "payload.counterpartyMobile": mobile, type: 'RecordCreated' });
        }

        // Find events where user is the Creator OR the Counterparty
        const relevantCreationEvents = await Event.find({
            $or: queryConditions
        });

        const recordIds = relevantCreationEvents.map(e => e.recordId);
        
        if (recordIds.length === 0) {
            return res.json([]);
        }

        // Fetch ALL events for these specific records to rebuild state
        const allEvents = await Event.find({ recordId: { $in: recordIds } });

        // Build Projections
        const records = recordIds.map(id => buildRecord(id, allEvents)).filter(r => r !== null);
        
        // Sort by newest
        records.sort((a, b) => b.createdAt - a.createdAt);

        res.json(records);
    } catch (err) {
        console.error("Get Records Error:", err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/records/public/:id
// @desc    Get a specific record (Public for Confirmation Link)
router.get('/public/:id', async (req, res) => {
    try {
        const events = await Event.find({ recordId: req.params.id });
        if (!events || events.length === 0) return res.status(404).json({ msg: 'Record not found' });

        const record = buildRecord(req.params.id, events);
        res.json(record);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/records
// @desc    Create a new record
router.post('/', auth, async (req, res) => {
    try {
        const { payload } = req.body;
        const recordId = Math.random().toString(36).substr(2, 9);
        
        // Simple hash generation for prototype (In production, hash payload + prevHash)
        const hash = Buffer.from(JSON.stringify(payload) + Date.now()).toString('base64');

        const newEvent = new Event({
            recordId: recordId,
            type: 'RecordCreated',
            actorId: req.user.id,
            payload: payload,
            hash: hash,
            timestamp: Date.now()
        });

        await newEvent.save();
        res.json({ recordId: newEvent.recordId });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/records/:id/confirm
// @desc    Confirm a record
router.post('/:id/confirm', async (req, res) => {
    try {
        const actorId = req.body.confirmedBy || 'ExternalParty'; 

        const newEvent = new Event({
            recordId: req.params.id,
            type: 'RecordConfirmed',
            actorId: actorId,
            payload: { method: 'DIGITAL_LINK' },
            hash: 'CONFIRM_HASH', 
            timestamp: Date.now()
        });

        await newEvent.save();
        res.json({ msg: 'Confirmed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/records/:id/pay
// @desc    Add Payment
router.post('/:id/pay', auth, async (req, res) => {
    try {
        const { amount, reference, date } = req.body;

        const newEvent = new Event({
            recordId: req.params.id,
            type: 'PaymentAdded',
            actorId: req.user.id,
            payload: { amount, reference, date },
            hash: 'PAY_HASH',
            timestamp: Date.now()
        });

        await newEvent.save();

        // Check for auto-settlement
        // Rebuild record to check balance
        const events = await Event.find({ recordId: req.params.id });
        const record = buildRecord(req.params.id, events);

        if (record && record.remainingAmount <= 0) {
            const settleEvent = new Event({
                recordId: req.params.id,
                type: 'RecordSettled',
                actorId: 'system',
                payload: {},
                hash: 'SETTLE_HASH',
                timestamp: Date.now() + 1
            });
            await settleEvent.save();
        }

        res.json({ msg: 'Payment Added' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/records/:id/dispute
// @desc    Raise Dispute
router.post('/:id/dispute', async (req, res) => {
    try {
        const { reason, actorId } = req.body;
        const newEvent = new Event({
            recordId: req.params.id,
            type: 'DisputeRaised',
            actorId: actorId || 'ExternalParty',
            payload: { reason },
            hash: 'DISPUTE_HASH',
            timestamp: Date.now()
        });
        await newEvent.save();
        res.json({ msg: 'Disputed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
