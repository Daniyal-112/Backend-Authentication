# Bcrypt — Day 1 🔐

**Backend Authentication Series** · Password hashing with Bcrypt in Node.js

This folder covers the basics of Bcrypt: what password hashing is, the difference between hashing and encryption, and how `bcrypt.hash()` and `bcrypt.compare()` work.

---

## 📁 Folder Structure

```
Backend-Authentication/
└── Bcrypt/
    └── Day-1/
        ├── main.js         # Hashing + comparison practice code
        ├── package.json
        └── README.md
```

---

## 🚀 How to Run

**1. Install the package**

```bash
npm install bcryptjs
```

**2. Enable ES Modules** — add this to `package.json`:

```json
{
  "type": "module"
}
```

**3. Run the file**

```bash
node main.js
```

---

## 💻 Code — `main.js`

```javascript
import bcrypt from "bcryptjs";

const hashPassword = async () => {
  const myPassword = "Ahmed678";
  const hashedPassword = await bcrypt.hash(myPassword, 10);
  console.log(`Original Password is: ${myPassword}`);
  console.log(`Hashed Password is: ${hashedPassword}`);

  const enteredPassword = "Ahmed678";
  const isMatch = await bcrypt.compare(enteredPassword, hashedPassword);
  console.log(`Entered Password is: ${enteredPassword}`);
  isMatch ? console.log(`Password Match`) : console.log(`Password Not Match`);
};

hashPassword();
```

### Expected Output

```
Original Password is: Ahmed678
Hashed Password is: $2b$10$...        (different on every run)
Entered Password is: Ahmed678
Password Match
```

> Change `enteredPassword` to something else (e.g. `"Wrong123"`) and the output will be `Password Not Match`.

---

## 📚 Topics Covered

### Topic 1 — What is Bcrypt?

Bcrypt is a password-hashing algorithm used to protect passwords before storing them in a database.

When a user signs up, we never save their password directly in the database. Instead, we use Bcrypt to create a hash of the password and store that hash.

```
User enters password  →  Ali@12345
Bcrypt hashing        →  bcrypt.hash()
Database stores hash  →  $2b$12$...
```

**Why do we need it?** If a database leaks and passwords are stored in plain text, attackers can read them directly. Hashed passwords help keep the original passwords from being exposed.

---

### Topic 2 — Hashing vs Encryption

| Feature                    | Hashing                            | Encryption                          |
| -------------------------- | ---------------------------------- | ----------------------------------- |
| Purpose                    | Password protection & verification | Protect data that must be recovered |
| Reversible?                | Designed to be one-way             | Yes, with the correct key           |
| Example                    | Bcrypt                             | AES                                 |
| Recover original password? | Not directly from the hash         | Possible through decryption         |

Bcrypt does not decrypt passwords. At login, it verifies the entered password against the stored hash.

---

### Topic 3 — Install & Import

```bash
npm install bcryptjs
```

```javascript
import bcrypt from "bcryptjs";
```

- `npm install bcryptjs` — installs the library
- `import bcrypt from "bcryptjs"` — makes the library available in the file
- `await` — waits for the asynchronous operation to finish

---

### Topic 4 — `bcrypt.hash()` & Salt Rounds

```javascript
const hashedPassword = await bcrypt.hash(password, 12);
```

- `12` is the **cost factor**, not 12 seconds. A higher cost factor means more computational work per hash.
- Bcrypt uses a **random salt** for every hash, so the same password produces different hashes:

```javascript
const hash1 = await bcrypt.hash("Ali@12345", 12);
const hash2 = await bcrypt.hash("Ali@12345", 12);
console.log(hash1 === hash2); // false
```

- There's no need to store the salt in a separate column — the salt is included inside the hash itself.

---

### Topic 5 — `bcrypt.compare()`

```javascript
const isMatch = await bcrypt.compare(enteredPassword, storedHash);
console.log(isMatch); // true or false
```

- In a real application, `storedHash` comes from the database.
- `compare()` does not decode the password — it only verifies it.

---

## 📝 Quick Revision Notes

**Notes 1 — Bcrypt**

1. Bcrypt is used for password hashing.
2. It helps protect users' passwords.
3. Never store plain-text passwords in the database.
4. Store the hashed password instead.
5. Bcrypt is commonly used in signup and login systems.
6. A hash is not the same as encryption.

**Notes 2 — Hashing vs Encryption**

1. Hashing is designed to be one-way.
2. Encryption can be reversed using the correct key.
3. Bcrypt does not decrypt passwords.
4. `bcrypt.compare()` verifies a password against its stored hash.
5. A successful comparison returns `true`; a mismatch returns `false`.

**Notes 3 — Installation**

1. Install with: `npm install bcryptjs`
2. Import with: `import bcrypt from "bcryptjs";`
3. ES Modules use `import`/`export` syntax.
4. Hashing and comparison are asynchronous when using their async APIs.
5. Use `await` inside an `async` function.

**Notes 4 — `bcrypt.hash()`**

1. `bcrypt.hash()` creates a password hash.
2. Syntax: `await bcrypt.hash(password, costFactor)`
3. The cost factor controls computational expense.
4. The cost factor is not the number of seconds.
5. Bcrypt generates a random salt.
6. The same password can produce different hashes.
7. The salt information is included in the bcrypt hash.

**Notes 5 — `bcrypt.compare()`**

1. `bcrypt.compare()` verifies a password against a stored hash.
2. Syntax: `await bcrypt.compare(plainPassword, storedHash)`
3. It resolves to `true` if the password matches.
4. It resolves to `false` if the password does not match.
5. Never compare the entered password with the stored hash using `===`.
6. Never store the original password just to make comparison easier.

---

## 🔜 Next Up

Day 2 — Using Bcrypt in real **signup / login** routes (Express + MongoDB).
