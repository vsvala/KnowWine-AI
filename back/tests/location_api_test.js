const { test, describe, mock, afterEach } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);

afterEach(() => {
  mock.restoreAll();
});

describe('GET /api/location', () => {
  test('returns 400 for non-numeric coordinates', async () => {
    await api.get('/api/location?lat=abc&lon=24.94').expect(400);
  });

  test('returns 400 for out-of-range coordinates', async () => {
    await api.get('/api/location?lat=999&lon=24.94').expect(400);
  });

  test('proxies a successful Photon response', async () => {
    const fakeFeatureCollection = {
      type: 'FeatureCollection',
      features: [{ properties: { city: 'Helsinki', country: 'Finland' } }],
    };
    mock.method(global, 'fetch', async () => ({
      ok: true,
      json: async () => fakeFeatureCollection,
    }));

    const response = await api.get('/api/location?lat=60.17&lon=24.94').expect(200);
    assert.deepStrictEqual(response.body, fakeFeatureCollection);
  });

  test('returns 500 when Photon responds with an error status', async () => {
    mock.method(global, 'fetch', async () => ({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    }));

    await api.get('/api/location?lat=60.17&lon=24.94').expect(500);
  });
});
