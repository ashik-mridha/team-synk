import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { sessionCookieVisible } from './session-cookie.js';

describe('sessionCookieVisible', () => {
  it('is visible when the API is reached through the web app origin', () => {
    assert.equal(sessionCookieVisible('team-synk-omega.vercel.app', ''), true);
  });

  it('is visible on localhost even though the ports differ', () => {
    assert.equal(sessionCookieVisible('localhost:3000', 'http://localhost:5000'), true);
  });

  it('is NOT visible when the API is on an unrelated domain (would cause a redirect loop)', () => {
    assert.equal(
      sessionCookieVisible('team-synk-omega.vercel.app', 'https://teamsync-server.onrender.com'),
      false,
    );
  });

  it('is visible when both share the configured cookie domain', () => {
    assert.equal(
      sessionCookieVisible('app.example.com', 'https://api.example.com', 'example.com'),
      true,
    );
    assert.equal(
      sessionCookieVisible('evilexample.com', 'https://api.example.com', 'example.com'),
      false,
    );
  });

  it('treats an unparsable auth URL as not visible', () => {
    assert.equal(sessionCookieVisible('localhost:3000', 'not a url'), false);
  });
});
