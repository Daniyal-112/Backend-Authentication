# Bcrypt 🔐

**Backend Authentication Series** · Part 1 — Password Hashing with Bcrypt

This folder is a day-by-day journey through password security in Node.js: from hashing a single password in a script, to a full signup/login API, to protecting routes with middleware.

---

## 🗺️ Learning Path

```
Day 1  →  Day 2  →  Day 3  →  JWT (next)
Basics    API       Middleware
```

| Day | Folder             | Focus               | What I Built                                                   |
| --- | ------------------ | ------------------- | -------------------------------------------------------------- |
| 1   | [`Day-1`](./Day-1) | Bcrypt fundamentals | A script that hashes and compares a password                   |
| 2   | [`Day-2`](./Day-2) | Signup & Login API  | Express + MongoDB auth API in Model–Route–Controller structure |
| 3   | [`Day-3`](./Day-3) | Middleware          | Validation middleware + a token-protected users route          |

Each folder has its own detailed README with code, notes and lessons learned.

---

## 📅 Day 1 — Bcrypt Basics

**Folder:** [`Day-1`](./Day-1)

**What I learned**

- What Bcrypt is and why passwords must never be stored in plain text
- Hashing vs Encryption — hashing is one-way, encryption can be reversed
- `bcrypt.hash(password, costFactor)` — creates a hash
- Cost factor (salt rounds) — controls computational cost, not seconds
- Random salt — the same password produces different hashes
- `bcrypt.compare(plainPassword, storedHash)` — verifies a password, returns `true` / `false`

**Notes:** 1 – 5

---

## 📅 Day 2 — Signup & Login API

**Folder:** [`Day-2`](./Day-2)

**What I learned**

- Structuring a backend into **models, routes and controllers**
- Connecting to MongoDB with Mongoose and keeping secrets in `.env`
- Creating a `User` schema (`unique`, `trim`, `lowercase`)
- **Signup:** validate → check duplicate email → hash → save
- **Login:** find user → compare password with stored hash
- HTTP status codes: `200`, `201`, `400`, `401`, `409`, `500`
- `User.findOne()` returns the full user document — use `checkUser.password`, not `User.password`

**Endpoints:** `POST /api/signup`, `POST /api/login`

**Notes:** 6

---

## 📅 Day 3 — Middleware

**Folder:** [`Day-3`](./Day-3)

**What I learned**

- What middleware is and how `(req, res, next)` works
- Moving validation out of controllers into `validateSignup` and `validateLogin`
- Protecting a route with a `checkToken` middleware that reads a request header
- Why tokens go in **headers**, not query strings
- Always `return` before sending a response (avoids `ERR_HTTP_HEADERS_SENT`)
- Header names are lowercase in Node.js
- Mongoose `select("name email -_id")` to control returned fields
- `400` vs `401`, and why an empty list still returns `200`

**Endpoints:** `POST /api/signup`, `POST /api/login`, `GET /api/users` (protected)

**Notes:** 7

---

## 🧩 Concepts at a Glance

| Concept                              | Day  |
| ------------------------------------ | ---- |
| Password hashing                     | 1    |
| Hashing vs encryption                | 1    |
| Salt & cost factor                   | 1    |
| `bcrypt.hash()` / `bcrypt.compare()` | 1, 2 |
| Express + MongoDB setup              | 2    |
| Model – Route – Controller structure | 2    |
| Environment variables (`.env`)       | 2    |
| HTTP status codes                    | 2, 3 |
| Middleware & `next()`                | 3    |
| Request validation                   | 3    |
| Protected routes with headers        | 3    |

---

## 🛠️ Tech Stack

- Node.js · Express
- MongoDB · Mongoose
- bcrypt / bcryptjs
- dotenv · nodemon

---

## 🚀 Running Any Day

```bash
cd Bcrypt/Day-X
npm install
```

- **Day 1:** `node main.js`
- **Day 2 & 3:** create a `.env` file (see that day's README), then run `nodemon server`

---

## 📁 Structure

```
Bcrypt/
├── Day-1/     # Bcrypt basics (script)
├── Day-2/     # Signup & login API
├── Day-3/     # Middleware + protected route
└── README.md  # This file
```

---

## 🔜 Next Up

**JWT (JSON Web Tokens)** — generate a token at login and verify it in middleware with `jwt.verify()`, replacing the static token from Day 3.
