import { supabase, TABLES, STORAGE_BUCKETS, isSupabaseConfigured, type PaymentData, type OnboardingData } from './supabase'

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
    file: File,
    bucket: string,
    path: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        console.log(`📤 Uploading file to ${bucket}/${path}`)

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            console.error('❌ Upload error:', error)
            return { success: false, error: error.message }
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(path)

        console.log('✅ File uploaded successfully:', urlData.publicUrl)
        return { success: true, url: urlData.publicUrl }
    } catch (error) {
        console.error('❌ Upload exception:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Upload multiple files and return their URLs
 */
export async function uploadFiles(
    files: File[],
    bucket: string,
    basePath: string
): Promise<{ success: boolean; urls?: string[]; errors?: string[] }> {
    const results = await Promise.all(
        files.map(async (file, index) => {
            const fileName = `${Date.now()}-${index}-${file.name}`
            const filePath = `${basePath}/${fileName}`
            return await uploadFile(file, bucket, filePath)
        })
    )

    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    if (failed.length > 0) {
        console.warn('⚠️ Some files failed to upload:', failed)
    }

    return {
        success: successful.length > 0,
        urls: successful.map(r => r.url!).filter(Boolean),
        errors: failed.map(r => r.error!).filter(Boolean)
    }
}

/**
 * Store payment data in Supabase
 */
export async function storePaymentData(paymentData: Omit<PaymentData, 'payment_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: PaymentData; error?: string }> {
    try {
        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
            console.log('⚠️ Supabase not configured. Logging payment data to console and localStorage.')
            console.log('💳 PAYMENT DATA:', paymentData)
            localStorage.setItem('lastPaymentData', JSON.stringify(paymentData))
            return { success: true, data: { ...paymentData, payment_id: 'local-' + Date.now() } as PaymentData }
        }

        console.log('💳 Storing payment data:', paymentData)

        const { data, error } = await supabase
            .from(TABLES.PAYMENTS)
            .insert([paymentData])
            .select()
            .single()

        if (error) {
            console.error('❌ Payment storage error:', error)
            return { success: false, error: error.message }
        }

        console.log('✅ Payment data stored successfully:', data)
        return { success: true, data }
    } catch (error) {
        console.error('❌ Payment storage exception:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Store onboarding data in Supabase
 */
export async function storeOnboardingData(onboardingData: Omit<OnboardingData, 'customer_id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: OnboardingData; error?: string }> {
    try {
        console.log('📝 Storing onboarding data:', onboardingData)

        const { data, error } = await supabase
            .from(TABLES.ONBOARDING)
            .insert([onboardingData])
            .select()
            .single()

        if (error) {
            console.error('❌ Onboarding storage error:', error)
            return { success: false, error: error.message }
        }

        console.log('✅ Onboarding data stored successfully:', data)
        return { success: true, data }
    } catch (error) {
        console.error('❌ Onboarding storage exception:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}


/**
 * Complete onboarding flow: store data + upload images
 */
export async function completeOnboardingFlow(
    onboardingData: Omit<OnboardingData, 'customer_id' | 'created_at' | 'updated_at'>,
    profilePhotos: File[],
    screenshots: File[]
): Promise<{ success: boolean; customerId?: string; error?: string }> {
    try {
        console.log('🚀 Starting complete onboarding flow...')

        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
            console.log('⚠️ Supabase not configured. Logging onboarding data to console and localStorage.')
            console.log('📝 ONBOARDING DATA:', onboardingData)
            console.log('📸 Profile photos:', profilePhotos.length)
            console.log('📱 Screenshots:', screenshots.length)
            localStorage.setItem('lastOnboardingData', JSON.stringify(onboardingData))
            localStorage.setItem('lastProfilePhotos', JSON.stringify(profilePhotos.map(f => ({ name: f.name, size: f.size, type: f.type }))))
            localStorage.setItem('lastScreenshots', JSON.stringify(screenshots.map(f => ({ name: f.name, size: f.size, type: f.type }))))
            return { success: true, customerId: 'local-' + Date.now() }
        }

        // Step 1: Upload profile photos
        let photoUrls: string[] = []
        if (profilePhotos.length > 0) {
            console.log('📸 Uploading profile photos...')
            const profilePhotosResult = await uploadFiles(
                profilePhotos,
                STORAGE_BUCKETS.PHOTOS,
                `customer-${Date.now()}`
            )

            if (profilePhotosResult.success && profilePhotosResult.urls) {
                photoUrls = profilePhotosResult.urls
                console.log('✅ Profile photos uploaded:', photoUrls.length)
            } else {
                console.warn('⚠️ Profile photos upload failed:', profilePhotosResult.errors)
            }
        }

        // Step 2: Upload screenshots
        let screenshotUrls: string[] = []
        if (screenshots.length > 0) {
            console.log('📱 Uploading screenshots...')
            const screenshotsResult = await uploadFiles(
                screenshots,
                STORAGE_BUCKETS.BIO_SCREENSHOTS,
                `customer-${Date.now()}`
            )

            if (screenshotsResult.success && screenshotsResult.urls) {
                screenshotUrls = screenshotsResult.urls
                console.log('✅ Screenshots uploaded:', screenshotUrls.length)
            } else {
                console.warn('⚠️ Screenshots upload failed:', screenshotsResult.errors)
            }
        }

        // Step 3: Store onboarding data with image URLs
        const onboardingDataWithImages = {
            ...onboardingData,
            photos: photoUrls,
            bio_screenshots: screenshotUrls
        }

        const onboardingResult = await storeOnboardingData(onboardingDataWithImages)
        if (!onboardingResult.success || !onboardingResult.data) {
            return { success: false, error: onboardingResult.error || 'Failed to store onboarding data' }
        }

        const customerId = onboardingResult.data.customer_id!
        console.log('✅ Onboarding data stored with customer_id:', customerId)

        console.log('🎉 Complete onboarding flow finished successfully!')
        return { success: true, customerId: customerId }
    } catch (error) {
        console.error('❌ Complete onboarding flow failed:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Get onboarding data by customer ID
 */
export async function getOnboardingByCustomerId(customerId: string): Promise<{ success: boolean; data?: OnboardingData; error?: string }> {
    try {
        const { data: onboardingData, error: onboardingError } = await supabase
            .from(TABLES.ONBOARDING)
            .select('*')
            .eq('customer_id', customerId)
            .single()

        if (onboardingError) {
            return { success: false, error: onboardingError.message }
        }

        return {
            success: true,
            data: onboardingData
        }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Get all payments
 */
export async function getAllPayments(): Promise<{ success: boolean; data?: PaymentData[]; error?: string }> {
    try {
        const { data, error } = await supabase
            .from(TABLES.PAYMENTS)
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Get all onboarding records
 */
export async function getAllOnboarding(): Promise<{ success: boolean; data?: OnboardingData[]; error?: string }> {
    try {
        const { data, error } = await supabase
            .from(TABLES.ONBOARDING)
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}



