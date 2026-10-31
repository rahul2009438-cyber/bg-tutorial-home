/**
 * B.G. TUTORIAL HOME — Security & Web Crypto Subsystem
 * Teacher PIN Gate & Self-Defense Lockout Architecture
 * Precomputed SHA-256 Digest matching Babun Ghosh Sir's PIN (973397):
 * "e8f0012e841797c2718ef8efee933ad664efcf63a76b7f3fb8d42d547dcf9558"
 */

export const MASTER_PIN_DIGEST = 'e8f0012e841797c2718ef8efee933ad664efcf63a76b7f3fb8d42d547dcf9558';
// Secondary emergency backup digest (matches 980095)
export const BACKUP_PIN_DIGEST = 'b93cb18df32dc51ea50e8220973a907106b3bc4eb8703c39999a099eeefb5a8d';

const LOCKOUT_KEY = 'bg_sec_lockout_until';
const ATTEMPTS_KEY = 'bg_sec_failed_attempts';
export const MAX_ATTEMPTS = 2; // Strict 2-attempt threshold as per blueprint
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

/**
 * Computes SHA-256 digest of input string using browser-native Web Crypto API
 */
export async function sha256(str) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Deterministic fallback for environments without crypto.subtle
  return fallbackSha256(str);
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Verify Teacher Access PIN against precomputed SHA-256 digests
 * Never exposes or stores plaintext PIN.
 */
export async function verifyTeacherPin(inputPin, customHash = null) {
  if (!inputPin || typeof inputPin !== 'string') return false;
  const cleanPin = inputPin.trim();
  if (cleanPin.length < 4 || cleanPin.length > 8) return false;

  const hashedInput = await sha256(cleanPin);

  const validDigests = [MASTER_PIN_DIGEST, BACKUP_PIN_DIGEST];
  if (customHash && typeof customHash === 'string') {
    validDigests.push(customHash);
  }

  for (const digest of validDigests) {
    if (timingSafeEqual(hashedInput, digest)) {
      resetLockoutState();
      return true;
    }
  }

  recordFailedAttempt();
  return false;
}

/**
 * Check if the teacher panel is currently locked out
 * Returns { isLocked: boolean, remainingSeconds: number }
 */
export function getLockoutState() {
  try {
    const lockoutUntil = localStorage.getItem(LOCKOUT_KEY);
    if (!lockoutUntil) return { isLocked: false, remainingSeconds: 0, attempts: getFailedAttempts() };

    const remainingMs = Number(lockoutUntil) - Date.now();
    if (remainingMs > 0) {
      return {
        isLocked: true,
        remainingSeconds: Math.ceil(remainingMs / 1000),
        attempts: MAX_ATTEMPTS
      };
    }
    // Expired lockout
    resetLockoutState();
    return { isLocked: false, remainingSeconds: 0, attempts: 0 };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attempts: 0 };
  }
}

export function getFailedAttempts() {
  try {
    return parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

export function recordFailedAttempt() {
  try {
    const attempts = getFailedAttempts() + 1;
    localStorage.setItem(ATTEMPTS_KEY, attempts.toString());

    if (attempts >= MAX_ATTEMPTS) {
      const lockUntil = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(LOCKOUT_KEY, lockUntil.toString());
    }
    return attempts;
  } catch {
    return 1;
  }
}

export function resetLockoutState() {
  try {
    localStorage.removeItem(LOCKOUT_KEY);
    localStorage.removeItem(ATTEMPTS_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Pure JS fallback SHA-256 for non-crypto environments
 */
function fallbackSha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i, j;
  let result = '';

  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let wordsCount = (asciiBitLength + 64 >>> 9 << 4) + 16;
  for (i = 0; i < wordsCount; i++) words[i] = 0;
  for (i = 0; i < ascii[lengthProperty]; i++) {
    words[i >> 2] |= (ascii.charCodeAt(i) & 255) << (24 - (i % 4) * 8);
  }
  words[i >> 2] |= 0x80 << (24 - (i % 4) * 8);
  words[wordsCount - 1] = asciiBitLength;

  for (let block = 0; block < wordsCount; block += 16) {
    const w = [];
    for (i = 0; i < 16; i++) w[i] = words[block + i];
    for (i = 16; i < 64; i++) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }

    let a = hash[0], b = hash[1], c = hash[2], d = hash[3];
    let e = hash[4], f = hash[5], g = hash[6], h = hash[7];

    for (i = 0; i < 64; i++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + S1 + ch + k[i] + w[i]) | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}
