# JWT — Day 1 🎟️

**Backend Authentication Series** · Part 2 — JSON Web Tokens (Theory)

Day 1 of JWT covers the fundamentals only: what a JWT is, its three parts, how the secret key signs and verifies a token, expiration, and the difference between authentication and authorization. Practical coding (`jsonwebtoken`, `jwt.sign()`, `jwt.verify()`) starts in Day 2.

---

## 📚 Topics Covered

1. What is JWT?
2. JWT authentication flow
3. The three parts: Header, Payload, Signature
4. The JWT secret key (`.env`)
5. Signature verification — why tampered tokens fail
6. Token expiration
7. Authentication vs Authorization
8. `401` vs `403`
9. Bcrypt vs JWT

---

## 1️⃣ What is JWT?

**JWT** stands for **JSON Web Token**.

It is a token format used to securely transmit claims between parties. In web authentication, the server issues a JWT after a successful login, and the client sends it back with every request to a protected route.

**Main purposes**

- Authenticate the user on later requests without sending the password again
- Carry claims such as user ID, role and expiration
- Protect routes — the server validates the token before allowing access

---

## 2️⃣ Authentication Flow

```
1. User logs in with email + password
2. Server checks the password with bcrypt
3. Server creates a JWT signed with its secret key
4. Server sends the token to the user
5. User sends the token with every protected request (in a header)
6. Server verifies the token → allows or rejects the request
```

```
Login      →  bcrypt.compare()  →  jwt.sign()    →  token sent to user
Request    →  token in header   →  jwt.verify()  →  next() or 401
```

---

## 3️⃣ The Three Parts of a JWT

A JWT is one string made of three parts separated by dots:

```
header.payload.signature
```

| Part          | Contains                                    | Can anyone read it?                                   |
| ------------- | ------------------------------------------- | ----------------------------------------------------- |
| **Header**    | Token type and signing algorithm            | Yes                                                   |
| **Payload**   | Claims — user ID, role, expiry time         | Yes                                                   |
| **Signature** | Header + Payload signed with the secret key | Can be read, but cannot be created without the secret |

### Example — secret key is `ali123`

```
JWT_SECRET=ali123
```

**Header**

```json
{ "alg": "HS256", "typ": "JWT" }
```

Base64URL-encoded → `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`

**Payload**

```json
{ "userId": "101", "name": "Ali" }
```

Base64URL-encoded → `eyJ1c2VySWQiOiIxMDEiLCJuYW1lIjoiQWxpIn0`

**Signature**

```
HMAC-SHA256( header + "." + payload , "ali123" )
```

Result → `lFLnDcodQgIzVFQLh5J3WghnhVicpJzZ7KnfIXO1fr8`

**Final token**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMDEiLCJuYW1lIjoiQWxpIn0.lFLnDcodQgIzVFQLh5J3WghnhVicpJzZ7KnfIXO1fr8
```

> Notice that `ali123` does **not** appear anywhere in the token.

### Encode ≠ Encrypt

|                        | Encode (Base64URL) | Encrypt             |
| ---------------------- | ------------------ | ------------------- |
| Needs a key?           | No                 | Yes                 |
| Can anyone reverse it? | Yes                | Only the key holder |
| Purpose                | Make data URL-safe | Hide data           |

The header and payload are only **encoded**, so anyone can decode them (try [jwt.io](https://jwt.io)). JWT does not hide data — it proves the data **has not been changed**.

---

## 4️⃣ The JWT Secret Key

The secret is a value the developer writes in `.env`. It stays **only on the server** and is never sent to the user.

It is used in exactly two places:

| When              | Function                    | What the secret does                     |
| ----------------- | --------------------------- | ---------------------------------------- |
| Login             | `jwt.sign(payload, secret)` | Creates the signature                    |
| Protected request | `jwt.verify(token, secret)` | Re-creates the signature and compares it |

### Simple analogy — secret = 7

Imagine the "signature" formula is `userId × secret`.

| Step                        | Calculation                | Result           |
| --------------------------- | -------------------------- | ---------------- |
| Ali logs in (userId 101)    | `101 × 7 = 707`            | Token: `101.707` |
| Ali sends `101.707`         | `101 × 7 = 707` ✅         | Accepted         |
| Ali changes it to `102.707` | `102 × 7 = 714` ≠ `707` ❌ | Rejected         |

Ali cannot produce the correct signature (`714`) because he does not know the secret is 7. Real JWT uses HMAC-SHA256 instead of multiplication, so the secret also cannot be worked out from the signature.

> **The secret is the server's private stamp.** Everyone can see the stamp on the token, but only the server can create it.

---

## 5️⃣ Signature Verification

Using the same secret `ali123`:

**❌ A hacker signs with their own key (`hacker999`)**

```
LR4WB4dWZl4TMe2Z4FuEADdZtYQuL-iUXDF8vKUdmOk   ← hacker's signature
```

The server verifies with `ali123` → signatures do not match → **rejected**.

**❌ The user edits the payload (`userId: "101"` → `"102"`)**

```
EJy8WxQoX2155OEanC41ut4hByRGIVPV7hi5VNolNtU   ← what the server expects now
lFLnDcodQgIzVFQLh5J3WghnhVicpJzZ7KnfIXO1fr8   ← signature in the token
```

The payload changed but the signature did not → mismatch → **rejected**.

---

## 6️⃣ Token Expiration

The payload usually includes an `exp` claim (expiry time). Once it passes, the server rejects the token even if the signature is valid, and the user must log in again.

- Short expiry limits the damage if a token is stolen.
- Logging in again gives a **new** token, but the old one is not automatically cancelled — it stays valid until it expires.
- Logging out does not revoke a JWT by itself; revocation needs an extra strategy (e.g. a blocklist or refresh tokens).

---

## 7️⃣ Authentication vs Authorization

|              | Authentication       | Authorization                   |
| ------------ | -------------------- | ------------------------------- |
| Question     | **Who** are you?     | **What** are you allowed to do? |
| Example      | Is this token valid? | Is this user an admin?          |
| Failure code | `401 Unauthorized`   | `403 Forbidden`                 |

A valid token proves **who** the user is — it does not mean they can access everything. A normal user with a valid token must still be blocked from admin routes. The role is usually stored in the payload (e.g. `role: "user"`) and checked after the token is verified.

---

## 8️⃣ `401` vs `403`

- **`401 Unauthorized`** — token is missing, invalid or expired (authentication failed)
- **`403 Forbidden`** — token is valid, but the user does not have permission (authorization failed)

---

## 9️⃣ Bcrypt vs JWT

|              | Bcrypt                        | JWT                              |
| ------------ | ----------------------------- | -------------------------------- |
| Job          | Hashes and verifies passwords | Carries claims in a signed token |
| When         | At signup and login           | On every request after login     |
| Stored where | Hash stored in the database   | Token held by the client         |

Bcrypt checks the password **once** at login. JWT proves the user is logged in on **every request after that**.

---

## ❓ Practice Questions

**Q1. A user changes `userId: "123"` to `userId: "999"` in their JWT payload. Will the server accept it?**

No. Changing the payload changes what the signature should be. The user cannot create the matching signature without the server's secret, so verification fails and the request is rejected with `401`.

**Q2. The token's signature is valid, but the token has expired. Will the server accept it?**

No. The server checks the `exp` claim during verification. An expired token is rejected with `401`, and the user must log in again to get a new token.

**Q3. The token is valid and not expired, but a normal user tries to access an admin route. Should the server allow it?**

No. The token proves who the user is (authentication), but the server must also check what they are allowed to do (authorization). Since the user's role is not admin, the server rejects the request with `403`.

---

## 📝 JWT Day 1 — Notes

**Definition**

JWT is a token format used to securely transmit claims between parties. In web authentication, a server can issue a JWT after successful login.

**Main purposes**

- Help authenticate users on subsequent requests.
- Carry claims such as user ID, role, and expiration.
- Help protect routes when the server validates the token.

**Three parts of JWT**

1. Header — token type and signing algorithm.
2. Payload — claims or information about the user.
3. Signature — helps verify token integrity and authenticity.

**Key terms**

- **Authentication:** Verifying who the user is.
- **Authorization:** Checking what the user is allowed to access.
- **JWT Secret:** A secret value stored securely on the server and used to sign and verify tokens when using a symmetric algorithm such as HS256.

**Important security points**

- A signed JWT payload is not automatically encrypted.
- Never store passwords or secret keys in the payload.
- Keep `.env` out of GitHub using `.gitignore`.
- Use token expiration and verify tokens before allowing protected access.
- A JWT is not automatically revoked just because the user logs out; revocation requires an additional strategy.

**Bcrypt vs JWT**

- Bcrypt hashes passwords and compares entered passwords with stored hashes.
- JWT carries claims in a signed token.
- Bcrypt verifies the password at login; JWT can help authenticate later requests.

**Status codes**

- `401 Unauthorized` — token missing, invalid or expired.
- `403 Forbidden` — user is authenticated but lacks permission.

---

## 🔜 Next Up

**JWT Day 2 — Practical Coding:** install `jsonwebtoken`, create tokens with `jwt.sign()`, verify them with `jwt.verify()` in middleware, store the secret in `.env`, and set token expiration.
