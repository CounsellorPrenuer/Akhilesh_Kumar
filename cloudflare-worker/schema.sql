CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  source TEXT,
  raw_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  amount INTEGER DEFAULT 0,
  plan TEXT,
  customer_name TEXT,
  customer_email TEXT,
  raw_json TEXT,
  created_at TEXT NOT NULL
);
