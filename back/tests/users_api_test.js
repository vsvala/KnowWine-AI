const { test, after, before, beforeEach, describe } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { pool, connectToDatabase } = require('../utils/db');
const helper = require('./test_helper');

const api = supertest(app);
//before() hook that calls connectToDatabase() — this creates the my_users table before any test runs,
// since tests import app.js directly and not index.js
before(async () => {
  await connectToDatabase();
});

let memberIds;
let adminId;
let adminToken;

const tokenFor = (username, id) => jwt.sign({ username, id }, process.env.SECRET);

beforeEach(async () => {
  await pool.query('DELETE FROM my_wines');
  await pool.query('DELETE FROM users');

  memberIds = [];
  for (const user of helper.initialUsers) {
    //for...of block, that guarantees a specific execution order
    const result = await pool.query(
      'INSERT INTO users(name, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [user.name, user.username, user.password_hash, user.role]
    );
    memberIds.push(result.rows[0].id);
  }

  const adminResult = await pool.query(
    'INSERT INTO users(name, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [
      helper.initialAdmin.name,
      helper.initialAdmin.username,
      helper.initialAdmin.password_hash,
      helper.initialAdmin.role,
    ]
  );
  adminId = adminResult.rows[0].id;
  adminToken = tokenFor(helper.initialAdmin.username, adminId);
});

describe('GET /api/users', () => {
  test('admin gets users as json', async () => {
    await api
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('admin sees all users', async () => {
    const response = await api.get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    assert.strictEqual(response.body.length, helper.initialUsers.length + 1); // +1 admin
  });

  test('a member is forbidden', async () => {
    const memberToken = tokenFor(helper.initialUsers[0].username, memberIds[0]);
    await api.get('/api/users').set('Authorization', `Bearer ${memberToken}`).expect(403);
  });

  test('an unauthenticated request is rejected', async () => {
    await api.get('/api/users').expect(401);
  });
});

describe('GET /api/users/:id', () => {
  test('a user can view their own profile', async () => {
    const memberToken = tokenFor(helper.initialUsers[0].username, memberIds[0]);

    const result = await api
      .get(`/api/users/${memberIds[0]}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(200);

    assert.strictEqual(result.body.name, helper.initialUsers[0].name);
  });

  test('admin can view another user', async () => {
    const result = await api
      .get(`/api/users/${memberIds[0]}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.strictEqual(result.body.name, helper.initialUsers[0].name);
  });

  test('a member cannot view another user', async () => {
    const memberToken = tokenFor(helper.initialUsers[0].username, memberIds[0]);
    await api
      .get(`/api/users/${memberIds[1]}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(403);
  });

  test('returns 404 for nonexistent id', async () => {
    await api.get('/api/users/999999').set('Authorization', `Bearer ${adminToken}`).expect(404);
  });

  test('returns 400 for invalid id', async () => {
    await api.get('/api/users/notanumber').set('Authorization', `Bearer ${adminToken}`).expect(400);
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
    assert.strictEqual(usersAtEnd.length, helper.initialUsers.length + 2); // +1 admin, +1 new user

    const names = usersAtEnd.map((w) => w.name);
    assert(names.includes('Rioja'));
  });
  test('wine without valid name is rejected', async () => {
    const newUser = { name: 'X', username: 'ASpanish', password: 'testpassword' };

    await api.post('/api/users').send(newUser).expect(400);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, helper.initialUsers.length + 1); // +1 admin
  });
  test('duplicate username is rejected', async () => {
    const duplicate = { name: 'NewUser', username: 'Peke', password: 'testpassword' };

    await api.post('/api/users').send(duplicate).expect(400);
  });
  test('username shorter than 3 characters is rejected', async () => {
    const newUser = { name: 'ValidName', username: 'ab', password: 'testpassword' };

    await api.post('/api/users').send(newUser).expect(400);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, helper.initialUsers.length + 1); // +1 admin
  });
  test('username with invalid characters is rejected', async () => {
    const newUser = { name: 'ValidName', username: 'bad user!', password: 'testpassword' };

    await api.post('/api/users').send(newUser).expect(400);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, helper.initialUsers.length + 1); // +1 admin
  });
  test('password shorter than 8 characters is rejected', async () => {
    const newUser = { name: 'ValidName', username: 'ValidUser', password: 'short' };

    await api.post('/api/users').send(newUser).expect(400);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, helper.initialUsers.length + 1); // +1 admin
  });
});

describe('POST /api/users/:id/role', () => {
  test('admin can promote a member to admin', async () => {
    const result = await api
      .post(`/api/users/${memberIds[0]}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' })
      .expect(200);

    assert.strictEqual(result.body.role, 'admin');

    const usersAtEnd = await helper.usersInDb();
    const promoted = usersAtEnd.find((u) => u.id === memberIds[0]);
    assert.strictEqual(promoted.role, 'admin');
  });

  test('a member cannot change roles', async () => {
    const memberToken = tokenFor(helper.initialUsers[0].username, memberIds[0]);
    await api
      .post(`/api/users/${memberIds[1]}/role`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ role: 'admin' })
      .expect(403);
  });

  test('rejects an invalid role value', async () => {
    await api
      .post(`/api/users/${memberIds[0]}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'superadmin' })
      .expect(400);
  });

  test('returns 404 for a nonexistent user', async () => {
    await api
      .post('/api/users/999999/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' })
      .expect(404);
  });
});

describe('DELETE /api/users/:id', () => {
  test('admin can delete another user', async () => {
    const usersAtStart = await helper.usersInDb();

    await api
      .delete(`/api/users/${memberIds[0]}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length - 1);
    assert(!usersAtEnd.some((u) => u.id === memberIds[0]));
  });

  test('a member cannot delete another user', async () => {
    const memberToken = tokenFor(helper.initialUsers[1].username, memberIds[1]);
    await api
      .delete(`/api/users/${memberIds[0]}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(403);
  });

  test('a member cannot delete themself', async () => {
    const memberToken = tokenFor(helper.initialUsers[0].username, memberIds[0]);
    await api
      .delete(`/api/users/${memberIds[0]}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(403);
  });
});

// Suljetaan pool kun testit on ajettu
after(async () => {
  await pool.end();
});
