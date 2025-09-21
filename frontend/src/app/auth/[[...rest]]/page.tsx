"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to home page since we removed Clerk authentication
        router.push('/');
    }, [router]);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Redirecting...</h1>
                <p className="text-gray-400">Taking you back to the home page.</p>
            </div>
        </div>
    );
}
