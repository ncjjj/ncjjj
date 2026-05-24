import { getDb } from "./src/db/index";
import { consultationRequests } from "./src/db/schema";
import { listConsultationRequests, updateConsultationRequestStatus } from "./src/db/queries/consultationRequests";

import * as path from "path";

// Load environment variables manually via Node native method
const envPath = path.resolve(__dirname, ".env.local");
try {
  (process as any).loadEnvFile(envPath);
} catch (e) {
  console.log("Could not load env file natively:", e);
}

async function main() {
  try {
    console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
    console.log("Fetching database requests...");
    const requests = await listConsultationRequests();
    console.log(`Found ${requests.length} requests.`);
    if (requests.length > 0) {
      const first = requests[0];
      console.log("First request:", first);
      console.log(`Testing status update to 'seen' for ID: ${first.id}...`);
      const updated = await updateConsultationRequestStatus(first.id, "seen");
      console.log("Updated result:", updated);
    } else {
      console.log("No requests to update.");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

main().then(() => process.exit(0));
