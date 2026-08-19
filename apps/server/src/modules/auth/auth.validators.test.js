import { test } from "node:test";
import assert from "node:assert/strict";
import { runMiddleware } from "../../test-utils/mockExpress.js";
import { validateRegister, validateLogin } from "./auth.validators.js";

test("validateRegister: accepts a well-formed farmer registration", () => {
  const { nextCalled, statusCode } = runMiddleware(validateRegister, {
    email: "farmer@test.com",
    password: "password123",
    name: "Ravi",
    role: "FARMER",
  });
  assert.equal(nextCalled, true);
  assert.equal(statusCode, null);
});

test("validateRegister: rejects malformed email, short password, missing name, bad role together", () => {
  const { nextCalled, statusCode, jsonBody } = runMiddleware(validateRegister, {
    email: "not-an-email",
    password: "short",
    name: "",
    role: "ADMIN",
  });
  assert.equal(nextCalled, false);
  assert.equal(statusCode, 400);
  assert.equal(jsonBody.errors.length, 4);
});

test("validateLogin: requires both email and password", () => {
  const missingPassword = runMiddleware(validateLogin, { email: "x@test.com" });
  assert.equal(missingPassword.nextCalled, false);
  assert.equal(missingPassword.statusCode, 400);

  const valid = runMiddleware(validateLogin, { email: "x@test.com", password: "anything" });
  assert.equal(valid.nextCalled, true);
});
