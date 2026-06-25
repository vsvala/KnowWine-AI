const { test, after, before, beforeEach, describe } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const app = require('../app');
const { pool, connectToDatabase } = require('../utils/db');
const helper = require('./test_helper');

const api = supertest(app);
//before() hook that calls connectToDatabase() — this creates the my_users table before any test runs,
// since tests import app.js directly and not index.js
before(async () => {
  await connectToDatabase();
});

beforeEach(async () => {
  await pool.query('DELETE FROM my_wines');
  await pool.query('DELETE FROM users');

  for (const user of helper.initialUsers) {
    //for...of block, that guarantees a specific execution order
    await pool.query('INSERT INTO users(name, username, password_hash) VALUES ($1, $2, $3)', [
      user.name,
      user.username,
      user.password_hash,
    ]);
  }
});

describe('GET /api/users', () => {
  test('returns users as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('returns all users', async () => {
    const response = await api.get('/api/users');
    assert.strictEqual(response.body.length, helper.initialUsers.length);
  });
});
describe('GET /api/users/:id', () => {
  test('returns a specific user', async () => {
    const usersAtStart = await helper.usersInDb();
    const userToView = usersAtStart[0];

    const result = await api.get(`/api/users/${userToView.id}`).expect(200);

    assert.strictEqual(result.body.name, userToView.name);
  });

  test('returns 404 for nonexistent id', async () => {
    await api.get('/api/users/999999').expect(404);
  });

  test('returns 400 for invalid id', async () => {
    await api.get('/api/users/notanumber').expect(400);
  });
});
describe('POST /api/users', () => {
  test('a valid user can be added', async () => {
    const newUser = {
      name: 'Rioja',
      username: 'SpanishRed',
      password: 'testpassword',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, helper.initialUsers.length + 1);

    const names = usersAtEnd.map((w) => w.name);
    assert(names.includes('Rioja'));
  });
  test('wine without valid name is rejected', async () => {
    const newUser = { name: 'X', username: 'ASpanish', password: 'testpassword' };

    await api.post('/api/users').send(newUser).expect(400);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, helper.initialUsers.length);
  });
  test('duplicate username is rejected', async () => {
    const duplicate = { name: 'NewUser', username: 'Peke', password: 'testpassword' };

    await api.post('/api/users').send(duplicate).expect(400);
  });
  test('username shorter than 3 characters is rejected', async () => {
    const newUser = { name: 'ValidName', username: 'ab', password: 'testpassword' };

    await api.post('/api/users').send(newUser).expect(400);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, helper.initialUsers.length);
  });
  test('username with invalid characters is rejected', async () => {
    const newUser = { name: 'ValidName', username: 'bad user!', password: 'testpassword' };

    await api.post('/api/users').send(newUser).expect(400);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, helper.initialUsers.length);
  });
  test('password shorter than 8 characters is rejected', async () => {
    const newUser = { name: 'ValidName', username: 'ValidUser', password: 'short' };

    await api.post('/api/users').send(newUser).expect(400);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, helper.initialUsers.length);
  });
});
describe('DELETE /api/users/:id', () => {
  test('a user can be deleted', async () => {
    const usersAtStart = await helper.usersInDb();
    const userToDelete = usersAtStart[0];

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { username: userToDelete.username, id: userToDelete.id },
      process.env.SECRET
    );

    await api
      .delete(`/api/users/${userToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, helper.initialUsers.length - 1);

    const names = usersAtEnd.map((w) => w.name);
    assert(!names.includes(userToDelete.name));
  });
});

// Suljetaan pool kun testit on ajettu
after(async () => {
  await pool.end();
});
