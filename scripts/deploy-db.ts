import { execSync } from "child_process";
import "dotenv/config";

const dbUrl = process.argv[2] || process.env.TARGET_DATABASE_URL;

if (!dbUrl) {
  console.error("❌ Error: Please provide the Neon database connection string.");
  console.log("Usage: npx tsx scripts/deploy-db.ts \"postgresql://neondb_owner:...@ep-xyz.neon.tech/neondb?sslmode=require\"");
  process.exit(1);
}

console.log("🚀 Starting database migration and seed to Cloud PostgreSQL...");
console.log(`📡 Target: ${dbUrl.split("@")[1] || "Cloud Database"}\n`);

try {
  console.log("1️⃣ Pushing Prisma Schema to Cloud Database...");
  execSync("npx prisma db push --schema=prisma/schema", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: dbUrl },
  });
  console.log("✅ Schema push complete!\n");

  console.log("2️⃣ Seeding active doctors, schedules, specialties, and demo users...");
  execSync("npx tsx prisma/seed.ts", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: dbUrl },
  });
  console.log("✅ Database seeded successfully!\n");

  console.log("🎉 Your Cloud Database is 100% ready for production!");
} catch (error) {
  console.error("❌ Migration or seed failed:", error);
  process.exit(1);
}
