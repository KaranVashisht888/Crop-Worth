import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidNextBid, isBelowReserve } from "./bidRules.js";

test("isValidNextBid: any positive amount is valid when nothing has been bid yet", () => {
  assert.equal(isValidNextBid(1, undefined), true);
  assert.equal(isValidNextBid(1, null), true);
});

test("isValidNextBid: must strictly exceed the current highest", () => {
  assert.equal(isValidNextBid(101, 100), true);
  assert.equal(isValidNextBid(100, 100), false, "equal amount must be rejected");
  assert.equal(isValidNextBid(99, 100), false, "lower amount must be rejected");
});

test("isBelowReserve: flags amounts under reserve, including the boundary", () => {
  assert.equal(isBelowReserve(19, 20), true);
  assert.equal(isBelowReserve(20, 20), false, "equal to reserve is not below it");
  assert.equal(isBelowReserve(21, 20), false);
});
