import { PrismaClient } from "../generated/prisma"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Force a new client if the old one is missing the new model
export const prisma = (globalForPrisma.prisma && (globalForPrisma.prisma as any).customerActivity)
    ? globalForPrisma.prisma 
    : new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
