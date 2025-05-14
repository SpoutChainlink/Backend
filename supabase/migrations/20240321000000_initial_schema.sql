-- Create enum types
CREATE TYPE order_type AS ENUM ('BUY', 'SELL');
CREATE TYPE order_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assets table
CREATE TABLE assets (
    id BIGSERIAL PRIMARY KEY,
    symbol TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    asset_id BIGINT REFERENCES assets(id),
    type order_type NOT NULL,
    status order_status DEFAULT 'PENDING',
    amount DECIMAL NOT NULL,
    price DECIMAL,
    external_order_id TEXT,
    api_response JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_asset_id ON orders(asset_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid()::text = wallet_address);

CREATE POLICY "Users can view their own orders"
    ON orders FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text));

CREATE POLICY "Users can create their own orders"
    ON orders FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text));

-- Create view for order history
CREATE VIEW order_history AS
SELECT 
    o.id,
    u.wallet_address,
    a.symbol as asset_symbol,
    a.name as asset_name,
    o.type,
    o.status,
    o.amount,
    o.price,
    o.created_at,
    o.updated_at
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN assets a ON o.asset_id = a.id; 