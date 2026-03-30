import { randomBytes } from "crypto";

export function createTrackingCode(): string {
  const part = randomBytes(3).toString("hex").toUpperCase();
  return `JHR-${part}`;
}
