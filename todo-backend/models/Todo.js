// models/Todo.js
const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    userId: { // 🎯 NEW FIELD: Link to the User model
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', 
    },});

// models/Todo.js
module.exports = mongoose.models.Todo || mongoose.model('Todo', todoSchema); // Uses the standard 'Todo' name