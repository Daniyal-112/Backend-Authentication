# JWT — Day 5 🍪

**Backend Authentication Series** · Part 2 — Storing JWT in httpOnly Cookies

Day 5 moves the token out of the response body and into an **httpOnly cookie**. The server sets the cookie at login, the client sends it back automatically on every request, and the server clears it at logout. Role-based access from Day 4 keeps working exactly the same.

---

## 🧠 Why Cookies?

Until Day 4, the token was returned in the JSON response. In a real frontend it usually ends up in `localStorage`, and the client must attach it to every request manually as `Authorization: Bearer <token>`.

The problem: **any JavaScript running on the page can read `localStorage`**. If a malicious script gets onto the site (an **XSS** attack), it can steal the token.

An **httpOnly cookie** solves this:

|                                   | localStorage                      | httpOnly Cookie |
| --------------------------------- | --------------------------------- | --------------- |
| Readable by JavaScript?           | ✅ Yes — exposed to XSS           | ❌ No           |
| Sent automatically with requests? | ❌ No — must be attached manually | ✅ Yes          |
| Who sets it?                      | Frontend                          | Server          |

---

## 🍪 What is a Cookie?

A cookie is a small piece of data the **server gives to the client**. The client stores it and **sends it back automatically** with every request to the same server.

```
LOGIN     Server ──► Set-Cookie: token=eyJhbG...       (server gives the cookie)
                     Client stores it

REQUEST   Client ──► Cookie: token=eyJhbG...           (client sends it back automatically)
                     Server reads it and verifies the JWT

LOGOUT    Server ──► Set-Cookie: token=; Expires=1970  (server tells client to delete it)
```

---

## 🔁 `req` vs `res` for Cookies

This is the key rule of Day 5:

| Action                     | Object | Code                                  | Why                                                |
| -------------------------- | ------ | ------------------------------------- | -------------------------------------------------- |
| **Set** a cookie           | `res`  | `res.cookie("token", token, options)` | The server is sending an instruction to the client |
| **Read / access** a cookie | `req`  | `req.cookies.token`                   | The client sent the cookie with the request        |
| **Delete** a cookie        | `res`  | `res.clearCookie("token", options)`   | The server is telling the client to remove it      |

**Simple way to remember:**

- `req` = what the client **sent** → read things from it (`req.body`, `req.cookies`, `req.headers`, `req.user`)
- `res` = what the server **sends back** → set or send things with it (`res.status()`, `res.json()`, `res.cookie()`, `res.clearCookie()`)

| Where              | What happens      | Code                   |
| ------------------ | ----------------- | ---------------------- |
| `loginController`  | Set the cookie    | `res.cookie(...)`      |
| `verifyToken`      | Read the cookie   | `req.cookies.token`    |
| `logoutController` | Delete the cookie | `res.clearCookie(...)` |

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
Day-5/
├── controllers/
│   ├── signupController.js     # Hash password and create user
│   ├── loginController.js      # Check password, set JWT cookie
│   ├── logoutController.js     # Clear JWT cookie
│   ├── profileController.js    # Logged-in user's own profile
│   └── usersController.js      # All users (admin only)
├── db/
│   └── db.js                   # MongoDB connection
├── middlewares/
│   ├── validateSignup.js       # Checks signup body
│   ├── validateLogin.js        # Checks login body
│   ├── verifyToken.js          # Reads JWT from cookie → 401
│   └── authorizeRoles.js       # Checks the user's role → 403
├── models/
│   └── user.js                 # User schema with role field
├── routes/
│   ├── authRoutes.js           # /signup, /login, /logout, /profile
│   └── adminRoutes.js          # /users (admin only)
├── utils/
│   ├── generateToken.js        # jwt.sign() with userId + role
│   └── cookieOptions.js        # Shared cookie settings
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
PORT=
JWT_SECRET=YOUR_SECRET_KEY
JWT_EXPIRES_IN=
```

**4. Start the server**

```bash
nodemon server
```

---

## 📡 API Endpoints

Base URL: `http://localhost:3000`

| Method | Endpoint            | Middleware                                | Access                     |
| ------ | ------------------- | ----------------------------------------- | -------------------------- |
| POST   | `/api/auth/signup`  | `validateSignup`                          | Anyone                     |
| POST   | `/api/auth/login`   | `validateLogin`                           | Anyone — sets the cookie   |
| POST   | `/api/auth/logout`  | —                                         | Anyone — clears the cookie |
| GET    | `/api/auth/profile` | `verifyToken`                             | Any logged-in user         |
| GET    | `/api/admin/users`  | `verifyToken` → `authorizeRoles("admin")` | **Admin only**             |

### POST `/api/auth/login`

The token is **no longer in the response body**:

```json
{
  "message": "Login successful",
  "role": "user"
}
```

It is in the response **header** instead:

```
Set-Cookie: token=eyJhbGciOi...; Max-Age=900; Path=/; HttpOnly; SameSite=Strict
```

### POST `/api/auth/logout`

```json
{ "message": "Logout successful" }
```

Response header:

```
Set-Cookie: token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict
```

---

## 🔑 Key Code

### 1. Shared cookie options — `utils/cookieOptions.js`

```javascript
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

export default cookieOptions;
```

| Option               | Meaning                                                                     | Protects against                 |
| -------------------- | --------------------------------------------------------------------------- | -------------------------------- |
| `httpOnly: true`     | JavaScript cannot read the cookie                                           | XSS (token theft)                |
| `secure`             | Cookie is sent only over HTTPS — `true` in production, `false` on localhost | Reading the token on the network |
| `sameSite: "strict"` | Cookie is sent only with requests from our own site                         | CSRF                             |

These options are kept in one file because **login and logout must use the same ones** — the browser only deletes a cookie when the options match.

### 2. Set the cookie — `loginController.js`

```javascript
const token = generateToken(checkUser);

res.cookie("token", token, {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000,
});

return res.status(200).json({
  message: "Login successful",
  role: checkUser.role,
});
```

- `...cookieOptions` copies the three shared options into this object
- `maxAge` is in **milliseconds** — `15 * 60 * 1000` = 15 minutes
- `maxAge` should match the token's `expiresIn`, so the cookie and the token expire together

**Why `maxAge` is not in `cookieOptions`:** `cookieOptions` is also passed to `res.clearCookie()`. Clearing a cookie works by setting its expiry to the past (1970). A lifetime option like `maxAge` belongs only where the cookie is created, not where it is deleted.

| Option type             | Examples                                 | Login | Logout |
| ----------------------- | ---------------------------------------- | ----- | ------ |
| Identity — which cookie | `httpOnly`, `secure`, `sameSite`, `path` | ✅    | ✅     |
| Lifetime — how long     | `maxAge`, `expires`                      | ✅    | ❌     |

### 3. Read the cookie — `app.js` + `verifyToken.js`

Express does not read cookies on its own. `cookie-parser` turns the raw `Cookie` header into an object:

```javascript
import cookieParser from "cookie-parser";

app.use(express.json());
app.use(cookieParser()); // must come before the routes
```

```
Raw header:  token=eyJhbGciOi...
req.cookies: { token: 'eyJhbGciOi...' }
```

```javascript
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }

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
```

Only the first line changed from Day 4 — the token now comes from `req.cookies.token` instead of the `Authorization` header. The rest of the flow (`jwt.verify`, `req.user`, `authorizeRoles`) is unchanged.

### 4. Delete the cookie — `logoutController.js`

```javascript
import cookieOptions from "../utils/cookieOptions.js";

const userLogout = (req, res) => {
  res.clearCookie("token", cookieOptions);

  return res.status(200).json({
    message: "Logout successful",
  });
};
```

⚠️ Logout removes the cookie from the client only. If someone had already copied the token, it stays valid until its `exp`. Handling this is the topic of **Token Revocation**.

---

## 🔍 Seeing the Cookie Flow

| Step                  | Where to look                               | What you see                                   |
| --------------------- | ------------------------------------------- | ---------------------------------------------- |
| Login                 | Response → **Headers** / **Cookies**        | `Set-Cookie: token=...; HttpOnly`              |
| Any protected request | Postman **Console** → Request Headers       | `Cookie: token=...` (added automatically)      |
| Server side           | `console.log(req.cookies)` in `verifyToken` | `{ token: '...' }`                             |
| Logout                | Response → **Headers**                      | `Set-Cookie: token=; Expires=Thu, 01 Jan 1970` |

---

## 🧪 Testing (Postman / Thunder Client)

Both tools store cookies and send them automatically, like a browser. Leave **Authorization** as **No Auth** — no Bearer token is needed.

1. **Signup** Ali and Ahmed → `201`
2. In MongoDB Compass, set **Ali's** role to `"admin"`
3. **Login as Ahmed** → `200`, no token in the body, `token` in the **Cookies** tab
4. `GET /api/auth/profile` → `200`, Ahmed's profile
5. `GET /api/admin/users` → `403 Access denied`
6. `POST /api/auth/logout` → `200`, cookie removed
7. `GET /api/auth/profile` → `401 Token is missing`
8. **Login as Ali** → `GET /api/admin/users` → `200`, all users

---

## 📝 JWT Day 5 — Notes

1. A cookie is small data the server sets and the client sends back automatically.
2. `localStorage` can be read by any JavaScript, so it is exposed to XSS.
3. An `httpOnly` cookie cannot be read by JavaScript.
4. **Set** a cookie with `res.cookie(name, value, options)`.
5. **Read** a cookie with `req.cookies.name` (requires `cookie-parser`).
6. **Delete** a cookie with `res.clearCookie(name, options)`.
7. `req` is for reading what the client sent; `res` is for sending or setting things back.
8. `secure: true` sends the cookie only over HTTPS — use it in production.
9. `sameSite: "strict"` helps protect against CSRF.
10. `maxAge` is in milliseconds, unlike `jwt.sign`'s `expiresIn`.
11. Keep identity options shared between login and logout; add `maxAge` only at login.
12. `app.use(cookieParser())` must come before the routes.
13. Clearing the cookie does not invalidate a token that was already copied.

---

## 🔜 Next Up

**JWT Day 6 — Access Token + Refresh Token:** a short-lived access token with a long-lived refresh token, and a `/refresh` route that issues a new access token so users don't have to log in again every 15 minutes.
