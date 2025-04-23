import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const navigate = useNavigate();

    const startResendTimer = () => {
        setResendTimer(60);
        const timer = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Email is required');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/forgot-password`, { email });
            
            if (response.data.type === 'email_error') {
                setError('Failed to send the reset email. Please try again later.');
            } else {
                setMessage('If an account exists with this email, you will receive password reset instructions.');
                setResetSent(true);
                startResendTimer();
            }
        } catch (err) {
            if (err.response?.data?.type === 'email_error') {
                setError('Failed to send the reset email. Please try again later.');
            } else {
                setError(err.response?.data?.message || 'An error occurred. Please try again later.');
            }
            setResetSent(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = () => {
        if (resendTimer === 0) {
            handleSubmit({ preventDefault: () => {} });
        }
    };

    return (
        <div className="auth-form">
            <h2>Forgot Password</h2>
            {message && <div className="success">{message}</div>}
            {error && <div className="error">{error}</div>}
            {!resetSent ? (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError(''); // Clear error when user types
                            }}
                            required
                            disabled={isLoading}
                            placeholder="Enter your email address"
                        />
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Reset Password'}
                    </button>
                </form>
            ) : (
                <div className="reset-sent-info">
                    <p>Check your email for the password reset link.</p>
                    <p>Haven't received the email?</p>
                    {resendTimer > 0 ? (
                        <p>You can request another email in {resendTimer} seconds</p>
                    ) : (
                        <button 
                            onClick={handleResend}
                            disabled={isLoading}
                            className="resend-button"
                        >
                            {isLoading ? 'Sending...' : 'Resend Email'}
                        </button>
                    )}
                    <p className="email-tips">
                        Tips:
                        <ul>
                            <li>Check your spam/junk folder</li>
                            <li>Make sure you entered the correct email address</li>
                            <li>Add our email address to your contacts</li>
                        </ul>
                    </p>
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;