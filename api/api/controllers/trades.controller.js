const { db } = require('../../config/db.config');

exports.createTrade = async (req, res) => {
  const {
    stock_name, direction, quantity, entry_price, exit_price,
    stop_loss, target_price, entry_timestamp, exit_timestamp,
    entry_reason, exit_reason, market_conditions, mistakes_made,
    final_view, strategy, commission = 0, fees = 0 
  } = req.body;

  const userId = req.user.id;
  const pnl = ((exit_price - entry_price) * quantity) - parseFloat(commission) - parseFloat(fees);

  try {
    const newTrade = {
      user_id: userId,
      stock_name, direction, quantity: Number(quantity), 
      entry_price: Number(entry_price), exit_price: Number(exit_price), 
      stop_loss, target_price, profit_loss: pnl, 
      entry_timestamp, exit_timestamp, entry_reason, exit_reason, 
      market_conditions, mistakes_made, final_view, strategy, 
      commission, fees,
      created_at: new Date().toISOString()
    };

    const tradeRef = await db.collection('trades').add(newTrade);
    res.status(201).json({ id: tradeRef.id, ...newTrade });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getTrades = async (req, res) => {
  try {
    const snapshot = await db.collection('trades').where('user_id', '==', req.user.id).get();
    const trades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort descending by entry timestamp
    trades.sort((a, b) => new Date(b.entry_timestamp) - new Date(a.entry_timestamp));
    res.json(trades);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateTrade = async (req, res) => {
  try {
    const tradeId = req.params.id;
    const userId = req.user.id;

    const tradeRef = db.collection('trades').doc(tradeId);
    const doc = await tradeRef.get();

    if (!doc.exists) return res.status(404).json({ message: "Trade not found" });
    if (doc.data().user_id !== userId) return res.status(403).json({ message: "User not authorized" });

    const trade = doc.data();
    
    // Fallback to existing data if not provided in update
    const stock_name = req.body.stock_name || trade.stock_name;
    const direction = req.body.direction || trade.direction;
    const quantity = req.body.quantity || trade.quantity;
    const entry_price = req.body.entry_price || trade.entry_price;
    const exit_price = req.body.exit_price || trade.exit_price;
    const strategy = req.body.strategy || trade.strategy;
    const commission = req.body.commission !== undefined ? req.body.commission : trade.commission;
    const fees = req.body.fees !== undefined ? req.body.fees : trade.fees;

    const pnl = ((exit_price - entry_price) * quantity) - parseFloat(commission || 0) - parseFloat(fees || 0);

    const updateData = {
      stock_name, direction, quantity: Number(quantity),
      entry_price: Number(entry_price), exit_price: Number(exit_price),
      strategy, profit_loss: pnl,
      updated_at: new Date().toISOString()
    };

    await tradeRef.update(updateData);
    res.json({ id: tradeId, ...trade, ...updateData });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteTrade = async (req, res) => {
  try {
    const tradeId = req.params.id;
    const userId = req.user.id;

    const tradeRef = db.collection('trades').doc(tradeId);
    const doc = await tradeRef.get();

    if (!doc.exists) return res.status(404).json({ message: "Trade not found" });
    if (doc.data().user_id !== userId) return res.status(403).json({ message: "User not authorized" });

    await tradeRef.delete();
    res.json({ message: "Trade deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};