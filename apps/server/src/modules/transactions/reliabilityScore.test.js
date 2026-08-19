import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateReliabilityScore } from "./reliabilityScore.js";

test("calculateReliabilityScore: null when nothing has resolved yet", () => {
  assert.equal(calculateReliabilityScore([]), null);
});

test("calculateReliabilityScore: 1.0 when every resolved transaction completed", () => {
  assert.equal(calculateReliabilityScore(["COMPLETED", "COMPLETED"]), 1);
});

test("calculateReliabilityScore: 0 when every resolved transaction fell through", () => {
  assert.equal(calculateReliabilityScore(["FELL_THROUGH", "FELL_THROUGH"]), 0);
});

test("calculateReliabilityScore: mixed history averages correctly", () => {
  assert.equal(calculateReliabilityScore(["COMPLETED", "FELL_THROUGH"]), 0.5);
  assert.equal(
    calculateReliabilityScore(["COMPLETED", "COMPLETED", "FELL_THROUGH"]),
    2 / 3
  );
});
