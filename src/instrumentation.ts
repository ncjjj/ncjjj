export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { validateRuntimeEnv } = await import("./lib/env");
  const envCheck = validateRuntimeEnv();

  if (!envCheck.ok) {
    console.error(
      "[startup] Missing required environment variables:",
      envCheck.missing.join(", ")
    );
  }

  if (envCheck.warnings.length > 0) {
    console.warn("[startup] Environment warnings:", envCheck.warnings.join(" | "));
  }
}
