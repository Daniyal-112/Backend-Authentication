# JWT — Day 2 🔑

**Backend Authentication Series** · Part 2 — Token Generation with `jwt.sign()`

Day 2 moves from theory to code: installing `jsonwebtoken`, keeping the secret in `.env`, and generating a signed token with an expiry time using `jwt.sign()`. Verifying tokens with `jwt.verify()` comes next.

---

## 📁 Folder Structure

```
Day-2/
├── generateToken.js    # Creates and prints a signed JWT
├── .env                # JWT_SECRET (not pushed to GitHub)
├── .gitignore          # Ignores node_modules and .env
├── package.json
└── package-lock.json
```

---

## 🚀 How to Run

**1. Install dependencies**

```bash
npm install jsonwebtoken dotenv
```

**2. Enable ES Modules** in `package.json`:

```json
{
  "type": "module"
}
```

**3. Create a `.env` file**

```
JWT_SECRET=YOUR_SECRET_KEY
```

**4. Make sure `.gitignore` contains**

```
node_modules/
.env
```

**5. Run the file**

```bash
node generateToken.js
```

---

## 💻 Code — `generateToken.js`

```javascript
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const token = jwt.sign({ userId: "123" }, process.env.JWT_SECRET, {
  expiresIn: "15m",
});

console.log(token);
```

### What each line does

| Line                             | Purpose                                          |
| -------------------------------- | ------------------------------------------------ |
| `import dotenv from "dotenv"`    | Loads the package that reads `.env`              |
| `import jwt from "jsonwebtoken"` | Loads the JWT library                            |
| `dotenv.config()`                | Puts `.env` values into `process.env`            |
| `{ userId: "123" }`              | The **payload** — data stored in the token       |
| `process.env.JWT_SECRET`         | The **secret key** used to sign the token        |
| `{ expiresIn: "15m" }`           | The **options** — token expires after 15 minutes |
| `console.log(token)`             | Prints the generated token                       |

### Expected Output

A single string with three parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJpYXQiOi...In0.xxxxxxxx
└──────────── header ───────────────┘ └────────── payload ────────────┘ └ signature ┘
```

> The token is different every time you run the file, because the `iat` (issued at) and `exp` (expiry) times change.

Paste it into [jwt.io](https://jwt.io) to see the decoded payload:

```json
{
  "userId": "123",
  "iat": 1760500000,
  "exp": 1760500900
}
```

`jwt.sign()` adds `iat` and `exp` automatically. `exp − iat = 900` seconds = 15 minutes.

> ⚠️ `userId: "123"` is hard-coded only for learning. In a real application the token is generated **after a successful login**, using the logged-in user's real ID.

---

## 📚 Topics Covered

### 1. The `jsonwebtoken` package

```bash
npm install jsonwebtoken
```

```javascript
import jwt from "jsonwebtoken";
```

### 2. `jwt.sign()`

Creates a signed JWT.

```javascript
jwt.sign(payload, secretKey, options);
```

| Argument    | What it is                    | Example                  |
| ----------- | ----------------------------- | ------------------------ |
| `payload`   | Claims about the user         | `{ userId: "123" }`      |
| `secretKey` | Signs the token               | `process.env.JWT_SECRET` |
| `options`   | Extra settings such as expiry | `{ expiresIn: "1h" }`    |

`jwt.sign()` builds the header, encodes the payload and creates the signature — all three parts in one call.

### 3. Environment variables

- Store the JWT secret in `.env`
- Read it with `process.env.JWT_SECRET`
- Call `dotenv.config()` before using it, or the value will be `undefined`
- Keep `.env` out of GitHub with `.gitignore`

### 4. Token expiration — `expiresIn`

Sets how long the token stays valid.

| Value   | Meaning                 |
| ------- | ----------------------- |
| `"15m"` | 15 minutes              |
| `"1h"`  | 1 hour                  |
| `"1d"`  | 1 day                   |
| `"7d"`  | 7 days                  |
| `3600`  | 3600 seconds (= 1 hour) |

`"1h"` and `3600` mean the same thing — a string with a unit, or a number in seconds. Once a token expires, `jwt.verify()` throws a `TokenExpiredError`.

---

## 📝 JWT Day 2 — Notes

**Package:** `jsonwebtoken`

**Install:** `npm install jsonwebtoken`

**Import:** `import jwt from "jsonwebtoken";`

**`jwt.sign()`:** Creates a signed JWT.

**Syntax:** `jwt.sign(payload, secretKey, options)`

- **Payload:** Claims such as user ID.
- **Secret key:** Used to sign the token.
- **Options:** Settings such as token expiration.

**Example:**

```javascript
jwt.sign({ userId: "123" }, process.env.JWT_SECRET, { expiresIn: "1h" });
```

**Environment variables**

- Store the JWT secret in `.env`.
- Access it using `process.env.JWT_SECRET`.
- Keep `.env` out of GitHub using `.gitignore`.

**Token expiration:** `expiresIn: "1h"` means the token expires after one hour.

**Important**

- A JWT payload is not automatically encrypted.
- Do not put passwords or secret keys in the payload.
- Generate tokens only after successful authentication in a real application.
- Do not hard-code user IDs — use the logged-in user's ID.

---

## 🔜 Next Up

**JWT Day 3 — Token Verification:** use `jwt.verify()` to check a token, handle invalid and expired tokens, and build a `verifyToken` middleware to protect routes.
