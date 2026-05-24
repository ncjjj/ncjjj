import * as path from "path";
import { eq } from "drizzle-orm";
import { getDb } from "./src/db/index";
import { adminAccounts, adminSessions } from "./src/db/schema";
import { listConsultationRequests } from "./src/db/queries/consultationRequests";
import {
  createAdminSessionToken,
  hashAdminSessionToken,
  ADMIN_SESSION_COOKIE,
} from "./src/lib/adminSession";

// Load environment variables manually
const envPath = path.resolve(__dirname, ".env.local");
try {
  (process as any).loadEnvFile(envPath);
} catch (e) {
  console.log("Could not load env file natively:", e);
}

async function main() {
  const db = getDb();

  // 1. Get first admin account
  const [admin] = await db.select().from(adminAccounts).limit(1);
  if (!admin) {
    console.error("No admin account found in DB!");
    return;
  }
  console.log("Found admin:", admin.username);

  // 2. Get first consultation request
  const requests = await listConsultationRequests();
  if (requests.length === 0) {
    console.error("No consultation requests found in DB!");
    return;
  }
  const request = requests[0];
  console.log("Testing with consultation request ID:", request.id, "current status:", request.status);

  // 3. Create a temporary admin session
  const token = await createAdminSessionToken();
  const tokenHash = await hashAdminSessionToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes

  await db.insert(adminSessions).values({
    adminId: admin.id,
    tokenHash,
    expiresAt,
  });
  console.log("Created temporary session token:", token);

  try {
    // 4. Send PATCH request to the dev server
    const targetStatus = request.status === "seen" ? "contacted" : "seen";
    console.log(`Sending PATCH request to status '${targetStatus}'...`);

    const response = await fetch(`http://localhost:3000/api/admin/consultation-requests/${request.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `${ADMIN_SESSION_COOKIE}=${token}`,
      },
      body: JSON.stringify({ status: targetStatus }),
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", Object.fromEntries(response.headers.entries()));
    const text = await response.text();
    console.log("Response Body:", text);

  } catch (err) {
    console.error("Fetch request failed:", err);
  } finally {
    // 5. Clean up temporary session
    await db.delete(adminSessions).where(eq(adminSessions.tokenHash, tokenHash));
    console.log("Cleaned up temporary session.");
  }
}

main().then(() => process.exit(0));
