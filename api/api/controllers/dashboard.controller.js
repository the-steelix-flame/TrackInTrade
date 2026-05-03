// src/api/controllers/dashboard.controller.js
const { db } = require('../../config/db.config');

exports.getSummary = async (req, res) => {
  try {
    const snapshot = await db.collection('trades').where('user_id', '==', req.user.id).get();
    
    let totalPnl = 0;
    let totalTrades = 0;
    let profitableTrades = 0;

    snapshot.forEach(doc => {
      const trade = doc.data();
      totalTrades++;
      
      const pnl = Number(trade.profit_loss) || 0;
      totalPnl += pnl;
      
      if (pnl > 0) profitableTrades++;
    });

    const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;

    res.json({
      total_pnl: totalPnl,
      total_trades: totalTrades,
      profitable_trades: profitableTrades,
      win_rate: Number(winRate.toFixed(2))
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getPnlByDay = async (req, res) => {
  try {
    const snapshot = await db.collection('trades').where('user_id', '==', req.user.id).get();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const dayTotals = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    snapshot.forEach(doc => {
      const trade = doc.data();
      // Ensure we only chart trades that actually have an exit date
      if (trade.exit_timestamp) {
        const dayIndex = new Date(trade.exit_timestamp).getDay();
        dayTotals[dayIndex] += (Number(trade.profit_loss) || 0);
      }
    });

    const formattedData = Object.keys(dayTotals).map(key => ({
      day: daysOfWeek[key],
      pnl: dayTotals[key]
    }));

    res.json(formattedData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getPnlByMonth = async (req, res) => {
  try {
    const snapshot = await db.collection('trades').where('user_id', '==', req.user.id).get();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const monthTotals = {}; 

    snapshot.forEach(doc => {
      const trade = doc.data();
      if (trade.exit_timestamp) {
        const dateObj = new Date(trade.exit_timestamp);
        const year = dateObj.getFullYear();
        const monthIdx = dateObj.getMonth();
        const key = `${year}-${monthIdx}`;
        
        if (!monthTotals[key]) monthTotals[key] = { year, month: monthNames[monthIdx], pnl: 0, sortKey: dateObj.getTime() };
        monthTotals[key].pnl += (Number(trade.profit_loss) || 0);
      }
    });

    const formattedData = Object.values(monthTotals)
      .sort((a, b) => a.sortKey - b.sortKey) 
      .map(item => ({ year: item.year, month: item.month, pnl: item.pnl }));

    res.json(formattedData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getPnlOverTime = async (req, res) => {
  try {
    const snapshot = await db.collection('trades').where('user_id', '==', req.user.id).get();
    let trades = [];

    snapshot.forEach(doc => {
      const trade = doc.data();
      if (trade.exit_timestamp) {
        trades.push({
          date: new Date(trade.exit_timestamp),
          pnl: Number(trade.profit_loss) || 0
        });
      }
    });

    trades.sort((a, b) => a.date - b.date);

    let cumulativePnl = 0;
    const formattedData = trades.map(trade => {
      cumulativePnl += trade.pnl;
      return {
        date: trade.date.toISOString().split('T')[0], 
        cumulativePnl: cumulativePnl
      };
    });

    res.json(formattedData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getPnlByStrategy = async (req, res) => {
  try {
    const snapshot = await db.collection('trades').where('user_id', '==', req.user.id).get();
    const strategyTotals = {};

    snapshot.forEach(doc => {
      const trade = doc.data();
      if (trade.strategy) {
        if (!strategyTotals[trade.strategy]) strategyTotals[trade.strategy] = 0;
        strategyTotals[trade.strategy] += (Number(trade.profit_loss) || 0);
      }
    });

    const formattedData = Object.keys(strategyTotals).map(strategy => ({
      strategy: strategy,
      totalPnl: strategyTotals[strategy]
    })).sort((a, b) => b.totalPnl - a.totalPnl); 

    res.json(formattedData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};