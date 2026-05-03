const { db } = require('../../config/db.config');

exports.createGoal = async (req, res) => {
  const { goal_type, target_value, start_date, end_date } = req.body;
  const userId = req.user.id;

  try {
    const newGoal = {
      user_id: userId,
      goal_type,
      target_value: Number(target_value),
      start_date,
      end_date,
      status: 'active',
      created_at: new Date().toISOString()
    };

    const docRef = await db.collection('goals').add(newGoal);
    res.status(201).json({ id: docRef.id, ...newGoal });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getGoals = async (req, res) => {
  try {
    const snapshot = await db.collection('goals').where('user_id', '==', req.user.id).get();
    const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    goals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(goals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const goalId = req.params.id;
    const userId = req.user.id;

    const goalRef = db.collection('goals').doc(goalId);
    const doc = await goalRef.get();

    if (!doc.exists) return res.status(404).json({ message: "Goal not found" });
    if (doc.data().user_id !== userId) return res.status(403).json({ message: "Not authorized" });

    const goal = doc.data();
    const updateData = {
      goal_type: req.body.goal_type || goal.goal_type,
      target_value: req.body.target_value ? Number(req.body.target_value) : goal.target_value,
      start_date: req.body.start_date || goal.start_date,
      end_date: req.body.end_date || goal.end_date,
      status: req.body.status || goal.status,
      updated_at: new Date().toISOString()
    };

    await goalRef.update(updateData);
    res.json({ id: goalId, ...goal, ...updateData });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const goalId = req.params.id;
    const userId = req.user.id;

    const goalRef = db.collection('goals').doc(goalId);
    const doc = await goalRef.get();

    if (!doc.exists) return res.status(404).json({ message: "Goal not found" });
    if (doc.data().user_id !== userId) return res.status(403).json({ message: "Not authorized" });

    await goalRef.delete();
    res.json({ message: "Goal deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};