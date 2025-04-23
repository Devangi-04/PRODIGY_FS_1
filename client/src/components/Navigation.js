import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/">Task Manager</Link>
            </div>
            <div className="nav-items">
                {user ? (
                    <>
                        <span className="welcome-text">Welcome, {user.username}!</span>
                        <Link to="/dashboard">Dashboard</Link>
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navigation;