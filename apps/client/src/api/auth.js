import client from "./client.js";

export const register = (payload) => client.post("/auth/register", payload).then((r) => r.data);
export const login = (payload) => client.post("/auth/login", payload).then((r) => r.data);
export const refresh = () => client.post("/auth/refresh").then((r) => r.data);
export const logout = () => client.post("/auth/logout").then((r) => r.data);
