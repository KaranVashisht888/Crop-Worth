import client from "./client.js";

export const getPrices = (params) => client.get("/prices", { params }).then((r) => r.data);
