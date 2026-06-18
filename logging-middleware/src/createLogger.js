import { isAllowedPackage, LEVELS, STACKS } from "./constants.js";

function isBlank(value) {
  return typeof value !== "string" || value.trim().length === 0;
}

export function validateLogEntry(entry) {
  if (!STACKS.includes(entry.stack)) {
    throw new Error(`Invalid stack "${entry.stack}".`);
  }

  if (!LEVELS.includes(entry.level)) {
    throw new Error(`Invalid level "${entry.level}".`);
  }

  if (!isAllowedPackage(entry.stack, entry.package)) {
    throw new Error(`Package "${entry.package}" is not allowed for stack "${entry.stack}".`);
  }

  if (isBlank(entry.message)) {
    throw new Error("Log message cannot be empty.");
  }
}

export function createLogger(options) {
  const stack = options.stack;
  const transport = options.transport ?? (async () => {});
  const onTransportError = options.onTransportError ?? (() => {});

  async function emit(level, packageName, message, metadata = undefined) {
    const entry = {
      stack,
      level,
      package: packageName,
      message,
      metadata,
      timestamp: new Date().toISOString(),
    };

    try {
      validateLogEntry(entry);
      await transport(entry);
    } catch (error) {
      onTransportError(error, entry);
    }

    return entry;
  }

  return {
    log: emit,
    debug: (packageName, message, metadata) => emit("debug", packageName, message, metadata),
    info: (packageName, message, metadata) => emit("info", packageName, message, metadata),
    warn: (packageName, message, metadata) => emit("warn", packageName, message, metadata),
    error: (packageName, message, metadata) => emit("error", packageName, message, metadata),
    fatal: (packageName, message, metadata) => emit("fatal", packageName, message, metadata),
  };
}
