CREATE TABLE auth_sessions (
  id VARCHAR(64) PRIMARY KEY,
  racer_id INTEGER REFERENCES racers(id),
  created_at TIMESTAMP,
  expires_at TIMESTAMP
);