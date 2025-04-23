const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Return user data without password
        const userData = {
            id: user._id,
            username: user.username,
            email: user.email
        };

        res.json({
            token,
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Validate reset token
router.post('/validate-token', async (req, res) => {
    try {
        const { resetToken } = req.body;
        
        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }

        res.json({ message: 'Token is valid' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        
        // Generate reset token regardless of whether user exists (for security)
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        if (user) {
            // Save reset token
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();

            // Send email
            const { sendPasswordResetEmail } = require('../utils/email');
            const emailSent = await sendPasswordResetEmail(email, resetToken);

            if (!emailSent) {
                // If email fails to send, remove the token
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                await user.save();
                return res.status(500).json({ 
                    message: 'Failed to send password reset email. Please try again later.',
                    type: 'email_error'
                });
            }
        }

        // Always return the same message whether user exists or not
        res.json({ 
            message: 'If an account exists with this email, you will receive password reset instructions.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ 
            message: 'An error occurred while processing your request',
            type: 'server_error'
        });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: 'Reset token and new password are required' });
        }
        
        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log('Invalid reset attempt - Token:', resetToken);
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }

        // Set new password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        console.log('Password reset successful for user:', user.email);

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'An error occurred while resetting the password' });
    }
});

module.exports = router;