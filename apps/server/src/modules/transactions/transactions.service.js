import { prisma } from "../../config/prisma.js";

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

// score = share of this buyer's resolved (accepted-bid) transactions that
// were actually completed, rather than falling through.
async function recomputeReliabilityScore(buyerId) {
  const resolved = await prisma.transaction.findMany({
    where: { buyerId, status: { in: ["COMPLETED", "FELL_THROUGH"] } },
    select: { status: true },
  });

  if (resolved.length === 0) return;

  const completed = resolved.filter((t) => t.status === "COMPLETED").length;
  await prisma.user.update({
    where: { id: buyerId },
    data: { reliabilityScore: completed / resolved.length },
  });
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
