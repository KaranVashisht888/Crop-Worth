import client from "./client.js";

export const getAdvisoryTips = (params) => client.get("/advisory", { params }).then((r) => r.data);
