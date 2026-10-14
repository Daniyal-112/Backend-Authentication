# Bcrypt — Day 2 🔐

**Backend Authentication Series** · Signup & Login API with Bcrypt, Express and MongoDB

This folder builds a real signup and login API using Bcrypt for password hashing, organized in a clean **Model – Route – Controller** structure.

---

## 🛠️ Tech Stack

- **Node.js** + **Express** — server and routing
- **MongoDB** + **Mongoose** — database and schema
- **bcrypt** — password hashing and verification
- **dotenv** — environment variables
- **nodemon** — auto-restart during development

---

## 📁 Folder Structure

```
Day-2/
├── controllers/
│   ├── signupController.js   # Signup logic
│   └── loginController.js    # Login logic
├── db/
│   └── db.js                 # MongoDB connection
├── models/
│   └── user.js               # User schema & model
├── routes/
│   └── authRoutes.js         # /signup and /login routes
├── app.js                    # Express app + middleware + routes
├── server.js                 # Loads env, connects DB, starts server
├── .env                      # Secrets (not pushed to GitHub)
├── .gitignore
└── package.json
```

### How the layers connect

```
Request → server.js → app.js → routes/authRoutes.js → controllers/ → models/user.js → MongoDB
```

| Layer       | File                   | Responsibility                                                          |
| ----------- | ---------------------- | ----------------------------------------------------------------------- |
| Entry       | `server.js`            | Loads `.env`, connects to DB, starts the server                         |
| App         | `app.js`               | Creates the Express app, adds `express.json()`, mounts routes at `/api` |
| Routes      | `routes/authRoutes.js` | Maps URLs to controller functions                                       |
| Controllers | `controllers/*.js`     | Validation, hashing, comparison, responses                              |
| Model       | `models/user.js`       | Defines the shape of a user in MongoDB                                  |
| Database    | `db/db.js`             | Connects Mongoose to MongoDB                                            |

---

## 🚀 How to Run

**1. Install dependencies**

```bash
npm install express mongoose bcrypt dotenv
npm install -D nodemon
```

**2. Enable ES Modules** in `package.json`:

```json
{
  "type": "module"
}
```

**3. Create a `.env` file** in the Day-2 folder:

```
MONGO_URL=Your_MongoDB_URL
PORT=Your_PORT_Number
```

**4. Start the server**

```bash
nodemon server
```

Expected output:

```
DataBase Connected Successfully
Server is running on http://localhost:PORT
```

---

## 📡 API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint      | Description                             |
| ------ | ------------- | --------------------------------------- |
| GET    | `/`           | Health check — returns "API is Working" |
| POST   | `/api/signup` | Register a new user                     |
| POST   | `/api/login`  | Log in an existing user                 |

### POST `/api/signup`

**Request body**

```json
{
  "name": "Ahmed",
  "email": "ahmed@gmail.com",
  "password": "Ahmed678"
}
```

**Responses**

| Status | When                        | Message                                 |
| ------ | --------------------------- | --------------------------------------- |
| `201`  | User created                | `Registration Successfully` (+ user id) |
| `400`  | A field is missing          | `All fields are required`               |
| `400`  | Password under 8 characters | `Password must be at least 8 character` |
| `409`  | Email already exists        | `Email already registered`              |
| `500`  | Server error                | `Registration failed`                   |

### POST `/api/login`

**Request body**

```json
{
  "email": "ahmed@gmail.com",
  "password": "Ahmed678"
}
```

**Responses**

| Status | When                      | Message                           |
| ------ | ------------------------- | --------------------------------- |
| `200`  | Correct email & password  | `Login Successful` (+ name)       |
| `400`  | Email or password missing | `Please enter email and password` |
| `401`  | No user with that email   | `Invalid email`                   |
| `401`  | Password doesn't match    | `Wrong password`                  |
| `500`  | Server error              | `Login failed`                    |

> Test these with Postman or Thunder Client. Set the body type to **raw → JSON**.

---

## 🔄 How It Works

### Signup flow

```
req.body → validate fields → check password length → check email exists
        → bcrypt.hash(password, 10) → User.create() → 201 response
```

### Login flow

```
req.body → validate fields → User.findOne({ email }) → user found?
        → bcrypt.compare(password, checkUser.password) → 200 response
```

### Key lesson from Day 2

`User.findOne()` returns the **full user document** from MongoDB (or `null` if not found). The hashed password lives on that document, so comparison must use it:

```javascript
const checkUser = await User.findOne({ email });

await bcrypt.compare(password, checkUser.password); // ✅ the found user's hash
await bcrypt.compare(password, User.password); // ❌ User is the model → undefined
```

Using `User.password` throws: `Error: data and hash arguments required`.

---

## 🧩 User Schema

| Field      | Type   | Rules                                                   |
| ---------- | ------ | ------------------------------------------------------- |
| `name`     | String | required                                                |
| `email`    | String | required, unique, trim, lowercase                       |
| `password` | String | required (stores the bcrypt **hash**, never plain text) |

---

## 📝 Bcrypt Backend — Notes 6

### Signup

1. Receive user data using `req.body`.
2. Validate required fields.
3. Check whether the email already exists.
4. Hash the password using `await bcrypt.hash(password, 12)`.
5. Save the hashed password in MongoDB.
6. Return a success response.

### Login

1. Receive email and password.
2. Find the user using the email.
3. Compare the entered password with the stored hash.
4. If the password is incorrect, return an authentication error.
5. If correct, allow the login flow to continue.

### Important status codes

- `200` — Request successful.
- `201` — Resource created successfully.
- `400` — Invalid or missing request data.
- `401` — Authentication failed.
- `409` — Resource conflict, such as a duplicate email.
- `500` — Server-side error.

### Important functions

- `bcrypt.hash()` — Generates a password hash.
- `bcrypt.compare()` — Checks whether the entered password matches the stored hash.
- `User.findOne()` — Finds a matching user in MongoDB.
- `User.create()` — Creates a new user document.
- `express.json()` — Parses incoming JSON request bodies.

---

## 🔒 Security Checklist

- ✅ Passwords are hashed before saving
- ✅ Plain-text passwords are never stored or returned
- ✅ `.env` is listed in `.gitignore`
- ✅ Duplicate emails are blocked (`409`)
- 🔜 Use one shared message ("Invalid email or password") for both login failures, so attackers can't tell which emails are registered

---
