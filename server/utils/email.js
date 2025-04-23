const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');

const createTransporter = async () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        throw new Error('Email configuration missing. Please check EMAIL_USER and EMAIL_APP_PASSWORD in .env file');
    }

    // Create transporter with explicit SSL settings
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        },
        tls: {
            // Required for some email clients
            rejectUnauthorized: true,
            minVersion: "TLSv1.2"
        }
    });

    try {
        await transporter.verify();
        return transporter;
    } catch (error) {
        console.error('SMTP verification failed:', error);
        throw error;
    }
};

const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
        
        const transporter = await createTransporter();
        
        const mailOptions = {
            from: {
                name: 'Task Manager',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this password reset, please ignore this email.</p>
                <p>The reset link is: ${resetUrl}</p>
            `,
            text: `
                Password Reset Request
                
                You requested a password reset. Click the link below to reset your password:
                ${resetUrl}
                
                This link will expire in 1 hour.
                
                If you didn't request this password reset, please ignore this email.
            `,
            priority: 'high'
        };

        const info = await transporter.sendMail(mailOptions);
        
        if (!info || !info.messageId) {
            throw new Error('Failed to send email - no message ID received');
        }

        return true;
    } catch (error) {
        const errorInfo = {
            code: error.code,
            message: error.message,
            command: error.command,
            response: error.response
        };
        
        if (error.code === 'EAUTH') {
            errorInfo.suggestion = 'Please verify your Gmail credentials and ensure 2-Step Verification is enabled and you are using an App Password';
        }
        
        console.error('Email sending failed:', errorInfo);
        throw error;
    }
};

// Allow direct testing via node command
if (require.main === module) {
    const testEmail = process.env.EMAIL_USER;
    const testToken = 'test-token';
    
    console.log(`Testing email sending to ${testEmail}...`);
    
    sendPasswordResetEmail(testEmail, testToken)
        .then(() => {
            console.log('Email sent successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Test failed:', error);
            process.exit(1);
        });
}

module.exports = {
    sendPasswordResetEmail
};