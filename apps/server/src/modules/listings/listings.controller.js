import fs from "fs/promises";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as listingsService from "./listings.service.js";

export const create = asyncHandler(async (req, res) => {
  const listing = await listingsService.createListing(req.user.id, req.body);
  res.status(201).json(listing);
});

export const list = asyncHandler(async (req, res) => {
  const result = await listingsService.listListings(req.query);
  res.json(result);
});

export const getOne = asyncHandler(async (req, res) => {
  const listing = await listingsService.getListingById(req.params.id);
  res.json(listing);
});

export const update = asyncHandler(async (req, res) => {
  const listing = await listingsService.updateListing(req.params.id, req.user.id, req.body);
  res.json(listing);
});

export const remove = asyncHandler(async (req, res) => {
  await listingsService.deleteListing(req.params.id, req.user.id);
  res.status(204).send();
});

export const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Photo file is required" });
  }
  const photoUrl = `/uploads/${req.file.filename}`;
  try {
    const listing = await listingsService.setListingPhoto(req.params.id, req.user.id, photoUrl);
    res.json(listing);
  } catch (err) {
    await fs.unlink(req.file.path).catch(() => {});
    throw err;
  }
});
