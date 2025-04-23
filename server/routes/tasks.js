const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Get all tasks with search, filter, and sort
router.get('/', auth, async (req, res) => {
    try {
        const { search, status, priority, sortBy = 'createdAt', order = 'desc' } = req.query;
        let query = { user: req.user.userId };
        
        // Apply filters
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Apply sorting
        const sortQuery = {};
        sortQuery[sortBy] = order === 'asc' ? 1 : -1;

        const tasks = await Task.find(query).sort(sortQuery);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get task statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.userId });
        const stats = {
            total: tasks.length,
            pending: tasks.filter(task => task.status === 'pending').length,
            'in-progress': tasks.filter(task => task.status === 'in-progress').length,
            completed: tasks.filter(task => task.status === 'completed').length,
            priority: {
                high: tasks.filter(task => task.priority === 'high').length,
                medium: tasks.filter(task => task.priority === 'medium').length,
                low: tasks.filter(task => task.priority === 'low').length
            }
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new task
router.post('/', auth, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            user: req.user.userId
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a task
router.patch('/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'status', 'dueDate', 'priority'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ message: 'Invalid updates' });
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user.userId });
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        updates.forEach(update => task[update] = req.body[update]);
        await task.save();
        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;