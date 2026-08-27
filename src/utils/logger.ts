import { LOG_PREFIX } from '@/config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let currentLevel: LogLevel = 'info';

function formatMessage(level: LogLevel, ...args: unknown[]): unknown[] {
  return [`[${LOG_PREFIX}]`, ...args];
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

export function debug(...args: unknown[]): void {
  if (shouldLog('debug')) {
    console.debug(...formatMessage('debug', ...args));
  }
}

export function info(...args: unknown[]): void {
  if (shouldLog('info')) {
    console.info(...formatMessage('info', ...args));
  }
}

export function warn(...args: unknown[]): void {
  if (shouldLog('warn')) {
    console.warn(...formatMessage('warn', ...args));
  }
}

export function error(...args: unknown[]): void {
  if (shouldLog('error')) {
    console.error(...formatMessage('error', ...args));
  }
}

export const logger = {
  debug,
  info,
  warn,
  error,
  setLogLevel,
};