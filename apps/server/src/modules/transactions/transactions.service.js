import { prisma } from "../../config/prisma.js";
import { calculateReliabilityScore } from "./reliabilityScore.js";

export async function listMyTransactions(userId, role) {
  const where = role === "FARMER" ? { farmerId: userId } : { buyerId: userId };
  return prisma.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      listing: true,
      farmer: { select: { id: true, name: true } },
      buyer: { select: { id: true, name: true, reliabilityScore: true } },
    },
  });
}

export async function resolveTransaction(id, userId, status) {
  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction) throw httpError(404, "Transaction not found");
  if (transaction.farmerId !== userId && transaction.buyerId !== userId) {
    throw httpError(403, "You are not party to this transaction");
  }
  if (transaction.status !== "PENDING_FULFILLMENT") {
    throw httpError(409, "Transaction has already been resolved");
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: { status, completedAt: new Date() },
  });

  await recomputeReliabilityScore(transaction.buyerId);

  return updated;
}

async function recomputeReliabilityScore(buyerId) {
  const resolved = await prisma.transaction.findMany({
    where: { buyerId, status: { in: ["COMPLETED", "FELL_THROUGH"] } },
    select: { status: true },
  });

  const score = calculateReliabilityScore(resolved.map((t) => t.status));
  if (score === null) return;

  await prisma.user.update({ where: { id: buyerId }, data: { reliabilityScore: score } });
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
