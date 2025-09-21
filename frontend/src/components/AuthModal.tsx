"use client";

import React from 'react';
import { SignIn, SignUp } from '@clerk/nextjs';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                >
                    ✕
                </button>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Sign in to continue</h2>
                    <p className="text-gray-300 mb-6">Create an account or sign in to access your profile transformation</p>
                </div>
                <div className="space-y-4">
                    <SignUp
                        afterSignUpUrl="/onboarding"
                        afterSignInUrl="/onboarding"
                    />
                </div>
            </div>
        </div>
    );
}
