# API Documentation

This document provides documentation for the Todo List API.

## Base URL

`http://localhost:3001/api`

## Authentication

All API endpoints (except for login and register) are protected and require a JSON Web Token (JWT) to be included in the `Authorization` header of the request.

`Authorization: Bearer <token>`

---

## Authentication Endpoints

### `POST /auth/register`

Registers a new user.

**Request Body:**

```json
{
  "username": "testuser",
  "password": "Password123",
  "mobileNumber": "1234567890"
}
```

**Response:**

```json
{
  "token": "xxxxxxxxxxxxxx",
  "userId": "xxxxxxxxxxxxxx"
}
```

### `POST /auth/login`

Logs in an existing user.

**Request Body:**

```json
{
  "username": "testuser",
  "password": "Password123"
}
```

**Response:**

```json
{
  "token": "xxxxxxxxxxxxxx",
  "userId": "xxxxxxxxxxxxxx"
}
```

### `POST /auth/forgot-password-request-otp`

Requests a One-Time Password (OTP) for resetting the password.

**Request Body:**

```json
{
  "mobileNumber": "1234567890"
}
```

**Response:**

```json
{
  "message": "If a matching account is found, an OTP will be sent."
}
```

### `POST /auth/forgot-password-verify-otp-reset`

Verifies the OTP and resets the password.

**Request Body:**

```json
{
  "mobileNumber": "1234567890",
  "otp": "123456",
  "newPassword": "NewPassword123"
}
```

**Response:**

```json
{
  "message": "Password has been reset successfully."
}
```

---

## Todo Endpoints

### `POST /todos`

Creates a new todo item.

**Request Body:**

```json
{
  "text": "My new todo"
}
```

**Response:**

The created todo object.

```json
{
  "_id": "xxxxxxxxxxxxxx",
  "text": "My new todo",
  "completed": false,
  "userId": "xxxxxxxxxxxxxx"
}
```

### `GET /todos`

Retrieves all todo items for the authenticated user.

**Response:**

An array of todo objects.

```json
[
  {
    "_id": "xxxxxxxxxxxxxx",
    "text": "My first todo",
    "completed": false,
    "userId": "xxxxxxxxxxxxxx"
  },
  {
    "_id": "yyyyyyyyyyyyyy",
    "text": "My second todo",
    "completed": true,
    "userId": "xxxxxxxxxxxxxx"
  }
]
```

### `PUT /todos/:id`

Updates a todo item.

**Request Body:**

```json
{
  "text": "My updated todo",
  "completed": true
}
```

**Response:**

The updated todo object.

```json
{
  "_id": "xxxxxxxxxxxxxx",
  "text": "My updated todo",
  "completed": true,
  "userId": "xxxxxxxxxxxxxx"
}
```

### `DELETE /todos/:id`

Deletes a todo item.

**Response:**

```json
{
  "message": "Todo deleted successfully"
}
```
