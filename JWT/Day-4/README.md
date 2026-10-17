# JWT — Day 4 👮

**Backend Authentication Series** · Part 2 — Role-Based Authorization

Day 4 adds **roles** to the auth system from Day 3. Every user can sign up, log in and view their own profile, but only an **admin** can view the list of all users. This is done by storing a `role` on each user, putting it inside the JWT, and checking it with an `authorizeRoles` middleware.

---

## 🧠 Authentication vs Authorization

|              | Authentication     | Authorization                   |
| ------------ | ------------------ | ------------------------------- |
| Question     | **Who** are you?   | **What** are you allowed to do? |
| Handled by   | `verifyToken`      | `authorizeRoles`                |
| Failure code | `401 Unauthorized` | `403 Forbidden`                 |

```
Request → verifyToken (who?) → authorizeRoles (allowed?) → Controller
              ❌ 401                  ❌ 403
```

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
Day-4/
├── controllers/
│   ├── signupController.js    # Hash password and create user
│   ├── loginController.js     # Check password, return JWT with role
│   ├── profileController.js   # Logged-in user's own profile
│   └── usersController.js     # All users (admin only)
├── db/
│   └── db.js                  # MongoDB connection
├── middlewares/
│   ├── validateSignup.js      # Checks signup body
│   ├── validateLogin.js       # Checks login body
│   ├── verifyToken.js         # Verifies the JWT → 401
│   └── authorizeRoles.js      # Checks the user's role → 403
├── models/
│   └── user.js                # User schema with role field
├── routes/
│   ├── authRoutes.js          # /signup, /login, /profile
│   └── adminRoutes.js         # /users (admin only)
├── utils/
│   └── generateToken.js       # jwt.sign() with userId + role
├── app.js                     # Express app + routes
├── server.js                  # Loads env, connects DB, starts server
├── .env                       # Secrets (not pushed to GitHub)
├── .gitignore
└── package.json
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

| Method | Endpoint            | Middleware                                | Access             |
| ------ | ------------------- | ----------------------------------------- | ------------------ |
| POST   | `/api/auth/signup`  | `validateSignup`                          | Anyone             |
| POST   | `/api/auth/login`   | `validateLogin`                           | Anyone             |
| GET    | `/api/auth/profile` | `verifyToken`                             | Any logged-in user |
| GET    | `/api/admin/users`  | `verifyToken` → `authorizeRoles("admin")` | **Admin only**     |

### POST `/api/auth/signup`

```json
{
  "name": "Ali",
  "email": "ali@gmail.com",
  "password": "ali12345"
}
```

Every new user gets `role: "user"` automatically. A `role` sent in the body is **ignored**.

### POST `/api/auth/login`

**Success response**

```json
{
  "message": "Login successful",
  "role": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."
}
```

### GET `/api/auth/profile` 🔒

Returns only the logged-in user's own profile (without password).

### GET `/api/admin/users` 🔒👮

**Admin response**

```json
{
  "message": "Users fetched successfully",
  "count": 3,
  "users": [
    { "_id": "...", "name": "Ali", "email": "ali@gmail.com" },
    { "_id": "...", "name": "Ahmed", "email": "ahmed@gmail.com" },
    { "_id": "...", "name": "Sara", "email": "sara@gmail.com" }
  ]
}
```

**Normal user response** — `403`

```json
{ "message": "Access denied" }
```

---

## 🔑 Key Code

### 1. `role` in the User model

```javascript
role: {
  type: String,
  enum: ["user", "admin"],
  default: "user",
},
```

- `enum` — only `"user"` or `"admin"` is allowed
- `default` — every new user starts as a normal user

### 2. `role` in the JWT payload

```javascript
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" },
  );
};
```

After `verifyToken`, the role is available as `req.user.role`.

### 3. `authorizeRoles` middleware

```javascript
const authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }
    next();
  };
};

export default authorizedRoles;
```

- `...roles` collects all allowed roles into an array — `authorizedRoles("admin")` → `["admin"]`
- It **returns a middleware function**, which is why it is called with brackets in the route
- `roles.includes(req.user.role)` checks whether the user's role is in the allowed list

### 4. Route order

```javascript
router.get("/users", verifyToken, authorizedRoles("admin"), getAllUsers);
```

`verifyToken` must run first, because it creates `req.user`. `authorizedRoles` needs `req.user.role`.

---

## 👑 Making an Admin

An admin is **never** created from the signup request. The first admin is set directly in the database.

**MongoDB Compass**

1. Open the database → `users` collection
2. Edit the user's document → change `role` from `"user"` to `"admin"` → **Update**

**Or with mongosh**

```javascript
db.users.updateOne({ email: "ali@gmail.com" }, { $set: { role: "admin" } });
```

Then **log in again** — the old token still contains the old role.

---

## 🧪 Testing Order (Thunder Client)

Use the **Body** tab → **JSON** for signup and login, and the **Auth** tab → **Bearer** for protected routes.

1. **Sign up** Ali, Ahmed and Sara → `201` each
2. In Compass, set **Ali's** role to `"admin"`
3. **Ahmed** (user) logs in → `role: "user"`
   - `GET /api/auth/profile` → `200`, Ahmed's profile
   - `GET /api/admin/users` → `403 Access denied`
4. **Ali** (admin) logs in → `role: "admin"`
   - `GET /api/auth/profile` → `200`, Ali's profile
   - `GET /api/admin/users` → `200`, all users' names and emails
5. **Error cases**

| Test                                  | Expected                              |
| ------------------------------------- | ------------------------------------- |
| No token                              | `401 Token is missing`                |
| Tampered token                        | `401 Invalid token`                   |
| Normal user on admin route            | `403 Access denied`                   |
| Signup with `"role": "admin"` in body | `201`, but role saved as `"user"`     |
| Role changed in DB, old token used    | Old role still applies until re-login |

---

## 💡 Lessons Learned (Day 4)

**1. Names must match everywhere.**
The model used `roles` while the token and middleware used `role`. `req.user.roles` was `undefined`, and `["admin"].includes(undefined)` is always `false` — so even the admin got `403`. JavaScript gave no error, just a wrong result. The field name must be identical in the **model**, the **token payload** and the **middleware**.

**2. `console.log(req.user)` is the best debugging tool.**
Printing the decoded token instantly showed which key existed (`role`) and which one the code was looking for (`roles`).

**3. Never trust the client with permissions.**
If signup accepted `req.body.role`, anyone could send `"role": "admin"` and take over the system. Permissions are decided only by the server or the database.

**4. The role inside a token is a snapshot.**
The role is saved into the token at login. Changing it in the database does not update existing tokens — the user must log in again.

**5. Import paths are case-sensitive on Linux.**
`validateSIgnup.js` worked on Windows but would fail on a Linux server with "Cannot find module". The import must match the exact file name.

**6. Split routes by responsibility.**
`authRoutes` handles signup, login and profile. `adminRoutes` handles admin-only routes, mounted at `/api/admin`.

---

## 📝 JWT Day 4 — Notes

1. Authentication = who the user is. Authorization = what the user can access.
2. Add a `role` field to the user model with `enum` and `default: "user"`.
3. Never accept `role` from the signup request body.
4. Include `role` in the JWT payload at login.
5. `authorizeRoles(...roles)` returns a middleware that checks `req.user.role`.
6. Always run `verifyToken` before `authorizeRoles`.
7. Missing, invalid or expired token → `401`. Valid token but wrong role → `403`.
8. A role change takes effect only after the user logs in again.
9. Use the same field name in the model, the token and the middleware.
10. Create the first admin directly in the database.

---

## 🔜 Next Up

**JWT Day 5 — Tokens in Cookies:** send the token in an `httpOnly` cookie instead of the response body, read it with `cookie-parser`, and clear it on logout.
