import client from "./client.js";

export const listMyTransactions = () => client.get("/transactions/mine").then((r) => r.data);
export const resolveTransaction = (id, status) =>
  client.patch(`/transactions/${id}/complete`, { status }).then((r) => r.data);
