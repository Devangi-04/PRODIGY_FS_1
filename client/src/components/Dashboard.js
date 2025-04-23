import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import TaskCharts from './TaskCharts';

const Dashboard = () => {
    const { user, token } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        'in-progress': 0,
        completed: 0,
        priority: {
            high: 0,
            medium: 0,
            low: 0
        }
    });
    const [showTaskForm, setShowTaskForm] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/tasks/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, [token]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleTaskUpdate = () => {
        fetchStats();
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: '#4caf50',
            medium: '#ff9800',
            high: '#f44336'
        };
        return colors[priority] || '#000';
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Welcome to Your Dashboard</h1>
                <p>Hello {user?.username}, manage your tasks here!</p>
                <button 
                    className="toggle-form-btn"
                    onClick={() => setShowTaskForm(!showTaskForm)}
                >
                    {showTaskForm ? 'Hide Task Form' : 'Create New Task'}
                </button>
            </div>

            {showTaskForm && (
                <TaskForm onTaskCreated={() => {
                    handleTaskUpdate();
                    setShowTaskForm(false);
                }} />
            )}

            <div className="dashboard-content">
                <div className="dashboard-section">
                    <h2>Task Overview</h2>
                    <div className="stats-grid">
                        <div className="stat-card total">
                            <h3>Total Tasks</h3>
                            <p>{stats.total}</p>
                        </div>
                        <div className="stat-card status-pending">
                            <h3>Pending</h3>
                            <p>{stats.pending}</p>
                        </div>
                        <div className="stat-card status-progress">
                            <h3>In Progress</h3>
                            <p>{stats['in-progress']}</p>
                        </div>
                        <div className="stat-card status-completed">
                            <h3>Completed</h3>
                            <p>{stats.completed}</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Task Analytics</h2>
                    <TaskCharts stats={stats} />
                </div>

                <div className="dashboard-section">
                    <h2>Priority Distribution</h2>
                    <div className="stats-grid">
                        <div className="stat-card priority-high">
                            <h3>High Priority</h3>
                            <p style={{ color: getPriorityColor('high') }}>
                                {stats.priority?.high || 0}
                            </p>
                        </div>
                        <div className="stat-card priority-medium">
                            <h3>Medium Priority</h3>
                            <p style={{ color: getPriorityColor('medium') }}>
                                {stats.priority?.medium || 0}
                            </p>
                        </div>
                        <div className="stat-card priority-low">
                            <h3>Low Priority</h3>
                            <p style={{ color: getPriorityColor('low') }}>
                                {stats.priority?.low || 0}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="dashboard-section">
                    <TaskList onTaskUpdate={handleTaskUpdate} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;