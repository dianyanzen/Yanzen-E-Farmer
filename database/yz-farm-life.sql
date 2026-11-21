CREATE TABLE yz_game_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT yz_game_user_email_size CHECK (octet_length(email) <= 254)
);

CREATE TABLE yz_game_sessions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES yz_game_users(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX yz_game_sessions_expiry_idx ON yz_game_sessions (expires_at);

CREATE TABLE yz_game_saves (
  user_id uuid PRIMARY KEY REFERENCES yz_game_users(id) ON DELETE CASCADE,
  version smallint NOT NULL DEFAULT 1 CHECK (version = 1),
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT yz_game_save_object CHECK (jsonb_typeof(data) = 'object'),
  CONSTRAINT yz_game_save_limit CHECK (octet_length(data::text) <= 131072)
);
