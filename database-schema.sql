-- The Yellow Express - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'driver', 'customer')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  origin_address TEXT NOT NULL DEFAULT 'Los Angeles, CA, USA',
  destination_address TEXT NOT NULL,
  destination_city VARCHAR(100) NOT NULL,
  destination_country VARCHAR(100) NOT NULL DEFAULT 'El Salvador',
  package_description TEXT,
  package_weight DECIMAL(10, 2),
  declared_value DECIMAL(10, 2),
  shipping_cost DECIMAL(10, 2),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending_confirmation',
    'pending',
    'warehouse_la',
    'warehouse_sv',
    'in_transit_international',
    'customs',
    'assigned_to_driver',
    'out_for_delivery',
    'delivered',
    'cancelled'
  )),
  driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  delivery_proof_url TEXT,
  delivery_notes TEXT,
  estimated_delivery DATE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Status history table
CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'whatsapp')),
  recipient VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI conversations table (for chatbot history)
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(50) NOT NULL,
  message_type VARCHAR(10) NOT NULL CHECK (message_type IN ('user', 'assistant')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_history_order ON status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_order ON notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_phone ON ai_conversations(phone_number);

-- Function to generate tracking number
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tracking_number := 'YE' || TO_CHAR(NOW(), 'YYYYMMDD') || UPPER(SUBSTRING(NEW.id::text, 1, 3));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate tracking number
DROP TRIGGER IF EXISTS set_tracking_number ON orders;
CREATE TRIGGER set_tracking_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.tracking_number IS NULL OR NEW.tracking_number = '')
  EXECUTE FUNCTION generate_tracking_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to log status changes
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO status_history (order_id, status, created_by)
    VALUES (NEW.id, NEW.status, NULL);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log status changes
DROP TRIGGER IF EXISTS log_order_status_change ON orders;
CREATE TRIGGER log_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_status_change();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Orders policies
CREATE POLICY "Customers can view their own orders"
  ON orders FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Drivers can view assigned orders"
  ON orders FOR SELECT
  USING (driver_id = auth.uid());

CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Drivers can update assigned orders"
  ON orders FOR UPDATE
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

-- Public access for tracking (no auth required)
CREATE POLICY "Public can view orders by tracking number"
  ON orders FOR SELECT
  USING (true);

-- Status history policies
CREATE POLICY "Users can view status history of their orders"
  ON status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = status_history.order_id 
      AND (orders.customer_id = auth.uid() OR orders.driver_id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage status history"
  ON status_history FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- AI Conversations policies (service role only for backend operations)
CREATE POLICY "Service role can manage ai_conversations"
  ON ai_conversations FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert sample data
INSERT INTO users (email, full_name, phone, role) VALUES
  ('admin@yellowexpress.com', 'Admin Yellow Express', '+1 323 555 0100', 'admin'),
  ('driver1@yellowexpress.com', 'Carlos Martínez', '+503 7890 1234', 'driver'),
  ('driver2@yellowexpress.com', 'María López', '+503 7890 5678', 'driver'),
  ('cliente@ejemplo.com', 'Juan Pérez', '+503 7000 1111', 'customer')
ON CONFLICT (email) DO NOTHING;

-- Insert sample orders
INSERT INTO orders (
  customer_name, 
  customer_email, 
  customer_phone, 
  destination_address, 
  destination_city, 
  package_description, 
  package_weight, 
  declared_value, 
  shipping_cost, 
  status
) VALUES
  ('Juan Pérez', 'juan@ejemplo.com', '+503 7000 1111', 'Col. Escalón, Calle Principal #123', 'San Salvador', 'Ropa y accesorios', 2.5, 150.00, 25.00, 'pending'),
  ('María García', 'maria@ejemplo.com', '+503 7000 2222', 'Res. Las Palmas, Casa #45', 'Santa Ana', 'Electrónicos', 1.0, 300.00, 15.00, 'warehouse_la'),
  ('Pedro Hernández', 'pedro@ejemplo.com', '+503 7000 3333', 'Av. Roosevelt, Local #78', 'San Miguel', 'Documentos importantes', 0.5, 50.00, 10.00, 'in_transit_international'),
  ('Ana Martínez', 'ana@ejemplo.com', '+503 7000 4444', 'Col. Médica, Pasaje #12', 'San Salvador', 'Medicamentos', 1.5, 200.00, 20.00, 'out_for_delivery')
ON CONFLICT DO NOTHING;

-- Storage bucket for delivery proofs (run in Supabase Dashboard > Storage)
-- Create bucket: delivery-proofs
-- Set public: true

-- ============================================
-- MIGRATION: Add pending_confirmation status
-- Run this if your database already exists
-- ============================================
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN (
  'pending_confirmation',
  'pending',
  'warehouse_la',
  'warehouse_sv',
  'in_transit_international',
  'customs',
  'assigned_to_driver',
  'out_for_delivery',
  'delivered',
  'cancelled'
));
