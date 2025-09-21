import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Create Supabase client (will work with placeholder values for build)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
    const isConfigured = supabaseUrl !== 'https://placeholder.supabase.co' &&
        supabaseAnonKey !== 'placeholder-key' &&
        supabaseUrl !== 'YOUR_SUPABASE_URL' &&
        supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY'

    console.log('🔍 Supabase Configuration Check:', {
        supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        isConfigured
    });

    return isConfigured
}

// Database table names
export const TABLES = {
    PAYMENTS: 'payments',
    ONBOARDING: 'onboarding'
} as const

// Storage bucket names
export const STORAGE_BUCKETS = {
    PHOTOS: 'profile-photos',
    BIO_SCREENSHOTS: 'screenshots'
} as const

// Types for our data
export interface PaymentData {
    payment_id?: string
    customer_id: string
    paypal_order_id: string
    paypal_transaction_id?: string
    amount: number
    currency: string
    pricing_option: string
    status: string
    payment_method: string
    payer_email?: string
    payer_name?: string
    created_at?: string
    updated_at?: string
}

export interface OnboardingData {
    customer_id?: string
    name: string
    age: number
    email: string
    phone: string
    location: string
    dating_goals: string
    current_dating_apps: string[]
    bio: string
    interests: string[]
    photos: string[]
    bio_screenshots: string[]
    additional_info?: string
    created_at?: string
    updated_at?: string
}
