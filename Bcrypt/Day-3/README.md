# Bcrypt — Day 3 🛡️

**Backend Authentication Series** · Signup, Login & Protected Users Route with Middleware

Day 3 revisits the signup and login API from Day 2 and adds **middleware**: validation is moved out of the controllers, and a new `GET /api/users` route is protected with a token check. This is the groundwork for JWT-protected routes.

---

## 🛠️ Tech Stack

- **Node.js** + **Express** — server, routing, middleware
- **MongoDB** + **Mongoose** — database and schema
- **bcrypt** — password hashing and verification
- **dotenv** — environment variables
- **nodemon** — auto-restart during development

---

## 📁 Folder Structure

```
Day-3/
├── controllers/
│   ├── signupController.js   # Create a new user
│   ├── loginController.js    # Verify email + password
│   └── usersController.js    # Return all users (name + email)
├── db/
│   └── db.js                 # MongoDB connection
├── middlewares/
│   ├── validateSignup.js     # Checks signup body
│   ├── validateLogin.js      # Checks login body
│   └── checkToken.js         # Protects the users route
├── models/
│   └── user.js               # User schema & model
├── routes/
│   └── authRoutes.js         # All API routes
├── app.js                    # Express app + JSON parser + routes
├── server.js                 # Loads env, connects DB, starts server
├── .env                      # Secrets (not pushed to GitHub)
├── .gitignore
└── package.json
```

---

## 🧠 What is Middleware?

Middleware is a function that runs **between the request and the controller**.

```
Request → middleware → controller → Response
```

Every middleware receives `(req, res, next)`:

- If everything is fine → call `next()` and the request moves on
- If something is wrong → send a response with `return res.status(...).json(...)` and the controller never runs

### Request flow per route

```
POST /api/signup  →  validateSignup  →  userSignup   →  201
POST /api/login   →  validateLogin   →  userLogin    →  200
GET  /api/users   →  checkToken      →  getAllUsers  →  200
```

```javascript
router.post("/signup", validateSignup, userSignup);
router.post("/login", validateLogin, userLogin);
router.get("/users", checkToken, getAllUsers);
```

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

**3. Create a `.env` file**

```
MONGO_URL=YOUR_MONGODB_URL
PORT=PORT_NUMBER
MY_TOKEN=YOUR_SECRET_KEY
```

**4. Start the server**

```bash
nodemon server
```

---

## 📡 API Endpoints

Base URL: `http://localhost:${PORT}`

| Method | Endpoint      | Middleware       | Description                     |
| ------ | ------------- | ---------------- | ------------------------------- |
| GET    | `/`           | —                | Health check                    |
| POST   | `/api/signup` | `validateSignup` | Register a new user             |
| POST   | `/api/login`  | `validateLogin`  | Log in a user                   |
| GET    | `/api/users`  | `checkToken`     | Get all users' names and emails |

### POST `/api/signup`

```json
{
  "name": "Ahmed",
  "email": "ahmed@gmail.com",
  "password": "Ahmed678"
}
```

| Status | Where            | When                           |
| ------ | ---------------- | ------------------------------ |
| `400`  | `validateSignup` | A field is missing             |
| `400`  | `validateSignup` | Password is under 8 characters |
| `409`  | controller       | Email already registered       |
| `201`  | controller       | User created                   |
| `500`  | controller       | Server error                   |

### POST `/api/login`

```json
{
  "email": "ahmed@gmail.com",
  "password": "Ahmed678"
}
```

| Status | Where           | When                              |
| ------ | --------------- | --------------------------------- |
| `400`  | `validateLogin` | Email or password missing         |
| `401`  | controller      | Email not found or wrong password |
| `200`  | controller      | Login successful                  |
| `500`  | controller      | Server error                      |

### GET `/api/users`

Send the token in a **header** (Postman → Headers tab):

| Key         | Value                               |
| ----------- | ----------------------------------- |
| `token-key` | the value of `MY_TOKEN` from `.env` |

| Status | Where        | When                              |
| ------ | ------------ | --------------------------------- |
| `401`  | `checkToken` | Header not sent                   |
| `401`  | `checkToken` | Header sent with an empty value   |
| `401`  | `checkToken` | Wrong token                       |
| `200`  | controller   | Users returned (or an empty list) |
| `500`  | controller   | Server error                      |

**Success response**

```json
{
  "message": "Users fetched successfully",
  "usersData": [{ "name": "Ahmed", "email": "ahmed@gmail.com" }]
}
```

---

## 🔑 The `checkToken` Middleware

```javascript
const checkToken = (req, res, next) => {
  const token = req.headers["token-key"];

  if (token === undefined) {
    return res.status(401).json({ message: "Please enter token" });
  }

  if (token.trim() === "") {
    return res.status(401).json({ message: "token is missing" });
  }

  if (token !== process.env.MY_TOKEN) {
    return res.status(401).json({ message: "Please enter correct token" });
  }

  next();
};
```

---

## 💡 Lessons Learned (Day 3)

**1. Always `return` before sending a response in middleware.**
Without `return`, code keeps running and tries to send a second response:
`Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`.
One request = one response.

**2. Header names are always lowercase in Node.js.**
`req.headers["Token-Key"]` is always `undefined`. Use `req.headers["token-key"]`. Postman can send it as `Token-Key` — Node lowercases it.

**3. `trim` vs `trim()`.**
`token.trim` only refers to the function and is never equal to `""`. `token.trim()` actually runs it.

**4. Send tokens in headers, not query strings.**
Query strings (`?token=abc`) end up in URLs, browser history and server logs. Headers keep them out of sight — JWT works the same way.

**5. `select()` in Mongoose.**

```javascript
User.find().select("name email -_id");
```

- Field names are **case-sensitive** (`name`, not `Name`)
- No minus = include the field; minus = exclude it
- `_id` is sent by default, so it must be removed with `-_id`
- Password is never selected, so it is never sent

**6. An empty list is still a successful request.**
If there are no users, return `200` with an empty array — the client did nothing wrong, so `400` would be misleading.

**7. `400` vs `401`.**

- `400` — the request **data** is wrong (missing fields, short password)
- `401` — **authentication** failed (missing, empty or wrong token; wrong credentials)

---

## 📝 Middleware — Notes 7

1. Middleware runs between the request and the controller.
2. Middleware receives `req`, `res` and `next`.
3. Call `next()` to pass the request forward.
4. Use `return res.status().json()` to stop the request.
5. Never send two responses for one request.
6. Route-specific middleware goes inside the route: `router.post("/login", validateLogin, userLogin)`.
7. Global middleware goes in `app.js` with `app.use()`.
8. Validation middleware keeps controllers focused on business logic.
9. Protected routes check a token before the controller runs.

---

