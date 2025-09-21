"use client";

import React from 'react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    // Since we removed Clerk, just redirect to checkout immediately
    React.useEffect(() => {
        if (isOpen) {
            onSuccess();
        }
    }, [isOpen, onSuccess]);

    return null;
}
