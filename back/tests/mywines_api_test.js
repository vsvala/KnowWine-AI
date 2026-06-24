const { test, after, before, beforeEach, describe } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { pool, connectToDatabase } = require('../utils/db');
const helper = require('./test_helper');

const api = supertest(app);

let testUserId;
let token;

before(async () => {
  await connectToDatabase();
});

beforeEach(async () => {
  await pool.query('DELETE FROM my_wines');
  await pool.query('DELETE FROM users');

  const userResult = await pool.query(
    'INSERT INTO users(name, username, password_hash) VALUES ($1, $2, $3) RETURNING id',
    ['TestUser', 'testuser', 'hashedpassword']
  );
  testUserId = userResult.rows[0].id;
  token = jwt.sign({ username: 'testuser', id: testUserId }, process.env.SECRET);

  for (const wine of helper.initialWines) {
    await pool.query('INSERT INTO my_wines(name, description) VALUES ($1, $2)', [
      wine.name,
      wine.description,
    ]);
  }
});

describe('GET /api/mywines', () => {
  test('returns wines as json', async () => {
    await api
      .get('/api/mywines')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('returns all wines', async () => {
    const response = await api.get('/api/mywines');
    assert.strictEqual(response.body.length, helper.initialWines.length);
  });
});

describe('GET /api/mywines/:id', () => {
  test('returns a specific wine', async () => {
    const winesAtStart = await helper.winesInDb();
    const wineToView = winesAtStart[0];

    const result = await api.get(`/api/mywines/${wineToView.id}`).expect(200);

    assert.strictEqual(result.body.name, wineToView.name);
  });

  test('returns 404 for nonexistent id', async () => {
    await api.get('/api/mywines/999999').expect(404);
  });

  test('returns 400 for invalid id', async () => {
    await api.get('/api/mywines/notanumber').expect(400);
  });
});

describe('POST /api/mywines', () => {
  test('a valid wine can be added', async () => {
    const newWine = {
      name: 'Rioja',
      description: 'A Spanish red wine with oak aging',
    };

    await api
      .post('/api/mywines')
      .set('Authorization', `Bearer ${token}`)
      .send(newWine)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const winesAtEnd = await helper.winesInDb();
    assert.strictEqual(winesAtEnd.length, helper.initialWines.length + 1);

    const names = winesAtEnd.map((w) => w.name);
    assert(names.includes('Rioja'));
  });

  test('wine without valid name is rejected', async () => {
    const newWine = {
      name: 'X',
      description: 'A Spanish red wine with oak aging',
    };

    await api
      .post('/api/mywines')
      .set('Authorization', `Bearer ${token}`)
      .send(newWine)
      .expect(400);

    const winesAtEnd = await helper.winesInDb();
    assert.strictEqual(winesAtEnd.length, helper.initialWines.length);
  });

  test('duplicate name is rejected', async () => {
    const duplicate = {
      name: 'Barolo',
      description: 'Another description here',
    };

    await api
      .post('/api/mywines')
      .set('Authorization', `Bearer ${token}`)
      .send(duplicate)
      .expect(400);
  });

  test('request without token is rejected', async () => {
    const newWine = { name: 'Rioja', description: 'A Spanish red wine with oak aging' };

    await api.post('/api/mywines').send(newWine).expect(401);
  });
});

describe('DELETE /api/mywines/:id', () => {
  test('a wine can be deleted', async () => {
    const winesAtStart = await helper.winesInDb();
    const wineToDelete = winesAtStart[0];

    await api.delete(`/api/mywines/${wineToDelete.id}`).expect(204);

    const winesAtEnd = await helper.winesInDb();
    assert.strictEqual(winesAtEnd.length, helper.initialWines.length - 1);

    const names = winesAtEnd.map((w) => w.name);
    assert(!names.includes(wineToDelete.name));
  });
});

// Suljetaan pool kun testit on ajettu
after(async () => {
  await pool.end();
});
