// lib/auth.ts — contraseñas y códigos de verificación.
// Las contraseñas solo se guardan como hash PBKDF2 con salt
// (Web Crypto, solo servidor). El login de comerciante y de
// admin se verifica siempre en el servidor.
async function pbkdf2Hex(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: 100000, hash: "SHA-256" },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(salt)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
  return "pbkdf2$" + hex + "$" + (await pbkdf2Hex(password, salt));
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "pbkdf2") return false;
  const saltHex = parts[1] as string;
  const salt = new Uint8Array(saltHex.length / 2);
  for (let i = 0; i < salt.length; i++) {
    salt[i] = parseInt(saltHex.slice(i * 2, i * 2 + 2), 16);
  }
  return (await pbkdf2Hex(password, salt)) === parts[2];
}

// Código de verificación por correo: 6 dígitos, vence en 30
// minutos, máximo 5 intentos (tabla email_verifications).
export function newVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
export const CODE_TTL_MINUTES = 30;
export const CODE_MAX_ATTEMPTS = 5;
