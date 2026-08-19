import client from "./client.js";

export const listListings = (params) => client.get("/listings", { params }).then((r) => r.data);
export const listMyListings = (params) =>
  client.get("/listings", { params: { ...params, mine: true } }).then((r) => r.data);
export const getListing = (id) => client.get(`/listings/${id}`).then((r) => r.data);
export const createListing = (payload) => client.post("/listings", payload).then((r) => r.data);
export const updateListing = (id, payload) => client.patch(`/listings/${id}`, payload).then((r) => r.data);
export const deleteListing = (id) => client.delete(`/listings/${id}`);
export const uploadListingPhoto = (id, file) => {
  const form = new FormData();
  form.append("photo", file);
  return client.post(`/listings/${id}/photo`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};
