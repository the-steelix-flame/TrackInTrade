const { db } = require('../../config/db.config');

exports.createNote = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id;

  try {
    const newNote = {
      user_id: userId,
      title,
      content,
      created_at: new Date().toISOString()
    };

    const docRef = await db.collection('notes').add(newNote);
    res.status(201).json({ id: docRef.id, ...newNote });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getNotes = async (req, res) => {
  try {
    const snapshot = await db.collection('notes').where('user_id', '==', req.user.id).get();
    const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    notes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    const noteRef = db.collection('notes').doc(noteId);
    const doc = await noteRef.get();

    if (!doc.exists) return res.status(404).json({ message: "Note not found" });
    if (doc.data().user_id !== userId) return res.status(403).json({ message: "Not authorized" });

    const note = doc.data();
    const updateData = {
      title: req.body.title || note.title,
      content: req.body.content || note.content,
      updated_at: new Date().toISOString()
    };

    await noteRef.update(updateData);
    res.json({ id: noteId, ...note, ...updateData });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id;

    const noteRef = db.collection('notes').doc(noteId);
    const doc = await noteRef.get();

    if (!doc.exists) return res.status(404).json({ message: "Note not found" });
    if (doc.data().user_id !== userId) return res.status(403).json({ message: "Not authorized" });

    await noteRef.delete();
    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};