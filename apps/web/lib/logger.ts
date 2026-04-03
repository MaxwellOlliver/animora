import "server-only";

const APP_NAME = "animora";
const LOKI_PUSH_PATH = "/loki/api/v1/push";

type LogLevel = "info" | "warn" | "error";
type LogDetails = Record<string, unknown>;

type LokiConfig = {
  authHeader?: string;
  pushUrl: string;
};

let logger: AppLogger | undefined;
let lokiConfig: LokiConfig | null | undefined;

function encodeBasicAuth(value: string): string {
  return `Basic ${Buffer.from(value).toString("base64")}`;
}

function getLokiConfig(): LokiConfig | null {
  if (lokiConfig !== undefined) {
    return lokiConfig;
  }

  const rawUrl = process.env.GRAFANA_LOKI_URL?.trim();

  if (!rawUrl) {
    lokiConfig = null;
    return lokiConfig;
  }

  const url = new URL(rawUrl);
  const pathname = url.pathname.replace(/\/+$/, "");
  const basicAuthFromUrl =
    url.username || url.password
      ? `${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`
      : undefined;

  url.pathname =
    pathname === "" || pathname === "/"
      ? LOKI_PUSH_PATH
      : pathname.endsWith(LOKI_PUSH_PATH)
        ? pathname
        : `${pathname}${LOKI_PUSH_PATH}`;
  url.search = "";
  url.hash = "";
  url.username = "";
  url.password = "";

  const basicAuth =
    process.env.GRAFANA_LOKI_BASIC_AUTH?.trim() || basicAuthFromUrl;

  lokiConfig = {
    authHeader: basicAuth ? encodeBasicAuth(basicAuth) : undefined,
    pushUrl: url.toString(),
  };

  return lokiConfig;
}

function normalizeValue(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      message: value.message,
      name: value.name,
      stack: value.stack,
    };
  }

  return value;
}

function normalizeDetails(details: LogDetails): LogDetails {
  return Object.fromEntries(
    Object.entries(details).map(([key, value]) => [key, normalizeValue(value)]),
  );
}

async function sendToLoki(
  level: LogLevel,
  event: string,
  details: LogDetails,
): Promise<void> {
  const config = getLokiConfig();

  if (!config) {
    return;
  }

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (config.authHeader) {
    headers.set("Authorization", config.authHeader);
  }

  const scope = typeof details.scope === "string" ? details.scope : undefined;
  const line = JSON.stringify({
    app: APP_NAME,
    event,
    level,
    timestamp: new Date().toISOString(),
    ...details,
  });

  const body = JSON.stringify({
    streams: [
      {
        stream: {
          app: APP_NAME,
          level,
          ...(scope ? { scope } : {}),
        },
        values: [[`${Date.now()}000000`, line]],
      },
    ],
  });

  try {
    const response = await fetch(config.pushUrl, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[logger:loki]", {
        body: await response.text(),
        event,
        pushUrl: config.pushUrl,
        status: response.status,
        statusText: response.statusText,
      });
    }
  } catch (error) {
    console.error("[logger:loki]", {
      event,
      pushUrl: config.pushUrl,
      ...normalizeDetails({ error }),
    });
  }
}

class AppLogger {
  constructor(private readonly bindings: LogDetails = {}) {}

  child(bindings: LogDetails): AppLogger {
    return new AppLogger({ ...this.bindings, ...bindings });
  }

  info(event: string, details: LogDetails = {}): void {
    this.log("info", event, details);
  }

  warn(event: string, details: LogDetails = {}): void {
    this.log("warn", event, details);
  }

  error(event: string, details: LogDetails = {}): void {
    this.log("error", event, details);
  }

  private log(level: LogLevel, event: string, details: LogDetails): void {
    const payload = normalizeDetails({ ...this.bindings, ...details });
    const scope = typeof payload.scope === "string" ? payload.scope : APP_NAME;
    const message = `[${scope}] ${event}`;

    if (level === "error") {
      console.error(message, payload);
    } else if (level === "warn") {
      console.warn(message, payload);
    } else {
      console.info(message, payload);
    }

    void sendToLoki(level, event, payload);
  }
}

export const getLogger = (): AppLogger => {
  if (!logger) {
    logger = new AppLogger();
  }

  return logger;
};
