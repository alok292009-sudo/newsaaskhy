
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require('https');
const User = require('../models/User');
const Otp = require('../models/Otp');
const auth = require('../middleware/auth');

// --- Helpers ---
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @route   POST /api/auth/register
// @desc    Register user
router.post('/register', async (req, res) => {
  let { name, mobile, email, password } = req.body;

  // 1. Validation
  if (!name || !password) {
      return res.status(400).json({ msg: 'Please enter Name and Password.' });
  }
  
  // Normalize Email
  if (email && email.trim() === '') {
      email = undefined;
  }

  // Ensure at least one contact method
  if (!mobile && !email) {
      return res.status(400).json({ msg: 'Please provide either Mobile Number or Email.' });
  }

  try {
    // 2. Check Exists
    if (mobile) {
        let user = await User.findOne({ mobile });
        if (user) return res.status(400).json({ msg: 'Mobile number already registered.' });
    }
    
    if (email) {
        let userByEmail = await User.findOne({ email });
        if (userByEmail) return res.status(400).json({ msg: 'Email already registered.' });
    }

    // 3. Create User
    const user = new User({ 
        name, 
        mobile, 
        email, 
        password,
        createdAt: new Date()
    });

    // 4. Hash Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();

    // 5. Return Token
    const payload = { user: { id: user.id } };
    jwt.sign(
        payload, 
        process.env.JWT_SECRET, 
        { expiresIn: '30d' }, 
        (err, token) => {
            if (err) throw err;
            res.json({ 
                token, 
                user: { 
                    id: user.id, 
                    name: user.name, 
                    mobile: user.mobile, 
                    email: user.email,
                    business: user.business,
                    role: user.role
                } 
            });
        }
    );
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ msg: 'Server error during registration.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (Password)
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
      return res.status(400).json({ msg: 'Please enter your Mobile/Email and Password.' });
  }

  try {
    // Find user by Mobile OR Email
    let user = await User.findOne({ 
        $or: [{ mobile: identifier }, { email: identifier }] 
    });

    if (!user) return res.status(400).json({ msg: 'Invalid Credentials.' });

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials.' });

    // Return Token
    const payload = { user: { id: user.id } };
    jwt.sign(
        payload, 
        process.env.JWT_SECRET, 
        { expiresIn: '30d' }, 
        (err, token) => {
            if (err) throw err;
            res.json({ 
                token, 
                user: { 
                    id: user.id, 
                    name: user.name, 
                    mobile: user.mobile, 
                    email: user.email,
                    role: user.role, 
                    business: user.business,
                    preferences: user.preferences,
                    createdAt: user.createdAt
                }
            });
        }
    );
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ msg: 'Server error during login.' });
  }
});

// @route   POST /api/auth/send-otp
// @desc    Generate and log OTP
router.post('/send-otp', async (req, res) => {
    const { mobile } = req.body;
    
    if (!mobile) return res.status(400).json({ msg: 'Mobile number required.' });

    try {
        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(404).json({ msg: 'Mobile number not found. Please register first.' });
        }

        const otp = generateOTP();
        
        // Remove existing OTPs for this number to prevent clutter
        await Otp.deleteMany({ mobile });

        const newOtp = new Otp({ mobile, otp });
        await newOtp.save();

        console.log(`🔑 MOCK OTP for ${mobile}: ${otp}`); // For Development

        // Return OTP in response for Dev/Demo convenience
        res.json({ msg: 'OTP sent successfully', otp: otp });
    } catch (err) {
        console.error("OTP Error:", err.message);
        res.status(500).json({ msg: 'Server error processing OTP.' });
    }
});

// @route   POST /api/auth/login-otp
// @desc    Verify OTP and Login
router.post('/login-otp', async (req, res) => {
    const { mobile, otp } = req.body;
    
    if (!mobile || !otp) return res.status(400).json({ msg: 'Mobile and OTP required.' });

    try {
        const validOtp = await Otp.findOne({ mobile, otp });
        if (!validOtp) {
            return res.status(400).json({ msg: 'Invalid or Expired OTP.' });
        }

        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(404).json({ msg: 'User record missing despite OTP.' });
        }

        // OTP Verified, remove it
        await Otp.deleteMany({ mobile });

        const payload = { user: { id: user.id } };
        jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '30d' }, 
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token, 
                    user: { 
                        id: user.id, 
                        name: user.name, 
                        mobile: user.mobile, 
                        role: user.role, 
                        business: user.business,
                        preferences: user.preferences,
                        createdAt: user.createdAt
                    }
                });
            }
        );
    } catch (err) {
        console.error("OTP Login Error:", err.message);
        res.status(500).json({ msg: 'Server error during OTP login.' });
    }
});

// @route   POST /api/auth/google
// @desc    Google Login/Register
router.post('/google', async (req, res) => {
    const { credential } = req.body;
    
    if (!credential) return res.status(400).json({ msg: 'No credential provided.' });

    try {
        // Verify Google Token
        const verifyToken = () => {
            return new Promise((resolve, reject) => {
                https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`, (resp) => {
                    let data = '';
                    resp.on('data', (chunk) => { data += chunk; });
                    resp.on('end', () => {
                        if (resp.statusCode === 200) {
                            try {
                                resolve(JSON.parse(data));
                            } catch (e) {
                                reject(new Error('Failed to parse Google response'));
                            }
                        } else {
                            reject(new Error('Invalid Google Token'));
                        }
                    });
                }).on("error", (err) => reject(err));
            });
        };

        const googleUser = await verifyToken();
        const { email, name } = googleUser;

        if (!email) return res.status(400).json({ msg: "Google account has no email." });

        let user = await User.findOne({ email });
        
        if (!user) {
            // Create new user for Google Sign-in
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = new User({
                name: name,
                email: email,
                password: hashedPassword,
                createdAt: new Date()
            });
            await user.save();
        }

        const payload = { user: { id: user.id } };
        jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '30d' }, 
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token, 
                    user: { 
                        id: user.id, 
                        name: user.name, 
                        email: user.email,
                        mobile: user.mobile, 
                        role: user.role, 
                        business: user.business,
                        preferences: user.preferences,
                        createdAt: user.createdAt
                    } 
                });
            }
        );

    } catch (err) {
        console.error("Google Auth Error:", err.message);
        res.status(401).json({ msg: 'Google authentication failed.' });
    }
});

// @route   GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if(!user) return res.status(404).json({ msg: "User not found" });

        // Update fields if present
        if (req.body.business) user.business = { ...user.business, ...req.body.business };
        if (req.body.preferences) user.preferences = { ...user.preferences, ...req.body.preferences };
        if (req.body.name) user.name = req.body.name;
        
        await user.save();
        
        // Return updated user object without password
        const userObj = user.toObject();
        delete userObj.password;
        
        res.json(userObj);
    } catch (err) {
        console.error("Profile Update Error:", err.message);
        res.status(500).json({ msg: 'Server Error updating profile' });
    }
});

module.exports = router;
