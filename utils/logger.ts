type Level = "debug" | "info" | "warn" | "error";

const isDev = process.env.NODE_ENV !== "production";

function log(level: Level, ...args: unknown[]) {
  if (level === "debug" && !isDev) return; // debug solo en dev
  const prefix = `[${level.toUpperCase()}]`;
  // eslint-disable-next-line no-console
  console[level === "warn" ? "warn" : level](prefix, ...args);
}

export const logger = {
  debug: (...args: unknown[]) => log("debug", ...args),
  info: (...args: unknown[]) => log("info", ...args),
  warn: (...args: unknown[]) => log("warn", ...args),
  error: (...args: unknown[]) => log("error", ...args),
};
