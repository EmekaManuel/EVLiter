import type { AuthTokenPayload } from "./token";

/**
 * Creates a simple JWT token for simulation purposes
 * This is NOT secure and should only be used for development/testing
 */
export function createSimulatedJWT(payload: AuthTokenPayload): string {
  // Create header
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  // Add expiration time (1 hour from now)
  const exp = Math.floor(Date.now() / 1000) + 60 * 60;
  const tokenPayload = { ...payload, exp };

  // Encode header and payload
  const encodedHeader = btoa(JSON.stringify(header))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const encodedPayload = btoa(JSON.stringify(tokenPayload))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  // Create signature (simplified - not secure)
  const signature = btoa(`${encodedHeader}.${encodedPayload}`)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Creates a simulated login token for a regular user
 */
export function createUserToken(userId: string = "user123"): string {
  return createSimulatedJWT({
    userId,
    role: "user",
  });
}

/**
 * Creates a simulated login token for an admin user
 */
export function createAdminToken(userId: string = "admin123"): string {
  return createSimulatedJWT({
    userId,
    role: "admin",
  });
}
