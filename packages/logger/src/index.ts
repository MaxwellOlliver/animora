const DEFAULT_APP_NAME = 'animora';
const LOKI_PUSH_PATH = '/loki/api/v1/push';

declare function require(name: string): any;

declare const process: {
  env: Record<string, string | undefined>;
  stderr?: {
    write(chunk: string): void;
  };
  stdout?: {
    write(chunk: string): void;
  };
};

declare const Buffer: {
  from(value: string): {
    toString(encoding: string): string;
  };
};

const http = require('node:http');
const https = require('node:https');

export type LogLevel = 'info' | 'warn' | 'error';
export type LogDetails = Record<string, unknown>;

type LokiConfig = {
  authHeader?: string;
  pushUrl: string;
};

type LoggerOptions = {
  appName?: string;
};

const loggers = new Map<string, AppLogger>();
const lokiConfigs = new Map<string, LokiConfig | null>();

function encodeBasicAuth(value: string): string {
  return `Basic ${Buffer.from(value).toString('base64')}`;
}

function getAppName(options?: LoggerOptions): string {
  return options?.appName ?? DEFAULT_APP_NAME;
}

function getLokiConfig(appName: string): LokiConfig | null {
  const cached = lokiConfigs.get(appName);
  if (cached !== undefined) {
    return cached;
  }

  const rawUrl = process.env.GRAFANA_LOKI_URL?.trim();

  if (!rawUrl) {
    lokiConfigs.set(appName, null);
    return null;
  }

  const url = new URL(rawUrl);
  const pathname = url.pathname.replace(/\/+$/, '');
  const basicAuthFromUrl =
    url.username || url.password
      ? `${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`
      : undefined;

  url.pathname =
    pathname === '' || pathname === '/'
      ? LOKI_PUSH_PATH
      : pathname.endsWith(LOKI_PUSH_PATH)
        ? pathname
        : `${pathname}${LOKI_PUSH_PATH}`;
  url.search = '';
  url.hash = '';
  url.username = '';
  url.password = '';

  const basicAuth =
    process.env.GRAFANA_LOKI_BASIC_AUTH?.trim() || basicAuthFromUrl;

  const config = {
    authHeader: basicAuth ? encodeBasicAuth(basicAuth) : undefined,
    pushUrl: url.toString(),
  };

  lokiConfigs.set(appName, config);
  return config;
}

function normalizeValue(value: unknown): unknown {
  return normalizeAny(value, new WeakSet<object>());
}

function normalizeDetails(details: LogDetails): LogDetails {
  return Object.fromEntries(
    Object.entries(details).map(([key, value]) => [key, normalizeValue(value)]),
  );
}

function normalizeAny(
  value: unknown,
  seen: WeakSet<object>,
  depth = 0,
): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (typeof value === 'symbol') {
    return value.toString();
  }

  if (typeof value === 'function') {
    return `[Function ${value.name || 'anonymous'}]`;
  }

  if (value instanceof Error) {
    return {
      message: value.message,
      name: value.name,
      stack: value.stack,
    };
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (depth >= 6) {
    return '[MaxDepth]';
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeAny(item, seen, depth + 1));
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      return '[Circular]';
    }

    seen.add(value);

    try {
      const entries = Object.entries(value);
      return Object.fromEntries(
        entries.map(([key, entryValue]) => [
          key,
          normalizeAny(entryValue, seen, depth + 1),
        ]),
      );
    } catch {
      return `[Unserializable ${getObjectTag(value)}]`;
    }
  }

  return String(value);
}

function getObjectTag(value: object): string {
  try {
    return value.constructor?.name || 'Object';
  } catch {
    return 'Object';
  }
}

function stringifyPayload(value: unknown): string {
  try {
    const json = JSON.stringify(value);
    return json ?? 'null';
  } catch (error) {
    const normalizedError = normalizeValue(error);
    return JSON.stringify({
      serializationError: normalizedError,
    });
  }
}

function writeConsole(
  level: LogLevel,
  message: string,
  payload: LogDetails,
): void {
  const line = `${message} ${stringifyPayload(payload)}`;

  try {
    writeLine(level === 'error' ? 'stderr' : 'stdout', line);
  } catch {
    try {
      writeLine('stdout', `[logger:console-failed] ${message}`);
    } catch {
      // Intentionally swallow all logger failures.
    }
  }
}

function writeLine(stream: 'stderr' | 'stdout', line: string): void {
  const writer = process[stream];

  if (!writer?.write) {
    return;
  }

  writer.write(`${line}\n`);
}

async function sendToLoki(
  appName: string,
  level: LogLevel,
  event: string,
  details: LogDetails,
): Promise<void> {
  const config = getLokiConfig(appName);

  if (!config) {
    return;
  }

  try {
    const scope = typeof details.scope === 'string' ? details.scope : undefined;
    const line = stringifyPayload({
      app: appName,
      event,
      level,
      timestamp: new Date().toISOString(),
      ...details,
    });

    const body = stringifyPayload({
      streams: [
        {
          stream: {
            app: appName,
            level,
            ...(scope ? { scope } : {}),
          },
          values: [[`${Date.now()}000000`, line]],
        },
      ],
    });

    const response = await postJson(config.pushUrl, body, {
      'Content-Type': 'application/json',
      ...(config.authHeader ? { Authorization: config.authHeader } : {}),
    });

    if (!response.ok) {
      writeConsole('error', '[logger:loki]', normalizeDetails({
        body: response.body,
        event,
        pushUrl: config.pushUrl,
        status: response.status,
        statusText: response.statusText,
      }));
    }
  } catch (error) {
    writeConsole('error', '[logger:loki]', normalizeDetails({
      event,
      pushUrl: config.pushUrl,
      ...normalizeDetails({ error }),
    }));
  }
}

function postJson(
  urlValue: string,
  body: string,
  headers: Record<string, string>,
): Promise<{
  body: string;
  ok: boolean;
  status: number;
  statusText: string;
}> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlValue);
    const transport = url.protocol === 'https:' ? https : http;
    const request = transport.request(
      url,
      {
        method: 'POST',
        headers,
      },
      (response: {
        on(event: 'data', listener: (chunk: string) => void): void;
        on(event: 'end', listener: () => void): void;
        setEncoding?(encoding: string): void;
        statusCode?: number;
        statusMessage?: string;
      }) => {
        let responseBody = '';

        response.setEncoding?.('utf8');
        response.on('data', (chunk) => {
          responseBody += chunk;
        });
        response.on('end', () => {
          const status = response.statusCode ?? 0;

          resolve({
            body: responseBody,
            ok: status >= 200 && status < 300,
            status,
            statusText: response.statusMessage ?? '',
          });
        });
      },
    );

    request.on('error', reject);
    request.write(body);
    request.end();
  });
}

export class AppLogger {
  constructor(
    private readonly appName: string,
    private readonly bindings: LogDetails = {},
  ) {}

  child(bindings: LogDetails): AppLogger {
    return new AppLogger(this.appName, { ...this.bindings, ...bindings });
  }

  info(event: string, details: LogDetails = {}): void {
    this.log('info', event, details);
  }

  warn(event: string, details: LogDetails = {}): void {
    this.log('warn', event, details);
  }

  error(event: string, details: LogDetails = {}): void {
    this.log('error', event, details);
  }

  private log(level: LogLevel, event: string, details: LogDetails): void {
    try {
      const payload = normalizeDetails({ ...this.bindings, ...details });
      const scope =
        typeof payload.scope === 'string' ? payload.scope : this.appName;
      const message = `[${scope}] ${event}`;

      writeConsole(level, message, payload);
      void sendToLoki(this.appName, level, event, payload);
    } catch (error) {
      writeConsole('error', '[logger:failed]', normalizeDetails({
        appName: this.appName,
        error,
        event,
        level,
      }));
    }
  }
}

export function getLogger(options?: LoggerOptions): AppLogger {
  const appName = getAppName(options);
  const cached = loggers.get(appName);

  if (cached) {
    return cached;
  }

  const logger = new AppLogger(appName);
  loggers.set(appName, logger);
  return logger;
}
