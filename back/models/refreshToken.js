const { pool } = require('../utils/db');

const create = async (userId, tokenHash, expiresAt) => {
  const result = await pool.query(
    'INSERT INTO refresh_tokens(user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING id',
    [userId, tokenHash, expiresAt]
  );
  return result.rows[0];
};

const findValidByHash = async (tokenHash) => {
  const result = await pool.query(
    `SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens
     WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`,
    [tokenHash]
  );
  return result.rows[0];
};

const revoke = async (id) => {
  await pool.query('UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1', [id]);
};

const revokeAllForUser = async (userId) => {
  await pool.query(
    'UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL',
    [userId]
  );
};
const revokeByHash = async (tokenHash) => {
  await pool.query(
    'UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL',
    [tokenHash]
  );
};

module.exports = { create, findValidByHash, revoke, revokeAllForUser, revokeByHash };
