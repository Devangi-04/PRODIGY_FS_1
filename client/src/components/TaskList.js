import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TaskAnimation from './TaskAnimation';

const TaskList = ({ onTaskUpdate }) => {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [priority, setPriority] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const { token } = useAuth();

    const fetchTasks = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('status', filter);
            if (priority !== 'all') params.append('priority', priority);
            if (searchTerm) params.append('search', searchTerm);
            params.append('sortBy', sortBy);
            params.append('order', sortOrder);

            const response = await axios.get(`http://localhost:5000/api/tasks?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }, [filter, priority, searchTerm, sortBy, sortOrder, token]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await axios.patch(
                `http://localhost:5000/api/tasks/${taskId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            fetchTasks();
            if (onTaskUpdate) onTaskUpdate();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handlePriorityChange = async (taskId, newPriority) => {
        try {
            await axios.patch(
                `http://localhost:5000/api/tasks/${taskId}`,
                { priority: newPriority },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            fetchTasks();
            if (onTaskUpdate) onTaskUpdate();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDelete = async (taskId) => {
        try {
            await axios.delete(
                `http://localhost:5000/api/tasks/${taskId}`,
                { headers: { Authorization: `Bearer ${token}` }}
            );
            fetchTasks();
            if (onTaskUpdate) onTaskUpdate();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
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
        <div className="task-list">
            <div className="task-controls">
                <div className="search-controls">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>
                <div className="filter-controls">
                    <div>
                        <label>Status:</label>
                        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <div>
                        <label>Priority:</label>
                        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="all">All</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>
                <div className="sort-controls">
                    <label>Sort by:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="createdAt">Created Date</option>
                        <option value="dueDate">Due Date</option>
                        <option value="title">Title</option>
                        <option value="priority">Priority</option>
                    </select>
                    <button 
                        className="sort-order-btn"
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            {tasks.length === 0 ? (
                <p>No tasks found. Create a new task to get started!</p>
            ) : (
                <div className="tasks-grid">
                    {tasks.map(task => (
                        <TaskAnimation key={task._id}>
                            <div className={`task-card priority-${task.priority}`}>
                                <div className="task-header">
                                    <h3>{task.title}</h3>
                                    <div 
                                        className="priority-indicator"
                                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                                    >
                                        {task.priority}
                                    </div>
                                </div>
                                <p>{task.description}</p>
                                <div className="task-meta">
                                    <div className="task-controls">
                                        <select
                                            value={task.status}
                                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                            className={`status-${task.status}`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                        <select
                                            value={task.priority}
                                            onChange={(e) => handlePriorityChange(task._id, e.target.value)}
                                            className="priority-select"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(task._id)}
                                        className="delete-btn"
                                    >
                                        Delete
                                    </button>
                                </div>
                                {task.dueDate && (
                                    <p className="due-date">
                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </p>
                                )}
                                <p className="created-at">
                                    Created: {new Date(task.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </TaskAnimation>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaskList;