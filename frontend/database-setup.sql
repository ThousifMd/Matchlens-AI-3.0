-- MatchlensAI Database Setup
-- Run this SQL in your Supabase SQL Editor

-- 1. Create onboarding table
CREATE TABLE IF NOT EXISTS onboarding (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    email VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255),
    dating_goals TEXT,
    current_dating_apps TEXT[],
    bio TEXT,
    interests TEXT[],
    photos JSONB DEFAULT '[]'::jsonb,
    bio_screenshots JSONB DEFAULT '[]'::jsonb,
    additional_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create payments table
CREATE TABLE IF NOT EXISTS payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES onboarding(customer_id) ON DELETE CASCADE,
    paypal_order_id VARCHAR(255) UNIQUE,
    paypal_transaction_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    pricing_option VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'paypal',
    payer_email VARCHAR(255),
    payer_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public insert on onboarding" ON onboarding FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on onboarding" ON onboarding FOR SELECT USING (true);
CREATE POLICY "Allow public update on onboarding" ON onboarding FOR UPDATE USING (true);

CREATE POLICY "Allow public insert on payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Allow public update on payments" ON payments FOR UPDATE USING (true);

-- 5. Create storage buckets (run these in Supabase Storage section)
-- Bucket: profile-photos (public, 10MB limit, image types only) ✅ Already exists
-- Bucket: screenshots (public, 10MB limit, image types only) ✅ Already exists
