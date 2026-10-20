# JWT — Day 6 🔄

**Backend Authentication Series** · Part 2 — Access Token + Refresh Token

Day 6 replaces the single token with **two tokens**: a short-lived **access token** for every protected request, and a long-lived **refresh token** that is used only to get a new access token. Users stay logged in for days, while a stolen access token stops working within minutes.

---

## 🧠 Why Two Tokens?

| Single token       | Problem                                               |
| ------------------ | ----------------------------------------------------- |
| Short expiry (15m) | Safe, but the user must log in again every 15 minutes |
| Long expiry (7d)   | Convenient, but a stolen token works for 7 days       |

Two tokens give both safety and convenience:

|          | Access Token                                  | Refresh Token                  |
| -------- | --------------------------------------------- | ------------------------------ |
| Lifetime | Short — `15m`                                 | Long — `7d`                    |
| Used for | Every protected request                       | Only to get a new access token |
| Sent to  | Protected routes (`/profile`, `/admin/users`) | Only `POST /api/auth/refresh`  |
| Secret   | `JWT_ACCESS_SECRET`                           | `JWT_REFRESH_SECRET`           |
| Payload  | `userId`, `role`                              | `userId`                       |
| Cookie   | `accessToken`                                 | `refreshToken`                 |

**Analogy:** the access token is a **daily gate pass** — it expires every day. The refresh token is your **office ID card** — when the gate pass expires, you show the ID card at reception and get a new gate pass. You don't show the ID card at every door, only at reception.

---

## 🔁 The Flow

```
LOGIN        → accessToken (15m) + refreshToken (7d), both in httpOnly cookies

REQUEST      → accessToken is verified → ✅ access granted

15 min later → accessToken expires → 401
             → client calls POST /api/auth/refresh (refreshToken cookie sent automatically)
             → server verifies refreshToken → issues a NEW accessToken
             → client repeats the request → ✅

7 days later → refreshToken expires → user must log in again

LOGOUT       → both cookies cleared
```

In a React frontend, the "401 → refresh → retry" step happens automatically in the background, so the user never notices.

---

## 🔐 Why Separate Secrets?

If both tokens were signed with the same secret, a refresh token could be sent in place of an access token and `jwt.verify` would accept it — turning it into a 7-day access token. With separate secrets, each token only works in its own place:

| Token sent    | To              | Result                                    |
| ------------- | --------------- | ----------------------------------------- |
| Access token  | Protected route | ✅ Accepted                               |
| Refresh token | Protected route | ❌ `401 Invalid access token`             |
| Refresh token | `/refresh`      | ✅ Accepted                               |
| Access token  | `/refresh`      | ❌ `401 Invalid or expired refresh token` |

---

## 🛠️ Tech Stack

- **Node.js** + **Express** — server, routing, middleware
- **MongoDB** + **Mongoose** — database and schema
- **bcrypt** — password hashing and comparison
- **jsonwebtoken** — creating and verifying tokens
- **cookie-parser** — reading cookies from requests
- **dotenv** — environment variables
- **nodemon** — auto-restart during development

---

## 📁 Folder Structure

```
Day-6/
├── controllers/
│   ├── signupController.js     # Hash password and create user
│   ├── loginController.js      # Set access + refresh token cookies
│   ├── refreshController.js    # Issue a new access token
│   ├── logoutController.js     # Clear both cookies
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
│   └── user.js                 # User schema with role field
├── routes/
│   ├── authRoutes.js           # signup, login, refresh, logout, profile
│   └── adminRoutes.js          # /users (admin only)
├── utils/
│   ├── generateToken.js        # generateAccessToken + generateRefreshToken
│   └── cookieOptions.js        # Cookie settings + max age constants
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

The two secrets must be **different**.

**4. Start the server**

```bash
nodemon server
```

---

## 📡 API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint            | Middleware                                | Access                              |
| ------ | ------------------- | ----------------------------------------- | ----------------------------------- |
| POST   | `/api/auth/signup`  | `validateSignup`                          | Anyone                              |
| POST   | `/api/auth/login`   | `validateLogin`                           | Anyone — sets both cookies          |
| POST   | `/api/auth/refresh` | —                                         | Needs a valid `refreshToken` cookie |
| POST   | `/api/auth/logout`  | —                                         | Anyone — clears both cookies        |
| GET    | `/api/auth/profile` | `verifyToken`                             | Any logged-in user                  |
| GET    | `/api/admin/users`  | `verifyToken` → `authorizeRoles("admin")` | **Admin only**                      |

### POST `/api/auth/login`

```json
{ "message": "Login successful", "role": "user" }
```

Response headers:

```
Set-Cookie: accessToken=eyJ...; Max-Age=900; Path=/; HttpOnly; SameSite=Strict
Set-Cookie: refreshToken=eyJ...; Max-Age=604800; Path=/; HttpOnly; SameSite=Strict
```

### POST `/api/auth/refresh`

| Status | When                             | Message                                                |
| ------ | -------------------------------- | ------------------------------------------------------ |
| `200`  | Refresh token valid              | `Access token refreshed` (+ new `accessToken` cookie)  |
| `401`  | No refresh token cookie          | `Refresh token is missing, please login again`         |
| `401`  | User no longer exists            | `User not found, please login again`                   |
| `401`  | Refresh token invalid or expired | `Invalid or expired refresh token, please login again` |

### Protected routes — `verifyToken`

| Status | When                    | Message                                    |
| ------ | ----------------------- | ------------------------------------------ |
| `401`  | No access token cookie  | `Access token is missing`                  |
| `401`  | Access token expired    | `Access token has expired, please refresh` |
| `401`  | Access token invalid    | `Invalid access token`                     |
| `403`  | Valid token, wrong role | `Access denied`                            |

---

## 🔑 Key Code

### 1. Two token generators — `utils/generateToken.js`

```javascript
import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" },
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
};
```

- One file exports **two functions**, so it uses **named exports** (`export const`) instead of `export default`
- Named exports are imported with curly braces: `import { generateAccessToken } from "../utils/generateToken.js"`
- The refresh token carries only `userId`. The role is read fresh from the database during refresh.

### 2. Cookie settings — `utils/cookieOptions.js`

```javascript
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

export const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
```

Each cookie's `maxAge` matches its token's `expiresIn`, so the cookie and the token expire together.

### 3. Login sets both cookies

```javascript
const accessToken = generateAccessToken(checkUser);
const refreshToken = generateRefreshToken(checkUser);

res.cookie("accessToken", accessToken, {
  ...cookieOptions,
  maxAge: ACCESS_TOKEN_MAX_AGE,
});

res.cookie("refreshToken", refreshToken, {
  ...cookieOptions,
  maxAge: REFRESH_TOKEN_MAX_AGE,
});
```

### 4. Refresh controller — `controllers/refreshController.js`

```javascript
const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token is missing, please login again",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        message: "User not found, please login again",
      });
    }

    const newAccessToken = generateAccessToken(user);

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    return res.status(200).json({ message: "Access token refreshed" });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired refresh token, please login again",
    });
  }
};
```

**Step by step:**

1. Read the refresh token from `req.cookies.refreshToken`
2. Verify it with the **refresh secret**
3. Load the user from the database with `User.findById` — this gives the **current role** and confirms the user still exists
4. Create a new access token and set it as the `accessToken` cookie

**Why read the role from the database?** If an admin changes a user's role, the change applies at the next refresh — the user does not have to log in again.

### 5. `verifyToken` checks the access token

```javascript
const token = req.cookies.accessToken;
// ...
const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
req.user = decoded;
```

### 6. Logout clears both cookies

```javascript
res.clearCookie("accessToken", cookieOptions);
res.clearCookie("refreshToken", cookieOptions);
```

### 7. Refresh route has no `verifyToken`

```javascript
router.post("/refresh", refreshAccessToken);
```

`/refresh` is called exactly when the access token has expired, so `verifyToken` must not run on it — it would block the request.

---

## 🧪 Testing (Postman / Thunder Client)

For a quick test, set `JWT_ACCESS_EXPIRES_IN=30s` and `ACCESS_TOKEN_MAX_AGE = 30 * 1000`, then restart the server. Change them back to 15 minutes afterwards.

| #   | Request                                                                                    | Expected                                               |
| --- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| 1   | `POST /api/auth/signup` (Ali, Ahmed)                                                       | `201`                                                  |
| 2   | `POST /api/auth/login` (Ahmed)                                                             | `200`, two cookies: `accessToken` + `refreshToken`     |
| 3   | `GET /api/auth/profile`                                                                    | `200`                                                  |
| 4   | Wait 30 seconds → `GET /api/auth/profile`                                                  | `401`                                                  |
| 5   | `POST /api/auth/refresh`                                                                   | `200 Access token refreshed`, new `accessToken` cookie |
| 6   | `GET /api/auth/profile`                                                                    | `200` — no login needed                                |
| 7   | In Compass set Ahmed's role to `admin` → `POST /api/auth/refresh` → `GET /api/admin/users` | `200` — role updated on refresh                        |
| 8   | `POST /api/auth/logout`                                                                    | `200`, both cookies removed                            |
| 9   | `POST /api/auth/refresh`                                                                   | `401 Refresh token is missing`                         |

---

## ⚠️ Current Limitation

The refresh token is **stateless** — the server keeps no record of it. If someone copied a refresh token before logout, they can keep creating new access tokens until it expires (7 days). This is solved by **storing refresh tokens in the database** and deleting them on logout.

---

## 📝 JWT Day 6 — Notes

1. An access token is short-lived and used on every protected request.
2. A refresh token is long-lived and used only to get a new access token.
3. Use separate secrets for access and refresh tokens.
4. Put `role` only in the access token; read it fresh from the database during refresh.
5. Store both tokens in httpOnly cookies, each with a `maxAge` matching its expiry.
6. When the access token expires, call `/refresh` instead of logging in again.
7. Do not put `verifyToken` on the `/refresh` route.
8. When the refresh token expires, the user must log in again.
9. Logout clears both cookies.
10. A file that exports several functions uses named exports, imported with `{ }`.
11. A stateless refresh token cannot be revoked until it is stored on the server.

---

## 🔜 Next Up

**JWT Day 7 — Logout & Token Revocation:** save refresh tokens in the database, delete them on logout, and reject any refresh token that is no longer stored — so a copied token stops working immediately.
