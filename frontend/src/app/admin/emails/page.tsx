"use client";

import EmailDebugger from '@/components/EmailDebugger';

export default function AdminEmailsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Debugger</h1>
                    <p className="text-gray-600">
                        View confirmation emails that would be sent after successful payments.
                        This is for development/testing purposes.
                    </p>
                </div>

                <EmailDebugger />
            </div>
        </div>
    );
}
