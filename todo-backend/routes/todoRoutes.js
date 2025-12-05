// routes/todoroutes.js
const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo'); // Import the Todo model
const { protect } = require('../middleware/authMiddleware'); // Import the auth protection middleware
const { body, validationResult } = require('express-validator');

// ------------------ CRUD LOGIC (SECURED AND USER-LINKED) ------------------

// Validation middleware for creating and updating todos
const todoValidation = [
    body('text')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Todo text must be between 1 and 500 characters')
        .escape()
];

// CREATE (POST): /api/todos (Protected)
router.post('/', protect, todoValidation, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Validation failed', 
            errors: errors.array().map(err => err.msg) 
        });
    }

    try {
        const todo = new Todo({ 
            text: req.body.text,
            userId: req.userId // Link to the logged-in user ID attached by middleware
        });
        const savedTodo = await todo.save();
        res.status(201).json(savedTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// READ (GET): /api/todos (Protected - ONLY get tasks for the logged-in user)
router.get('/', protect, async (req, res) => {
    try {
        // Find only todos where userId matches the logged-in user
        const todos = await Todo.find({ userId: req.userId }); 
        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE (PUT): /api/todos/:id (Protected - User can only update their own todos)
router.put('/:id', protect, todoValidation, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Validation failed', 
            errors: errors.array().map(err => err.msg) 
        });
    }

    try {
        // Find by ID AND userId to ensure the user owns the todo item
        const todo = await Todo.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId }, // Search criteria
            req.body,                                   // Data to update
            { new: true }                               // Return the updated document
        );
        if (!todo) return res.status(404).json({ message: 'Todo not found or user not authorized' });
        res.json(todo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE (DELETE): /api/todos/:id (Protected - User can only delete their own todos)
router.delete('/:id', protect, async (req, res) => {
    try {
        // Find by ID AND userId to ensure the user owns the todo item
        const result = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!result) return res.status(404).json({ message: 'Todo not found or user not authorized' });
        res.json({ message: 'Todo deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
