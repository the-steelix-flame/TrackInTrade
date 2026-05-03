const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const { db } = require('../../config/db.config');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configure Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Change if using SendGrid/Mailgun
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.register = async (req, res) => {
  const { name, email, password, user_type = 'user' } = req.body;

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (!snapshot.empty) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Generate an Email Verification Token
    const verification_token = crypto.randomBytes(32).toString('hex');

    const newUserRef = usersRef.doc();
    const newUserId = newUserRef.id;

    await newUserRef.set({
      id: newUserId,
      name,
      email,
      password_hash,
      user_type,
      auth_provider: 'local',
      is_verified: false, // Must be verified to login
      verification_token,
      created_at: new Date().toISOString()
    });

    // Send Verification Email
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verification_token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your TrackInTrade Account',
      html: `<h2>Welcome to TrackInTrade!</h2>
             <p>Click the link below to verify your email and activate your account:</p>
             <a href="${verifyUrl}" style="padding: 10px 15px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>`
    });

    res.status(201).json({ msg: 'Registration successful! Please check your email to verify your account.' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) return res.status(400).json({ msg: 'Invalid Credentials' });

    const user = snapshot.docs[0].data();

    // Prevent login if local account is not verified
    if (user.auth_provider === 'local' && !user.is_verified) {
      return res.status(403).json({ msg: 'Please verify your email before logging in.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id, user_type: user.user_type } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, user_type: user.user_type } });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('verification_token', '==', token).get();

    if (snapshot.empty) {
      return res.status(400).json({ msg: 'Invalid or expired verification token.' });
    }

    const userDoc = snapshot.docs[0];
    
    // Mark user as verified and delete the token
    await userDoc.ref.update({
      is_verified: true,
      verification_token: null
    });

    res.json({ msg: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify the token securely with Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { email, name, sub: googleId } = ticket.getPayload();
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    let user;

    if (snapshot.empty) {
      // First time Google login -> Auto-register them
      const newUserRef = usersRef.doc();
      user = {
        id: newUserRef.id,
        name,
        email,
        user_type: 'user',
        auth_provider: 'google',
        is_verified: true, // Google accounts are pre-verified by Google
        created_at: new Date().toISOString()
      };
      await newUserRef.set(user);
    } else {
      user = snapshot.docs[0].data();
    }

    // Generate our app's standard JWT so the rest of the backend works normally
    const payload = { user: { id: user.id, user_type: user.user_type } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, user_type: user.user_type } });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ msg: 'Google Sign-In failed' });
  }
};