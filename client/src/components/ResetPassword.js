import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTokenValidated, setIsTokenValidated] = useState(false);
    const navigate = useNavigate();
    const { token } = useParams();

    // Define API URL
    const API_URL = 'http://localhost:5000';

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setError('No reset token provided');
                return;
            }

            try {
                setIsLoading(true);
                await axios.post(`${API_URL}/api/users/validate-token`, { 
                    resetToken: token 
                });
                setIsTokenValidated(true);
            } catch (err) {
                console.error('Token validation error:', err);
                setError(err.response?.data?.message || 'Invalid or expired reset token');
                setIsTokenValidated(false);
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post(`${API_URL}/api/users/reset-password`, {
                resetToken: token,
                newPassword: password
            });
            
            setMessage(response.data.message || 'Password reset successful');
            // Redirect to login after successful password reset
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            console.error('Password reset error:', err);
            setError(err.response?.data?.message || 'An error occurred while resetting your password');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !isTokenValidated) {
        return <div className="auth-form">
            <div>Validating reset token...</div>
        </div>;
    }

    if (!token || !isTokenValidated) {
        return <div className="auth-form">
            <div className="error">{error || 'Invalid reset token'}</div>
        </div>;
    }

    return (
        <div className="auth-form">
            <h2>Reset Password</h2>
            {message && <div className="success">{message}</div>}
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>New Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        minLength="6"
                        placeholder="Enter new password"
                    />
                </div>
                <div>
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        minLength="6"
                        placeholder="Confirm new password"
                    />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;