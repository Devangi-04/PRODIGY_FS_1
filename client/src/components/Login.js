import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/users/login', formData);
            if (response.data && response.data.token && response.data.user) {
                login(response.data.user, response.data.token);
                navigate('/dashboard');
            } else {
                throw new Error('Invalid server response');
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.response?.status === 400) {
                setError('Invalid email or password');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Unable to connect to the server. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form">
            <h2>Login</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                    />
                </div>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <div className="auth-links">
                <Link to="/forgot-password" className="forgot-password-link">
                    Forgot Password?
                </Link>
            </div>
        </div>
    );
};

export default Login;