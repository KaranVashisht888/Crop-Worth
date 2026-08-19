import { PrismaClient } from "@prisma/client";

// Single shared client instance, reused across the app instead of
// reconnecting per request.
export const prisma = new PrismaClient();
