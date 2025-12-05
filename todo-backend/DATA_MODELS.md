# Data Models

This document provides an overview of the data models used in the Todo List application. The data is stored in a MongoDB database, and Mongoose is used as the Object Data Modeling (ODM) library.

---

## User Model

The `User` model represents a user of the application.

**File:** `models/User.js`

**Schema:**

```javascript
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: String,
        unique: true,
        sparse: true, // Allows null values to not violate unique constraint
    },
    otp: String,
    otpExpires: Date,
});
```

**Fields:**

*   `username` (String, required, unique): The username of the user.
*   `password` (String, required): The hashed password of the user.
*   `mobileNumber` (String, unique, sparse): The mobile number of the user. The `sparse` option allows multiple documents to have a `null` value for this field without violating the unique constraint.
*   `otp` (String): A one-time password used for password reset verification.
*   `otpExpires` (Date): The expiration date and time of the OTP.

---

## Todo Model

The `Todo` model represents a single todo item.

**File:** `models/Todo.js`

**Schema:**

```javascript
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
    },
});
```

**Fields:**

*   `text` (String, required): The text content of the todo item.
*   `completed` (Boolean, default: `false`): A flag indicating whether the todo item is completed.
*   `userId` (ObjectId, required, ref: 'User'): A reference to the `User` who owns this todo item. This creates a relationship between the `Todo` and `User` models.
