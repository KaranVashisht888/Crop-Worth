import { test } from "node:test";
import assert from "node:assert/strict";
import { runMiddleware } from "../../test-utils/mockExpress.js";
import { validatePlaceBid } from "./bids.validators.js";

test("validatePlaceBid: accepts a positive numeric amount", () => {
  const { nextCalled } = runMiddleware(validatePlaceBid, { amount: 100 });
  assert.equal(nextCalled, true);
});

test("validatePlaceBid: rejects zero, negative, non-numeric, and missing amounts", () => {
  for (const amount of [0, -5, "100", undefined, NaN]) {
    const { nextCalled, statusCode } = runMiddleware(validatePlaceBid, { amount });
    assert.equal(nextCalled, false, `expected amount ${amount} to be rejected`);
    assert.equal(statusCode, 400);
  }
});
