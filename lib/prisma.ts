// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Evitar múltiplas instâncias do PrismaClient em desenvolvimento
// https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;