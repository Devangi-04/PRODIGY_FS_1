import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BatchActions = ({ selectedTasks, onActionComplete, onClearSelection }) => {
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();

    const handleBatchUpdate = async (field, value) => {
        setLoading(true);
        try {
            const updates = selectedTasks.map(taskId => 
                axios.patch(
                    `http://localhost:5000/api/tasks/${taskId}`,
                    { [field]: value },
                    { headers: { Authorization: `Bearer ${token}` }}
                )
            );
            
            await Promise.all(updates);
            onActionComplete();
            onClearSelection();
        } catch (error) {
            console.error('Error updating tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBatchDelete = async () => {
        if (!window.confirm('Are you sure you want to delete all selected tasks?')) {
            return;
        }

        setLoading(true);
        try {
            const deletions = selectedTasks.map(taskId => 
                axios.delete(
                    `http://localhost:5000/api/tasks/${taskId}`,
                    { headers: { Authorization: `Bearer ${token}` }}
                )
            );
            
            await Promise.all(deletions);
            onActionComplete();
            onClearSelection();
        } catch (error) {
            console.error('Error deleting tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    if (selectedTasks.length === 0) {
        return null;
    }

    return (
        <div className="batch-actions">
            <div className="batch-actions-content">
                <span className="selected-count">
                    {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected
                </span>
                <div className="batch-controls">
                    <select
                        onChange={(e) => handleBatchUpdate('status', e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Update Status</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                    <select
                        onChange={(e) => handleBatchUpdate('priority', e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Update Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <button 
                        className="batch-delete-btn"
                        onClick={handleBatchDelete}
                        disabled={loading}
                    >
                        Delete Selected
                    </button>
                    <button 
                        className="clear-selection-btn"
                        onClick={onClearSelection}
                        disabled={loading}
                    >
                        Clear Selection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BatchActions;