type LogLevel = "debug" | "info" | "warn" | "error";

function shouldLog(level: LogLevel): boolean {
  if (level === "error" || level === "warn") {
    return true;
  }

  return process.env.NODE_ENV !== "production";
}

function write(level: LogLevel, args: unknown[]) {
  if (!shouldLog(level)) {
    return;
  }

  const prefix = `[ncj:${level}]`;

  switch (level) {
    case "error":
      console.error(prefix, ...args);
      break;
    case "warn":
      console.warn(prefix, ...args);
      break;
    default:
      console.log(prefix, ...args);
  }
}

export const logger = {
  debug: (...args: unknown[]) => write("debug", args),
  info: (...args: unknown[]) => write("info", args),
  warn: (...args: unknown[]) => write("warn", args),
  error: (...args: unknown[]) => write("error", args),
};
