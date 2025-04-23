import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TaskForm = ({ onTaskCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        status: 'pending',
        priority: 'medium'
    });
    const [error, setError] = useState('');
    const { token } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                'http://localhost:5000/api/tasks',
                formData,
                { headers: { Authorization: `Bearer ${token}` }}
            );
            setFormData({
                title: '',
                description: '',
                dueDate: '',
                status: 'pending',
                priority: 'medium'
            });
            if (onTaskCreated) onTaskCreated();
        } catch (error) {
            setError(error.response?.data?.message || 'Error creating task');
        }
    };

    return (
        <div className="task-form">
            <h2>Create New Task</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter task title"
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Enter task description"
                    />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Due Date:</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div className="form-group">
                        <label>Priority:</label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className={`priority-${formData.priority}`}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Status:</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
                <button type="submit">Create Task</button>
            </form>
        </div>
    );
};

export default TaskForm;