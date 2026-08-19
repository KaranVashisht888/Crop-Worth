import { test } from "node:test";
import assert from "node:assert/strict";
import { runMiddleware } from "../../test-utils/mockExpress.js";
import { validateResolveTransaction } from "./transactions.validators.js";

test("validateResolveTransaction: accepts COMPLETED and FELL_THROUGH", () => {
  assert.equal(runMiddleware(validateResolveTransaction, { status: "COMPLETED" }).nextCalled, true);
  assert.equal(runMiddleware(validateResolveTransaction, { status: "FELL_THROUGH" }).nextCalled, true);
});

test("validateResolveTransaction: rejects any other status, including valid-looking ones like PENDING_FULFILLMENT", () => {
  for (const status of ["PENDING_FULFILLMENT", "MAYBE", undefined]) {
    const { nextCalled, statusCode } = runMiddleware(validateResolveTransaction, { status });
    assert.equal(nextCalled, false, `expected status ${status} to be rejected`);
    assert.equal(statusCode, 400);
  }
});
