import { hashPassword as betterAuthHash, verifyPassword } from "better-auth/crypto";

export { verifyPassword };

export async function hashPassword(password: string): Promise<string> {
  // better-auth hashPassword returns "salt:hash" string directly
  return betterAuthHash(password);
}

export function generateRandomPassword(length: number = 12): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }

  // Ensure at least one of each character type
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  if (!hasLower || !hasUpper || !hasNumber || !hasSpecial) {
    // Recursively generate until we have all character types
    return generateRandomPassword(length);
  }

  return password;
}
