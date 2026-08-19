import { test } from "node:test";
import assert from "node:assert/strict";
import { runMiddleware } from "../../test-utils/mockExpress.js";
import { validateCreateListing, validateUpdateListing } from "./listings.validators.js";

function validListing(overrides = {}) {
  return {
    cropType: "Wheat",
    quantity: 500,
    unit: "kg",
    expectedPrice: 25,
    reservePrice: 20,
    region: "Punjab",
    harvestDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    auctionEnd: new Date(Date.now() + 2 * 86400000).toISOString(),
    ...overrides,
  };
}

test("validateCreateListing: accepts a well-formed listing", () => {
  const { nextCalled } = runMiddleware(validateCreateListing, validListing());
  assert.equal(nextCalled, true);
});

test("validateCreateListing: reserve price cannot exceed expected price", () => {
  const { statusCode, jsonBody } = runMiddleware(
    validateCreateListing,
    validListing({ expectedPrice: 20, reservePrice: 25 })
  );
  assert.equal(statusCode, 400);
  assert.ok(jsonBody.errors.includes("Reserve price cannot exceed expected price"));
});

test("validateCreateListing: rejects an auction end in the past", () => {
  const { statusCode, jsonBody } = runMiddleware(
    validateCreateListing,
    validListing({ auctionEnd: new Date(Date.now() - 1000).toISOString() })
  );
  assert.equal(statusCode, 400);
  assert.ok(jsonBody.errors.includes("Auction end must be in the future"));
});

test("validateCreateListing: rejects an auction window beyond 30 days", () => {
  const { statusCode, jsonBody } = runMiddleware(
    validateCreateListing,
    validListing({ auctionEnd: new Date(Date.now() + 31 * 86400000).toISOString() })
  );
  assert.equal(statusCode, 400);
  assert.ok(jsonBody.errors.includes("Auction window cannot exceed 30 days"));
});

test("validateCreateListing: rejects an unrecognized unit", () => {
  const { statusCode, jsonBody } = runMiddleware(validateCreateListing, validListing({ unit: "bags" }));
  assert.equal(statusCode, 400);
  assert.ok(jsonBody.errors.some((e) => e.startsWith("Unit must be one of")));
});

test("validateUpdateListing: an empty patch is valid (every field optional)", () => {
  const { nextCalled } = runMiddleware(validateUpdateListing, {});
  assert.equal(nextCalled, true);
});

test("validateUpdateListing: still enforces reserve <= expected when both are present", () => {
  const { statusCode } = runMiddleware(validateUpdateListing, { expectedPrice: 10, reservePrice: 15 });
  assert.equal(statusCode, 400);
});
