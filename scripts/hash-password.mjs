// Usage: npm run hash-password -- "your-strong-password"
// Prints a bcrypt hash for ADMIN_PASSWORD_HASH.
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Usage: npm run hash-password -- "a-password-of-10+-characters"');
  process.exit(1);
}
const hash = await bcrypt.hash(password, 12);
console.log("\nVercel (paste as-is):\n" + hash);
console.log("\nLocal .env (dollar signs escaped):\nADMIN_PASSWORD_HASH=" + hash.replace(/\$/g, "\\$") + "\n");
