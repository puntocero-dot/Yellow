-- =============================================
-- Migration: Trips & Trip Expenses
-- Run this in Supabase SQL Editor
-- =============================================

-- Trips table (programación de viajes)
CREATE TABLE IF NOT EXISTS trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  origin TEXT DEFAULT 'Los Angeles',
  destination TEXT DEFAULT 'San Salvador',
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'collecting', 'in_transit', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip expenses (costos por viaje)
CREATE TABLE IF NOT EXISTS trip_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('flight', 'luggage', 'gas', 'taxes', 'food', 'transport', 'packaging', 'other')),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trip_id and weight_pounds to orders (link orders to trips)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS trip_id UUID REFERENCES trips(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS weight_pounds DECIMAL(10,2);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trips_departure ON trips(departure_date);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trip_expenses_trip ON trip_expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_orders_trip ON orders(trip_id);

-- Enable RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_expenses ENABLE ROW LEVEL SECURITY;

-- Policies (service role bypasses RLS, these are for anon if needed)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access trips' AND tablename = 'trips') THEN
    CREATE POLICY "Service role full access trips" ON trips FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access trip_expenses' AND tablename = 'trip_expenses') THEN
    CREATE POLICY "Service role full access trip_expenses" ON trip_expenses FOR ALL USING (true);
  END IF;
END $$;
