// Seeds sample companies + open opportunities so the public pages have content.
//
// Usage (Node 22+ loads .env.local for MONGODB_URI):
//   node --env-file=.env.local scripts/seed-opportunities.mjs
//
// Re-running is safe: companies are upserted by email and their sample
// opportunities are replaced.

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

if (!process.env.MONGODB_URI) {
  console.error("Missing MONGODB_URI (add it to .env.local).");
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    role: String,
    email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
    name: String,
    industry: String,
    companyWebsite: String,
    verified: Boolean,
  },
  { timestamps: true }
);
const opportunitySchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    description: String,
    location: String,
    duration: String,
    slotsAvailable: Number,
    skillsRequired: [String],
    status: String,
    deadline: Date,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Opportunity =
  mongoose.models.Opportunity ||
  mongoose.model("Opportunity", opportunitySchema);

const companies = [
  {
    name: "Andela Nigeria",
    email: "careers@andela.example.ng",
    industry: "Technology",
    companyWebsite: "https://andela.com",
    opportunities: [
      {
        title: "Software Engineering Intern",
        location: "Lagos, Nigeria",
        duration: "6 Months",
        slotsAvailable: 4,
        skillsRequired: ["JavaScript", "React", "Node.js", "Git"],
        description:
          "Join our engineering team to build and maintain web applications. You'll work alongside senior engineers on real product features, learn modern development workflows, and contribute to our codebase.",
      },
      {
        title: "Data Analyst Intern",
        location: "Remote, Nigeria",
        duration: "4 Months",
        slotsAvailable: 2,
        skillsRequired: ["SQL", "Python", "Excel"],
        description:
          "Support the analytics team in turning raw data into insights. Build dashboards, run queries, and present findings to stakeholders.",
      },
    ],
  },
  {
    name: "GTBank Plc",
    email: "siwes@gtbank.example.ng",
    industry: "Finance",
    companyWebsite: "https://gtbank.com",
    opportunities: [
      {
        title: "Banking Operations Trainee",
        location: "Abuja, Nigeria",
        duration: "12 Months",
        slotsAvailable: 6,
        skillsRequired: ["Communication", "MS Office", "Attention to detail"],
        description:
          "A structured Industrial Training placement across our operations units. Gain exposure to retail banking, account services, and back-office processing.",
      },
    ],
  },
  {
    name: "Shell Nigeria",
    email: "internships@shell.example.ng",
    industry: "Oil & Gas",
    companyWebsite: "https://shell.com.ng",
    opportunities: [
      {
        title: "Process Engineering Intern",
        location: "Port Harcourt, Nigeria",
        duration: "6 Months",
        slotsAvailable: 3,
        skillsRequired: ["Chemical Engineering", "MATLAB", "Safety"],
        description:
          "Work with our process engineering team on optimization projects at our facilities. Suitable for engineering students seeking hands-on SIWES experience.",
      },
    ],
  },
  {
    name: "MTN Nigeria",
    email: "talent@mtn.example.ng",
    industry: "Telecom",
    companyWebsite: "https://mtn.ng",
    opportunities: [
      {
        title: "Network Operations Intern",
        location: "Lagos, Nigeria",
        duration: "6 Months",
        slotsAvailable: 5,
        skillsRequired: ["Networking", "Linux", "Troubleshooting"],
        description:
          "Assist the NOC team in monitoring network performance and resolving incidents. Great for students interested in telecommunications infrastructure.",
      },
    ],
  },
];

await mongoose.connect(process.env.MONGODB_URI);
const passwordHash = await bcrypt.hash("password123", 10);

let companyCount = 0;
let oppCount = 0;

for (const c of companies) {
  const company = await User.findOneAndUpdate(
    { email: c.email },
    {
      $set: {
        role: "company",
        name: c.name,
        industry: c.industry,
        companyWebsite: c.companyWebsite,
        passwordHash,
        verified: true,
      },
      $setOnInsert: { email: c.email },
    },
    { upsert: true, new: true }
  );
  companyCount++;

  // Replace this company's existing seeded opportunities.
  await Opportunity.deleteMany({ companyId: company._id });
  for (const o of c.opportunities) {
    await Opportunity.create({
      companyId: company._id,
      status: "open",
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45), // ~45 days out
      ...o,
    });
    oppCount++;
  }
}

console.log(
  `✓ Seeded ${companyCount} companies and ${oppCount} opportunities.`
);
console.log("  Company login password (all seeds): password123");
await mongoose.disconnect();
process.exit(0);
