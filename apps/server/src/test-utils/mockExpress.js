// Minimal req/res/next stand-ins for testing Express validator middleware
// directly, without spinning up a server.
export function runMiddleware(middleware, body) {
  const req = { body };
  let statusCode = null;
  let jsonBody = null;
  let nextCalled = false;

  const res = {
    status(code) {
      statusCode = code;
      return { json: (payload) => (jsonBody = payload) };
    },
  };

  middleware(req, res, () => (nextCalled = true));

  return { nextCalled, statusCode, jsonBody };
}
