type EnvKey =
  | "MONGODB_URI"
  | "JWT_SECRET"
  | "JWT_EXPIRES_IN"
  | "APP_ORIGIN"
  | "ADMIN_EMAIL"
  | "ADMIN_PASSWORD";

export function getEnv(key: EnvKey): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}
