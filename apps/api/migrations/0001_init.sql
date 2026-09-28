-- The server stores no plaintext secrets. `keyring` and `folders.secrets` are ciphertext
-- that only the browser can decrypt with the vault password or the recovery code.

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  github_id INTEGER NOT NULL UNIQUE,
  github_login TEXT NOT NULL,
  avatar_url TEXT,
  keyring TEXT,
  created_at INTEGER NOT NULL
);

-- `id` is the SHA-256 hash of the session cookie, so a database leak does not leak sessions.
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);

CREATE INDEX sessions_user_id ON sessions (user_id);

CREATE TABLE folders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  secrets TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (user_id, name)
);
