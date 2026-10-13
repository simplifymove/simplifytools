import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isBlockedIpAddress,
  parseWebsiteSeoUrl,
} from '../../lib/website-seo/url-safety';

test('blocks IPv6 transition and reserved addresses', () => {
  const blockedAddresses = [
    '2001::1',
    '2002::1',
    '2001:db8::1',
    '::ffff:127.0.0.1',
  ];

  for (const address of blockedAddresses) {
    assert.equal(
      isBlockedIpAddress(address),
      true,
      `${address} must be blocked`,
    );

    assert.throws(
      () => parseWebsiteSeoUrl(`http://[${address}]/`),
      /not allowed/i,
    );
  }
});

test('allows a public IPv6 address', () => {
  const address = '2606:4700:4700::1111';

  assert.equal(isBlockedIpAddress(address), false);

  assert.doesNotThrow(() => {
    parseWebsiteSeoUrl(`https://[${address}]/`);
  });
});
