import { supabase, TABLES, STORAGE_BUCKETS, isSupabaseConfigured, type PaymentData, type OnboardingData } from './supabase'

/**
 * Sanitize filename for Supabase Storage
 * Removes/replaces invalid characters that cause "Invalid key" errors
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
}

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
        console.log(`📄 File details:`, {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        })

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            console.error('❌ Upload error:', error)
            console.error('❌ Upload error details:', JSON.stringify(error, null, 2))
            return { success: false, error: error.message }
        }

        console.log('✅ Upload response:', data)

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
 * Upload multiple files in parallel with progress tracking
 */
export async function uploadFiles(
    files: File[],
    bucket: string,
    basePath: string,
    onProgress?: (completed: number, total: number) => void
): Promise<{ success: boolean; urls?: string[]; errors?: string[] }> {
    console.log(`📤 Starting parallel upload of ${files.length} files to ${bucket}/${basePath}`)

    // Compress images before upload for faster transfer
    const processedFiles = await Promise.all(
        files.map(async (file) => {
            if (file.type.startsWith('image/')) {
                return await compressImage(file)
            }
            return file
        })
    )

    let completedCount = 0
    const results = await Promise.all(
        processedFiles.map(async (file, index) => {
            const sanitizedName = sanitizeFilename(file.name)
            const fileName = `${Date.now()}-${index}-${sanitizedName}`
            const filePath = `${basePath}/${fileName}`
            console.log(`📤 Uploading file ${index + 1}/${files.length}: ${file.name} -> ${sanitizedName}`)

            const result = await uploadFile(file, bucket, filePath)
            completedCount++
            onProgress?.(completedCount, files.length)

            return result
        })
    )

    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    console.log(`📊 Upload results: ${successful.length} successful, ${failed.length} failed`)

    if (failed.length > 0) {
        console.warn('⚠️ Some files failed to upload:', failed)
    }

    if (successful.length > 0) {
        console.log('✅ Successfully uploaded files:', successful.map(r => r.url))
    }

    return {
        success: successful.length > 0,
        urls: successful.map(r => r.url!).filter(Boolean),
        errors: failed.map(r => r.error!).filter(Boolean)
    }
}

/**
 * Compress image files to reduce upload time
 */
async function compressImage(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        const img = new Image()

        img.onload = () => {
            // Calculate new dimensions (max 1920px width)
            const maxWidth = 1920
            const maxHeight = 1920
            let { width, height } = img

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height)
                width *= ratio
                height *= ratio
            }

            canvas.width = width
            canvas.height = height

            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height)

            canvas.toBlob((blob) => {
                if (blob) {
                    const compressedFile = new File([blob], file.name, {
                        type: file.type,
                        lastModified: Date.now()
                    })
                    console.log(`🗜️ Compressed ${file.name}: ${file.size} -> ${compressedFile.size} bytes`)
                    resolve(compressedFile)
                } else {
                    resolve(file) // Fallback to original if compression fails
                }
            }, file.type, quality)
        }

        img.src = URL.createObjectURL(file)
    })
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
        console.log('📊 Input data:', {
            onboardingDataKeys: Object.keys(onboardingData),
            profilePhotosCount: profilePhotos.length,
            screenshotsCount: screenshots.length,
            profilePhotosTypes: profilePhotos.map(f => f.constructor.name),
            screenshotsTypes: screenshots.map(f => f.constructor.name)
        })

        // Check if Supabase is configured
        const isConfigured = isSupabaseConfigured()
        console.log('🔍 Supabase configured:', isConfigured)

        if (!isConfigured) {
            console.log('⚠️ Supabase not configured. Logging onboarding data to console and localStorage.')
            console.log('📝 ONBOARDING DATA:', onboardingData)
            console.log('📸 Profile photos:', profilePhotos.length)
            console.log('📱 Screenshots:', screenshots.length)
            localStorage.setItem('lastOnboardingData', JSON.stringify(onboardingData))
            localStorage.setItem('lastProfilePhotos', JSON.stringify(profilePhotos.map(f => ({ name: f.name, size: f.size, type: f.type }))))
            localStorage.setItem('lastScreenshots', JSON.stringify(screenshots.map(f => ({ name: f.name, size: f.size, type: f.type }))))
            return { success: true, customerId: 'local-' + Date.now() }
        }

        // Step 1 & 2: Upload photos and screenshots in parallel for maximum speed
        const uploadId = `customer-${Date.now()}`
        console.log('🚀 Starting parallel uploads for faster processing...')

        const uploadPromises: Promise<{ success: boolean; urls?: string[]; errors?: string[] }>[] = []

        // Add profile photos upload promise
        if (profilePhotos.length > 0) {
            console.log('📸 Queueing profile photos upload...', {
                count: profilePhotos.length,
                bucket: STORAGE_BUCKETS.PHOTOS
            })
            uploadPromises.push(
                uploadFiles(
                    profilePhotos,
                    STORAGE_BUCKETS.PHOTOS,
                    uploadId,
                    (completed, total) => console.log(`📸 Photos: ${completed}/${total} uploaded`)
                )
            )
        }

        // Add screenshots upload promise
        if (screenshots.length > 0) {
            console.log('📱 Queueing screenshots upload...', {
                count: screenshots.length,
                bucket: STORAGE_BUCKETS.BIO_SCREENSHOTS
            })
            uploadPromises.push(
                uploadFiles(
                    screenshots,
                    STORAGE_BUCKETS.BIO_SCREENSHOTS,
                    uploadId,
                    (completed, total) => console.log(`📱 Screenshots: ${completed}/${total} uploaded`)
                )
            )
        }

        // Execute all uploads in parallel
        const uploadResults = await Promise.all(uploadPromises)

        // Process results
        let photoUrls: string[] = []
        let screenshotUrls: string[] = []

        if (profilePhotos.length > 0 && uploadResults[0]) {
            const photosResult = uploadResults[0]
            if (photosResult.success && photosResult.urls) {
                photoUrls = photosResult.urls
                console.log('✅ Profile photos uploaded successfully:', photoUrls.length)
            } else {
                console.error('❌ Profile photos upload failed:', photosResult.errors)
            }
        }

        if (screenshots.length > 0) {
            const screenshotsResult = uploadResults[profilePhotos.length > 0 ? 1 : 0]
            if (screenshotsResult?.success && screenshotsResult.urls) {
                screenshotUrls = screenshotsResult.urls
                console.log('✅ Screenshots uploaded successfully:', screenshotUrls.length)
            } else {
                console.error('❌ Screenshots upload failed:', screenshotsResult?.errors)
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



