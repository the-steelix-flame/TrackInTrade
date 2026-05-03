// src/api/controllers/broker.controller.js
const { db } = require('../../config/db.config');
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; 
const IV_LENGTH = 16;

// --- 1. ENCRYPTION ENGINE ---
const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (encryptedText) => {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedData = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// --- 2. SAVE KEYS ---
exports.saveBrokerKeys = async (req, res) => {
  const { broker_name, api_key, api_secret } = req.body;
  const userId = req.user.id;

  try {
    const encryptedKey = encrypt(api_key);
    const encryptedSecret = encrypt(api_secret);

    const brokerData = {
      user_id: userId,
      broker_name: broker_name.toLowerCase(),
      api_key: encryptedKey,
      api_secret: encryptedSecret,
      updated_at: new Date().toISOString()
    };

    const docRef = db.collection('broker_keys').doc(`${userId}_${broker_name.toLowerCase()}`);
    await docRef.set(brokerData, { merge: true });

    res.json({ message: "Broker API keys securely encrypted and saved." });
  } catch (err) {
    console.error("Broker Key Error:", err);
    res.status(500).json({ error: "Failed to save broker keys securely." });
  }
};

// --- 3. THE SYNC ENGINE (SIMULATION MODE) ---
exports.syncTrades = async (req, res) => {
  const { broker_name } = req.body;
  const userId = req.user.id;
  const targetBroker = broker_name.toLowerCase();

  try {
    // Verify they actually submitted keys (even fake ones) before syncing
    const docRef = db.collection('broker_keys').doc(`${userId}_${targetBroker}`);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(400).json({ error: `No API keys found for ${broker_name}.` });
    }

    // SIMULATION DATA: This prevents you from being blocked by Kotak's registration
    const mockPositions = [
      {
        user_id: userId,
        stock_name: "RELIANCE",
        direction: "LONG",
        quantity: 50,
        average_price: 2850.50,
        mtm_pnl: 1250.00,
        sync_timestamp: new Date().toISOString()
      },
      {
        user_id: userId,
        stock_name: "HDFCBANK",
        direction: "SHORT",
        quantity: 100,
        average_price: 1450.00,
        mtm_pnl: -400.00,
        sync_timestamp: new Date().toISOString()
      }
    ];

    const mockInvestments = [
      {
        user_id: userId,
        asset_class: "STOCK",
        stock_name: "TCS",
        quantity: 20,
        buy_price: 3500.00,
        current_value: 74000.00,
        pnl: 4000.00,
        sync_timestamp: new Date().toISOString()
      },
      {
        user_id: userId,
        asset_class: "ETF",
        stock_name: "NIFTYBEES",
        quantity: 500,
        buy_price: 220.00,
        current_value: 125000.00,
        pnl: 15000.00,
        sync_timestamp: new Date().toISOString()
      }
    ];

    const batch = db.batch();

    mockPositions.forEach(pos => {
      const posRef = db.collection('positions').doc();
      batch.set(posRef, pos);
    });

    mockInvestments.forEach(inv => {
      const invRef = db.collection('investments').doc();
      batch.set(invRef, inv);
    });

    await batch.commit();

    return res.json({ 
      message: `Successfully synced ${mockPositions.length} active positions and ${mockInvestments.length} long-term investments.` 
    });

  } catch (err) {
    console.error("Trade Sync Error:", err);
    res.status(500).json({ error: "Failed to connect to the broker's API." });
  }
};

// --- 4. THE MISSING FETCH ROUTES ---
exports.getPositions = async (req, res) => {
  try {
    const snapshot = await db.collection('positions').where('user_id', '==', req.user.id).get();
    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch positions" });
  }
};

exports.getInvestments = async (req, res) => {
  try {
    const snapshot = await db.collection('investments').where('user_id', '==', req.user.id).get();
    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch investments" });
  }
};