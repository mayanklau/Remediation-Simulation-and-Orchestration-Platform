import { createHash, randomBytes, timingSafeEqual } from "crypto";

type RateState = {
  count: number;
  resetAt: number;
};

const memoryRateLimit = new Map<string, RateState>();

export type SessionPrincipal = {
  tenantId: string;
  email: string;
  name: string;
  role: string;
  groups: string[];
};

export function createSignedSession(principal: SessionPrincipal, secret = process.env.SESSION_SECRET ?? "development-session-secret") {
  const payload = Buffer.from(JSON.stringify({ ...principal, issuedAt: Date.now() })).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySignedSession(token: string | null | undefined, secret = process.env.SESSION_SECRET ?? "development-session-secret") {
  if (!token || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  const expected = sign(payload, secret);
  if (!safeEqual(signature, expected)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPrincipal & { issuedAt: number };
  } catch {
    return null;
  }
}

export function createCsrfToken(sessionToken: string, secret = process.env.SESSION_SECRET ?? "development-session-secret") {
  const nonce = randomBytes(16).toString("hex");
  return `${nonce}.${sign(`${sessionToken}.${nonce}`, secret)}`;
}

export function verifyCsrfToken(sessionToken: string | null | undefined, csrfToken: string | null | undefined, secret = process.env.SESSION_SECRET ?? "development-session-secret") {
  if (!sessionToken || !csrfToken || !csrfToken.includes(".")) return false;
  const [nonce, signature] = csrfToken.split(".");
  return safeEqual(signature, sign(`${sessionToken}.${nonce}`, secret));
}

export function checkRateLimit(key: string, limit = Number(process.env.RATE_LIMIT_PER_MINUTE ?? 120), windowMs = 60_000) {
  const now = Date.now();
  const current = memoryRateLimit.get(key);
  if (!current || current.resetAt <= now) {
    memoryRateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt: now + windowMs };
  }
  current.count += 1;
  return { allowed: current.count <= limit, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt };
}

export function hashEvidence(value: unknown, previousHash = "") {
  return createHash("sha256").update(`${previousHash}:${JSON.stringify(value)}`).digest("hex");
}

function sign(payload: string, secret: string) {
  return createHash("sha256").update(`${payload}.${secret}`).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
