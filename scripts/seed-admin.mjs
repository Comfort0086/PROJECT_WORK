// Creates (or updates) the admin account. Admins cannot self-register.
//
// Usage (Node 22+ loads .env.local for MONGODB_URI):
//   node --env-file=.env.local scripts/seed-admin.mjs <email> <password> [name]
//
// Example:
//   node --env-file=.env.local scripts/seed-admin.mjs admin@portal.ng StrongPass1 "Site Admin"

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const [, , emailArg, passwordArg, nameArg] = process.argv;
const email = emailArg ?? process.env.ADMIN_EMAIL;
const password = passwordArg ?? process.env.ADMIN_PASSWORD;
const name = nameArg ?? process.env.ADMIN_NAME ?? "Administrator";

if (!process.env.MONGODB_URI) {
  console.error("Missing MONGODB_URI (add it to .env.local).");
  process.exit(1);
}
if (!email || !password) {
  console.error("Usage: node --env-file=.env.local scripts/seed-admin.mjs <email> <password> [name]");
  process.exit(1);
}

// Minimal schema matching models/User.ts for this one-off script.
const userSchema = new mongoose.Schema(
  {
    role: String,
    email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
    name: String,
    verified: Boolean,
  },
  { timestamps: true }
);
const User = mongoose.models.User || mongoose.model("User", userSchema);

await mongoose.connect(process.env.MONGODB_URI);

const passwordHash = await bcrypt.hash(password, 10);
const result = await User.findOneAndUpdate(
  { email: email.toLowerCase() },
  {
    $set: { role: "admin", name, passwordHash, verified: true },
    $setOnInsert: { email: email.toLowerCase() },
  },
  { upsert: true, new: true }
);

console.log(`✓ Admin ready: ${result.email} (${result._id})`);
await mongoose.disconnect();
process.exit(0);
