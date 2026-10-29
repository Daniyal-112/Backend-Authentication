import crypto from "crypto";

const refreshToken = "abc1234";

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("base64");
};

const hashedToken = hashToken(refreshToken);

console.log(`Original Token ${refreshToken}`);
console.log(`Hashed Token ${hashedToken}`);
