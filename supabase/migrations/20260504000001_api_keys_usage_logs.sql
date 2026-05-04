-- API keys (encrypted)
CREATE TABLE api_keys (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid        REFERENCES auth.users NOT NULL,
  provider       text        NOT NULL,
  encrypted_key  text        NOT NULL,
  sync_tokens    boolean     DEFAULT true,
  created_at     timestamptz DEFAULT now(),
  last_synced_at timestamptz,
  UNIQUE (user_id, provider)
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own api_keys" ON api_keys
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Usage logs (from API sync or manual import)
CREATE TABLE usage_logs (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        REFERENCES auth.users NOT NULL,
  provider      text        NOT NULL,
  date          date        NOT NULL,
  tokens_input  bigint      DEFAULT 0,
  tokens_output bigint      DEFAULT 0,
  cost_usd      numeric(10,6),
  source        text        NOT NULL, -- 'api_sync' | 'manual_import'
  created_at    timestamptz DEFAULT now(),
  UNIQUE (user_id, provider, date)
);

ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own usage_logs" ON usage_logs
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX ON usage_logs (user_id, provider, date DESC);
