/**
 * MCP System Logger — Real-time logging for Scraper, Pipeline & CALL-E
 *
 * Maintains a persistent in-memory ring buffer of structured log entries
 * accessible via /api/mcp/logs and real-time dashboard monitoring.
 */

export interface McpLogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "SUCCESS" | "WARN" | "ERROR" | "DEBUG";
  category: "SCRAPER" | "PHONE_VERIFIER" | "ML_SCORING" | "OKF_STORE" | "CALLE" | "ORCHESTRATOR" | "CRAWLEE" | "DISCOVERY" | "MCP_BRIDGE" | "APOLLO_PIPELINE" | "APOLLO_API";
  message: string;
  details?: Record<string, unknown> | null;
}

class McpLogger {
  private logs: McpLogEntry[] = [];
  private maxLogs = 500;

  log(
    level: McpLogEntry["level"],
    category: McpLogEntry["category"],
    message: string,
    details?: Record<string, unknown> | null
  ): McpLogEntry {
    const entry: McpLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details: details || null,
    };

    this.logs.unshift(entry); // newest first
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    const prefix = `[MCP:${category}:${level}]`;
    if (level === "ERROR") {
      console.error(prefix, message, details || "");
    } else if (level === "WARN") {
      console.warn(prefix, message, details || "");
    } else {
      console.log(prefix, message, details || "");
    }

    return entry;
  }

  info(category: McpLogEntry["category"], message: string, details?: Record<string, unknown>) {
    return this.log("INFO", category, message, details);
  }

  success(category: McpLogEntry["category"], message: string, details?: Record<string, unknown>) {
    return this.log("SUCCESS", category, message, details);
  }

  warn(category: McpLogEntry["category"], message: string, details?: Record<string, unknown>) {
    return this.log("WARN", category, message, details);
  }

  error(category: McpLogEntry["category"], message: string, details?: Record<string, unknown>) {
    return this.log("ERROR", category, message, details);
  }

  debug(category: McpLogEntry["category"], message: string, details?: Record<string, unknown>) {
    return this.log("DEBUG", category, message, details);
  }

  getLogs(options: {
    category?: McpLogEntry["category"];
    level?: McpLogEntry["level"];
    limit?: number;
    since?: string;
  } = {}): McpLogEntry[] {
    let result = this.logs;

    if (options.category) {
      result = result.filter((l) => l.category === options.category);
    }
    if (options.level) {
      result = result.filter((l) => l.level === options.level);
    }
    if (options.since) {
      const sinceDate = new Date(options.since).getTime();
      result = result.filter((l) => new Date(l.timestamp).getTime() > sinceDate);
    }

    const limit = options.limit || 100;
    return result.slice(0, limit);
  }

  clear() {
    this.logs = [];
  }
}

export const mcpLogger = new McpLogger();
