# JWT — Day 3 🔐

**Backend Authentication Series** · Part 2 — Full Auth Flow with Bcrypt + Middleware + JWT

Day 3 combines everything learned so far into one project: **Bcrypt** hashes and checks passwords, **middleware** validates requests and protects routes, and **JWT** issues a token at login and verifies it on every protected request.

---

## 🛠️ Tech Stack

- **Node.js** + **Express** — server, routing, middleware
- **MongoDB** + **Mongoose** — database and schema
- **bcrypt** — password hashing and comparison
- **jsonwebtoken** — creating and verifying tokens
- **dotenv** — environment variables
- **nodemon** — auto-restart during development

---

## 📁 Folder Structure

```
Day-3/
├── controllers/
│   ├── signupController.js    # Hash password and create user
│   ├── loginController.js     # Check password and return a JWT
│   └── profileController.js   # Return the logged-in user's profile
├── db/
│   └── db.js                  # MongoDB connection
├── middlewares/
│   ├── validateSignup.js      # Checks signup body
│   ├── validateLogin.js       # Checks login body
│   └── verifyToken.js         # Verifies the JWT
├── models/
│   └── user.js                # User schema & model
├── routes/
│   └── authRoutes.js          # All API routes
├── utils/
│   └── generateToken.js       # Creates a JWT with jwt.sign()
├── app.js                     # Express app + JSON parser + routes
├── server.js                  # Loads env, connects DB, starts server
├── .env                       # Secrets (not pushed to GitHub)
├── .gitignore
└── package.json
```

---

## 🔄 How It Works

```
SIGNUP   →  validateSignup  →  bcrypt.hash()     →  User.create()     →  201
LOGIN    →  validateLogin   →  bcrypt.compare()  →  jwt.sign()        →  200 + token
PROFILE  →  verifyToken     →  jwt.verify()      →  User.findById()   →  200 + profile
```

1. **Signup** — the password is hashed with bcrypt and the user is saved.
2. **Login** — bcrypt compares the password with the stored hash. If it matches, the server creates a JWT containing the user's ID and sends it back.
3. **Profile** — the client sends the token in the `Authorization` header. `verifyToken` checks it with `jwt.verify()`, puts the payload on `req.user`, and the controller uses `req.user.userId` to load that user's profile.

```javascript
router.post("/signup", validateSignup, userSignup);
router.post("/login", validateLogin, userLogin);
router.get("/profile", verifyToken, getProfile);
```

---

## 🚀 How to Run

**1. Install dependencies**

```bash
npm install express mongoose bcrypt jsonwebtoken dotenv
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
PORT=3000
JWT_SECRET=YOUR_SECRET_KEY
JWT_EXPIRES_IN=15m
```

**4. Start the server**

```bash
nodemon server
```

---

## 📡 API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint       | Middleware       | Description                      |
| ------ | -------------- | ---------------- | -------------------------------- |
| GET    | `/`            | —                | Health check                     |
| POST   | `/api/signup`  | `validateSignup` | Register a new user              |
| POST   | `/api/login`   | `validateLogin`  | Log in and receive a JWT         |
| GET    | `/api/profile` | `verifyToken`    | Get the logged-in user's profile |

### POST `/api/signup`

```json
{
  "name": "Ali",
  "email": "ali@gmail.com",
  "password": "ali12345"
}
```

| Status | Where            | When                                                 |
| ------ | ---------------- | ---------------------------------------------------- |
| `400`  | `validateSignup` | A field is missing or password is under 8 characters |
| `409`  | controller       | Email already registered                             |
| `201`  | controller       | User created — returns `userId`                      |
| `500`  | controller       | Server error                                         |

### POST `/api/login`

```json
{
  "email": "ali@gmail.com",
  "password": "ali12345"
}
```

**Success response**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."
}
```

| Status | Where           | When                               |
| ------ | --------------- | ---------------------------------- |
| `400`  | `validateLogin` | Email or password missing          |
| `401`  | controller      | Invalid email or password          |
| `200`  | controller      | Login successful — returns `token` |
| `500`  | controller      | Server error                       |

### GET `/api/profile` 🔒

Send the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

In Thunder Client: **Auth** tab → **Bearer** → paste the token (Thunder Client adds `Bearer ` for you).

| Status | Where         | When                                             |
| ------ | ------------- | ------------------------------------------------ |
| `401`  | `verifyToken` | Header missing or not in `Bearer <token>` format |
| `401`  | `verifyToken` | Token is invalid or tampered with                |
| `401`  | `verifyToken` | Token has expired                                |
| `404`  | controller    | User no longer exists                            |
| `200`  | controller    | Profile returned (without password)              |
| `500`  | controller    | Server error                                     |

---

## 🔑 Key Files

### `utils/generateToken.js` — create a token

```javascript
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
};

export default generateToken;
```

### `middlewares/verifyToken.js` — protect a route

```javascript
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token is missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token has expired, please login again" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default verifyToken;
```

- `split(" ")[1]` removes the word `Bearer` and keeps only the token.
- `jwt.verify()` **throws** an error for invalid or expired tokens, so it must be inside `try/catch`.
- `req.user = decoded` passes the payload (`userId`) on to the controller.

---

## 🧪 Testing Order (Thunder Client)

For signup and login, use the **Body** tab → **JSON**.

1. **Signup** → `201`
2. **Login** with the same email and password → copy the `token`
3. **Profile without token** → `401 Token is missing`
4. **Profile with `Bearer <token>`** → `200` and your profile
5. **Change one letter of the token** → `401 Invalid token`
6. **Set `JWT_EXPIRES_IN=30s`, log in again, wait 30 seconds** → `401 Token has expired`

---

## 💡 Lessons Learned (Day 3)

**1. `find()` vs `findOne()`.**
`find()` always returns an array — and an empty array `[]` is **truthy**, so `if (existingUser)` was always true and every signup returned `409`. `findOne()` returns a document or `null`, which works correctly in an `if`.

| Method      | Found       | Not found | In `if`        |
| ----------- | ----------- | --------- | -------------- |
| `find()`    | `[ {...} ]` | `[]`      | always true ❌ |
| `findOne()` | `{...}`     | `null`    | correct ✅     |

**2. `await` the database connection.**
Without `await connectDB()`, the server starts before the database connects, and a failed connection never reaches the `catch` block.

**3. The `Authorization` header format.**
The header must be named `Authorization` and its value must be `Bearer <token>` — with a space after `Bearer`. A different header name or a missing `Bearer ` prefix gives `401 Token is missing`.

**4. Thunder Client body type.**
For JSON requests, use the **Body** tab → **JSON**. With **Text** or **Form** selected, `req.body` arrives empty and validation middleware rejects the request.

**5. `expiresIn` from `.env` needs a unit.**
`.env` values are strings. `"15m"`, `"1h"` and `"7d"` work as expected, but `"900"` (a string with no unit) is read as **900 milliseconds**. Always include the unit.

**6. Changing `expiresIn` does not affect old tokens.**
The expiry time is stored inside the token (`exp`). After changing it, log in again to get a token with the new expiry.

**7. Never trust the client for the user ID.**
The profile route reads the ID from `req.user.userId` — which comes from the verified token — not from the request body or URL. Each user can only see their own profile.

---

## 📝 JWT Day 3 — Notes

1. Bcrypt verifies the password at login; JWT authenticates every request after login.
2. Generate the token only after the password is verified.
3. Store only non-sensitive data, such as the user ID, in the payload.
4. Send the token in the `Authorization` header as `Bearer <token>`.
5. `jwt.verify(token, secret)` checks the signature and expiry.
6. `jwt.verify()` throws on failure, so wrap it in `try/catch`.
7. `TokenExpiredError` means the token has expired; other errors mean it is invalid.
8. Attach the decoded payload to `req.user` so controllers can use it.
9. Use `.select("-password")` so the password hash is never returned.
10. Keep `JWT_SECRET` and `JWT_EXPIRES_IN` in `.env`, and keep `.env` out of GitHub.

---

