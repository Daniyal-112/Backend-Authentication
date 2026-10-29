# JWT — Day 7 🚫

**Backend Authentication Series** · Part 2 — Logout, Token Revocation & Multi-Device Sessions

Day 7 makes refresh tokens **revocable**. Every refresh token is stored (as a hash) in its own `RefreshToken` collection. A refresh only works if its token is still in the database, logout deletes it, and a stolen token stops working the moment it is removed — on one device or on all of them.

---

## 🧠 The Problem: Stateless Tokens

A JWT is **stateless** — the server keeps no record of it. Once issued, `jwt.verify` accepts it until it expires. Before Day 7, logout only deleted the cookie from the client. If someone had copied the refresh token, they could keep creating new access tokens for 7 days.

**Solution:** keep a record of every refresh token on the server.

|                             | Stateless (Day 6) | Stateful refresh token (Day 7)     |
| --------------------------- | ----------------- | ---------------------------------- |
| Server remembers the token? | ❌ No             | ✅ Stored in the database          |
| Copied token after logout   | Works for 7 days  | **Stops working immediately**      |
| Refresh check               | `jwt.verify` only | `jwt.verify` **+ database lookup** |

The **access token stays stateless** — checking the database on every request would be slow. It lives only 15 minutes, so after logout it can be used for at most that long. This is a standard trade-off.

---

## 🗂️ Why a Separate `RefreshToken` Collection?

Refresh tokens are stored in their own collection instead of a field on the user.

|                         | Field on User                                       | Separate `RefreshToken` collection    |
| ----------------------- | --------------------------------------------------- | ------------------------------------- |
| Devices                 | Only **one** — a new login replaces the old session | **One document per device**           |
| Logout                  | Ends every session                                  | Ends **only this device**             |
| Logout from all devices | Not possible                                        | `deleteMany({ user })`                |
| Expired tokens          | Stay in the field                                   | **Deleted automatically** (TTL index) |
| User model              | Mixed with session data                             | Clean — user info only                |

```
users                         refreshtokens
─────────────────             ─────────────────────────────────────
{ _id: A1, name: "Ali" } ◄──  { user: A1, tokenHash: "3e6b…", expiresAt }   ← laptop
                          ◄──  { user: A1, tokenHash: "7a14…", expiresAt }   ← phone
```

---

## 🔁 The Flow

```
LOGIN        → create access + refresh token
             → save hash(refreshToken) as a new RefreshToken document
             → set both cookies

REFRESH      → jwt.verify(refreshToken)              ✗ → 401
             → find document by hash(refreshToken)   ✗ → reuse! delete all user's tokens → 401
             → delete old document
             → create new access + refresh token, save new hash   (rotation)
             → set both cookies

LOGOUT       → delete this device's document → clear cookies
LOGOUT-ALL   → delete every document of this user → clear cookies
```

---

## 🛠️ Tech Stack

- **Node.js** + **Express** — server, routing, middleware
- **MongoDB** + **Mongoose** — database, schemas, TTL index
- **bcrypt** — password hashing and comparison
- **jsonwebtoken** — creating and verifying tokens
- **crypto** (built into Node) — SHA-256 token hashing and random IDs
- **cookie-parser** — reading cookies from requests
- **dotenv** — environment variables
- **nodemon** — auto-restart during development

---

## 📁 Folder Structure

```
Day-7/
├── controllers/
│   ├── signupController.js     # Hash password and create user
│   ├── loginController.js      # Set cookies, save refresh token document
│   ├── refreshController.js    # DB check, rotation, reuse detection
│   ├── logoutController.js     # Logout this device / all devices
│   ├── profileController.js    # Logged-in user's own profile
│   └── usersController.js      # All users (admin only)
├── db/
│   └── db.js                   # MongoDB connection
├── middlewares/
│   ├── validateSignup.js       # Checks signup body
│   ├── validateLogin.js        # Checks login body
│   ├── verifyToken.js          # Verifies the access token → 401
│   └── authorizeRoles.js       # Checks the user's role → 403
├── models/
│   ├── user.js                 # User schema (name, email, password, role)
│   └── refreshToken.js         # One document per active session
├── routes/
│   ├── authRoutes.js           # signup, login, refresh, logout, logout-all, profile
│   └── adminRoutes.js          # /users (admin only)
├── utils/
│   ├── generateToken.js        # Access + refresh token generators
│   ├── cookieOptions.js        # Cookie settings + max age constants
│   ├── hashToken.js            # SHA-256 hash of a token
│   └── saveRefreshToken.js     # Saves a refresh token document
├── app.js                      # Express app + cookie-parser + routes
├── server.js                   # Loads env, connects DB, starts server
├── .env                        # Secrets (not pushed to GitHub)
├── .gitignore
└── package.json
```

---

## 🚀 How to Run

**1. Install dependencies**

```bash
npm install express mongoose bcrypt jsonwebtoken dotenv cookie-parser
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
JWT_ACCESS_SECRET=YOUR_ACCESS_SECRET
JWT_REFRESH_SECRET=YOUR_DIFFERENT_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

**4. Start the server**

```bash
nodemon server
```

---

## 📡 API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint               | Middleware                                | Access                               |
| ------ | ---------------------- | ----------------------------------------- | ------------------------------------ |
| POST   | `/api/auth/signup`     | `validateSignup`                          | Anyone                               |
| POST   | `/api/auth/login`      | `validateLogin`                           | Anyone — creates a session           |
| POST   | `/api/auth/refresh`    | —                                         | Needs a valid, stored `refreshToken` |
| POST   | `/api/auth/logout`     | —                                         | Ends this device's session           |
| POST   | `/api/auth/logout-all` | `verifyToken`                             | Ends every session of the user       |
| GET    | `/api/auth/profile`    | `verifyToken`                             | Any logged-in user                   |
| GET    | `/api/admin/users`     | `verifyToken` → `authorizeRoles("admin")` | **Admin only**                       |

### POST `/api/auth/refresh`

| Status | When                                                                           |
| ------ | ------------------------------------------------------------------------------ |
| `200`  | Token valid and stored → new access + refresh tokens                           |
| `401`  | No refresh token cookie                                                        |
| `401`  | Token invalid or expired (`jwt.verify` failed)                                 |
| `401`  | Token genuine but not in the database — revoked or reused (all sessions ended) |
| `401`  | User no longer exists                                                          |
| `500`  | Database error                                                                 |

### POST `/api/auth/logout` and `/api/auth/logout-all`

| Endpoint      | Deletes                              | Then                |
| ------------- | ------------------------------------ | ------------------- |
| `/logout`     | This device's document only          | Clears both cookies |
| `/logout-all` | Every document of the logged-in user | Clears both cookies |

---

## 🔑 Key Code

### 1. `RefreshToken` model — `models/refreshToken.js`

```javascript
const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

| Field / option                      | Meaning                                                                                                   |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `user` — `ObjectId` + `ref: "User"` | Links each session to its user, like a foreign key. One user can have many sessions.                      |
| `tokenHash` — `unique`              | SHA-256 hash of the token, never the token itself                                                         |
| `expiresAt`                         | When the session ends                                                                                     |
| `timestamps: true`                  | Adds `createdAt` / `updatedAt` — when the session started                                                 |
| TTL index on `expiresAt`            | MongoDB **automatically deletes** a document once `expiresAt` has passed (checked about every 60 seconds) |

### 2. Hashing tokens — `utils/hashToken.js`

```javascript
import crypto from "crypto";

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
```

- The database stores only the hash — if it leaks, the hashes cannot be used as tokens.
- SHA-256 always gives the **same hash for the same input**, so a cookie's token can be found by its hash.
- bcrypt is not needed here: refresh tokens are already long and random, and SHA-256 is fast.

|                           | bcrypt (passwords) | SHA-256 (refresh tokens) |
| ------------------------- | ------------------ | ------------------------ |
| Same input → same output? | No (random salt)   | Yes                      |
| How to check              | `bcrypt.compare()` | Hash it and look it up   |
| Speed                     | Deliberately slow  | Fast                     |

### 3. Unique refresh tokens — `jti`

```javascript
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id, jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" },
  );
};
```

`iat` is measured in **seconds**. Two logins in the same second would otherwise create identical tokens — and identical hashes, breaking the `unique` index. `jti` (JWT ID) adds a random ID so every token is different.

### 4. Saving a session — `utils/saveRefreshToken.js`

```javascript
const saveRefreshToken = async (userId, refreshToken) => {
  await RefreshToken.create({
    user: userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE),
  });
};
```

Used by both login and refresh. `expiresAt` = now + 7 days, the same as the cookie's `maxAge` and the JWT's `expiresIn`, so all three expire together.

### 5. Login creates a new session

```javascript
const accessToken = generateAccessToken(checkUser);
const refreshToken = generateRefreshToken(checkUser);

await saveRefreshToken(checkUser._id, refreshToken);
```

The **same** `refreshToken` variable is saved to the database and sent in the cookie. Each login adds a new document, so every device keeps its own session.

### 6. Refresh — lookup, rotation and reuse detection

```javascript
const storedToken = await RefreshToken.findOne({
  tokenHash: hashToken(refreshToken),
});

if (!storedToken) {
  await RefreshToken.deleteMany({ user: decoded.userId });
  return res
    .status(401)
    .json({ message: "Refresh token revoked, please login again" });
}

await storedToken.deleteOne();

const newAccessToken = generateAccessToken(user);
const newRefreshToken = generateRefreshToken(user);

await saveRefreshToken(user._id, newRefreshToken);
```

| Step                                  | Purpose                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `jwt.verify`                          | Is the token **genuine** and not expired?                                                                     |
| `findOne({ tokenHash })`              | Is the token **still allowed**?                                                                               |
| `storedToken.deleteOne()`             | Rotation — the old token can never be used again                                                              |
| `saveRefreshToken(...)`               | Rotation — the new token becomes the only valid one                                                           |
| `deleteMany({ user })` when not found | **Reuse detection** — a genuine but removed token means it was copied, so every session of that user is ended |

The refresh controller uses **two `try` blocks**: one for `jwt.verify` (bad token → `401`) and one for database work (server problem → `500`).

### 7. Logout — one device or all devices

```javascript
export const userLogout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await RefreshToken.deleteOne({ tokenHash: hashToken(refreshToken) });
  }

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
  // ...
};

export const logoutAllDevices = async (req, res) => {
  await RefreshToken.deleteMany({ user: req.user.userId });

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
  // ...
};
```

|         | `deleteOne`          | `deleteMany`                |
| ------- | -------------------- | --------------------------- |
| Removes | The first match only | Every match                 |
| Used in | Logout (this device) | Logout all, reuse detection |

### 8. Which routes use `verifyToken`?

```javascript
router.post("/refresh", refreshAccessToken);
router.post("/logout", userLogout);
router.post("/logout-all", verifyToken, logoutAllDevices);
```

| Route         | `verifyToken`? | Why                                                                          |
| ------------- | -------------- | ---------------------------------------------------------------------------- |
| `/refresh`    | ❌             | Called exactly when the access token has expired                             |
| `/logout`     | ❌             | Uses the refresh token cookie; must work even after the access token expires |
| `/logout-all` | ✅             | Needs `req.user.userId` to know whose sessions to delete                     |

---

## 🧪 Testing (Postman / Thunder Client)

Open `users` and `refreshtokens` in MongoDB Compass while testing. To act as "another device", copy a `refreshToken` cookie value and send it manually in **Headers** as `Cookie: refreshToken=<value>`.

### Sessions

| #   | Steps   | Expected                                   |
| --- | ------- | ------------------------------------------ |
| 1   | Login   | `200`, one new document in `refreshtokens` |
| 2   | Refresh | `200`, old document gone, new one created  |
| 3   | Logout  | `200`, document deleted                    |
| 4   | Refresh | `401`                                      |

### Copied token after logout

| #   | Steps                               | Expected        |
| --- | ----------------------------------- | --------------- |
| 1   | Login → copy `refreshToken`         |                 |
| 2   | Logout                              | `200`           |
| 3   | Send the copied token to `/refresh` | `401` — revoked |

### Multi-device

| #   | Steps                                 | Expected                       |
| --- | ------------------------------------- | ------------------------------ |
| 1   | Login → copy token as **Laptop**      | 1 document                     |
| 2   | Login again → copy token as **Phone** | 2 documents                    |
| 3   | Logout with **Phone**                 | 1 document left                |
| 4   | Refresh with **Laptop**               | `200` — laptop still logged in |

### Reuse detection

| #   | Steps                           | Expected                                       |
| --- | ------------------------------- | ---------------------------------------------- |
| 1   | Login → copy token **A**        |                                                |
| 2   | Refresh (new token **B** saved) | `200`                                          |
| 3   | Send **A** to `/refresh`        | `401`, **all** of the user's documents deleted |
| 4   | Refresh with **B**              | `401` — every session ended                    |

### Logout all devices

| #   | Steps                       | Expected                         |
| --- | --------------------------- | -------------------------------- |
| 1   | Login 3 times               | 3 documents                      |
| 2   | `POST /api/auth/logout-all` | `200`, 0 documents for this user |

### TTL index

In Compass, `refreshtokens` → **Indexes**: `expiresAt_1` shows **TTL**, `tokenHash_1` shows **UNIQUE**.

---

## 📝 JWT Day 7 — Notes

1. A JWT is stateless; the server cannot cancel it before it expires on its own.
2. Store refresh tokens on the server to make them revocable.
3. Store a **SHA-256 hash** of the refresh token, never the token itself.
4. Keep sessions in a separate `RefreshToken` collection — one document per device.
5. Link each session to its user with `ObjectId` and `ref: "User"`.
6. A TTL index on `expiresAt` deletes expired sessions automatically.
7. Add a random `jti` so every refresh token is unique.
8. `jwt.verify` proves a token is genuine; the database lookup proves it is still allowed.
9. Refresh token rotation deletes the old token and saves a new one on every refresh.
10. A genuine token that is missing from the database means reuse — end all of the user's sessions.
11. `/logout` deletes one session; `/logout-all` deletes every session of the user.
12. `/refresh` and `/logout` do not use `verifyToken`; `/logout-all` does.
13. Access tokens remain stateless, so they stay valid until their short expiry.

---

## 🔜 Next Up

**JWT Day 8 — Security Best Practices:** centralized error-handling middleware, rate limiting on login with `express-rate-limit`, security headers with `helmet`, and generating strong secrets.
