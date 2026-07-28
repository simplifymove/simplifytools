import assert from 'node:assert/strict';
import test from 'node:test';

import {
  type PublicHttpUrlResolver,
  validatePublicHttpUrl,
} from '../../lib/security/public-http-url';

function resolverFor(...addresses: string[]): PublicHttpUrlResolver {
  return async () => addresses.map((address) => ({
    address,
    family: address.includes(':') ? 6 : 4,
  }));
}

async function rejectsUrl(
  url: string,
  resolver: PublicHttpUrlResolver = resolverFor('93.184.216.34'),
) {
  await assert.rejects(
    validatePublicHttpUrl(url, resolver),
    /not allowed|only HTTP|non-public|could not be resolved|did not resolve/i,
  );
}

test('accepts public HTTPS and HTTP destinations', async () => {
  await assert.doesNotReject(
    validatePublicHttpUrl('https://example.test/path', resolverFor('93.184.216.34')),
  );
  await assert.doesNotReject(
    validatePublicHttpUrl('http://example.test/path', resolverFor('2606:4700:4700::1111')),
  );
});

test('rejects prohibited schemes and embedded credentials', async () => {
  await rejectsUrl('file:///etc/passwd');
  await rejectsUrl('ftp://example.test/file');
  await rejectsUrl('https://user:password@example.test/');
});

test('rejects localhost, loopback, private, and link-local literals', async () => {
  const destinations = [
    'http://localhost/',
    'http://service.localhost/',
    'http://127.0.0.1/',
    'http://[::1]/',
    'http://10.0.0.1/',
    'http://172.16.0.1/',
    'http://192.168.1.1/',
    'http://169.254.169.254/',
    'http://[fe80::1]/',
  ];

  for (const destination of destinations) {
    await rejectsUrl(destination);
  }
});

test('rejects multicast, unspecified, and reserved addresses', async () => {
  const destinations = [
    'http://0.0.0.0/',
    'http://224.0.0.1/',
    'http://240.0.0.1/',
    'http://192.0.2.1/',
    'http://[::]/',
    'http://[ff02::1]/',
    'http://[2001:db8::1]/',
  ];

  for (const destination of destinations) {
    await rejectsUrl(destination);
  }
});

test('rejects a hostname resolving to a private address', async () => {
  await rejectsUrl('https://private.example.test/', resolverFor('10.1.2.3'));
});

test('rejects mixed public and private DNS answers', async () => {
  await rejectsUrl(
    'https://mixed.example.test/',
    resolverFor('93.184.216.34', '192.168.1.10'),
  );
});

test('the same validator rejects unsafe redirect and subresource destinations', async () => {
  await rejectsUrl('https://redirect-target.test/', resolverFor('127.0.0.1'));
  await rejectsUrl('http://subresource.test/image.png', resolverFor('169.254.169.254'));
});
