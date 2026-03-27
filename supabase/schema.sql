create table if not exists games (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  network       text not null,               -- 'devnet' | 'mainnet'
  amount_sol    numeric(10,4) not null,
  choice        text not null,               -- 'heads' | 'tails'
  payout_wallet text not null,
  deposit_txn   text,                        -- incoming txn signature
  result        text,                        -- 'heads' | 'tails' | null
  outcome       text,                        -- 'win' | 'lose' | null
  payout_txn    text,                        -- outgoing txn signature (wins only)
  status        text default 'pending',      -- 'pending' | 'paid' | 'flipped' | 'complete'
  ip_hash       text                         -- SHA-256 of client IP for auditing
);

create index if not exists games_status_idx on games(status);
create index if not exists games_created_at_idx on games(created_at desc);
