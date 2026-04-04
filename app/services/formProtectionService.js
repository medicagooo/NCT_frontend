const crypto = require('crypto');

function normalizePositiveInteger(value, fallback) {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

function buildTokenPayload(issuedAt, nonce) {
  return `${issuedAt}.${nonce}`;
}

function signTokenPayload(payload, secret) {
  return crypto.createHmac('sha256', String(secret || '')).update(payload).digest('hex');
}

function secureEquals(left, right) {
  const leftBuffer = Buffer.from(String(left || ''), 'utf8');
  const rightBuffer = Buffer.from(String(right || ''), 'utf8');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function issueFormProtectionToken({ secret, issuedAt = Date.now() } = {}) {
  const normalizedIssuedAt = normalizePositiveInteger(issuedAt, Date.now());
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = buildTokenPayload(normalizedIssuedAt, nonce);
  const signature = signTokenPayload(payload, secret);

  return `${payload}.${signature}`;
}

function validateFormProtection({
  token,
  honeypotValue,
  secret,
  minFillMs = 3000,
  maxAgeMs = 24 * 60 * 60 * 1000,
  now = Date.now()
} = {}) {
  const normalizedHoneypot = String(honeypotValue || '').trim();
  if (normalizedHoneypot) {
    return {
      ok: false,
      reason: 'honeypot_filled'
    };
  }

  const tokenMatch = /^(\d{10,16})\.([a-f0-9]{32})\.([a-f0-9]{64})$/i.exec(String(token || '').trim());
  if (!tokenMatch) {
    return {
      ok: false,
      reason: 'invalid_token'
    };
  }

  const issuedAt = Number.parseInt(tokenMatch[1], 10);
  const nonce = tokenMatch[2];
  const signature = tokenMatch[3];
  const payload = buildTokenPayload(issuedAt, nonce);
  const expectedSignature = signTokenPayload(payload, secret);

  if (!secureEquals(signature, expectedSignature)) {
    return {
      ok: false,
      reason: 'invalid_token'
    };
  }

  const ageMs = now - issuedAt;
  const normalizedMinFillMs = normalizePositiveInteger(minFillMs, 3000);
  const normalizedMaxAgeMs = normalizePositiveInteger(maxAgeMs, 24 * 60 * 60 * 1000);

  if (!Number.isFinite(ageMs) || ageMs < 0) {
    return {
      ok: false,
      reason: 'invalid_token',
      ageMs
    };
  }

  if (ageMs < normalizedMinFillMs) {
    return {
      ok: false,
      reason: 'submitted_too_quickly',
      ageMs
    };
  }

  if (ageMs > normalizedMaxAgeMs) {
    return {
      ok: false,
      reason: 'expired_token',
      ageMs
    };
  }

  return {
    ok: true,
    ageMs,
    issuedAt
  };
}

module.exports = {
  issueFormProtectionToken,
  validateFormProtection
};
