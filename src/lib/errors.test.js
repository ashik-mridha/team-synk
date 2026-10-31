import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { describeFailure, UNAVAILABLE_MESSAGE } from './errors.js';

const axiosError = (status, data, extra = {}) => ({
  isAxiosError: true,
  message: `Request failed with status code ${status}`,
  response: status ? { status, data } : undefined,
  ...extra,
});

describe('describeFailure', () => {
  it('reports a missing response (network failure or CORS block) as unavailable', () => {
    const result = describeFailure(axiosError(0, undefined, { code: 'ERR_NETWORK' }));
    assert.equal(result.cause, 'network-or-cors');
    assert.equal(result.message, UNAVAILABLE_MESSAGE);
  });

  it('reports a fetch TypeError the same way', () => {
    assert.equal(describeFailure(new TypeError('Failed to fetch')).message, UNAVAILABLE_MESSAGE);
  });

  it('reports a crashed server (Vercel/Render error page, no JSON) as unavailable', () => {
    assert.equal(
      describeFailure(axiosError(500, '<html>A server error has occurred</html>')).cause,
      'unavailable',
    );
    assert.equal(
      describeFailure({ status: 500, statusText: 'Internal Server Error' }).cause,
      'unavailable',
    );
    assert.equal(describeFailure(axiosError(502, '')).cause, 'unavailable');
    assert.equal(describeFailure(axiosError(503, '')).cause, 'unavailable');
  });

  it('reports a timeout as a slow server', () => {
    const result = describeFailure(axiosError(0, undefined, { code: 'ECONNABORTED' }));
    assert.equal(result.cause, 'timeout');
    assert.match(result.message, /waking up/);
  });

  it("shows the API's own message for real errors", () => {
    const apiError = axiosError(403, { error: { message: 'You do not have access.' } });
    assert.deepEqual(describeFailure(apiError), {
      cause: 'server',
      message: 'You do not have access.',
    });
    assert.equal(
      describeFailure({ status: 401, message: 'Invalid email or password' }).message,
      'Invalid email or password',
    );
  });

  it('does not leak axios boilerplate to users', () => {
    assert.equal(
      describeFailure(axiosError(404, {})).message,
      'Something went wrong. Please try again.',
    );
  });

  it('keeps a JSON 500 message (a real application error) instead of hiding it', () => {
    assert.equal(
      describeFailure(axiosError(500, { error: { message: 'Could not save.' } })).message,
      'Could not save.',
    );
  });
});
