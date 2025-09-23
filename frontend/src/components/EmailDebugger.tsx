"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Eye, Trash2 } from 'lucide-react';

interface EmailLog {
    timestamp: string;
    to: string;
    subject: string;
    content: string;
}

export default function EmailDebugger() {
    const [emails, setEmails] = useState<EmailLog[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);

    useEffect(() => {
        // Load emails from localStorage
        const storedEmails = localStorage.getItem('sentEmails');
        if (storedEmails) {
            setEmails(JSON.parse(storedEmails));
        }
    }, []);

    const clearEmails = () => {
        localStorage.removeItem('sentEmails');
        setEmails([]);
        setSelectedEmail(null);
    };

    const viewEmail = (email: EmailLog) => {
        setSelectedEmail(email);
    };

    if (emails.length === 0) {
        return (
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Email Debugger
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">No emails sent yet. Complete a payment to see confirmation emails here.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Email Debugger ({emails.length} emails)
                        </CardTitle>
                        <Button onClick={clearEmails} variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {emails.map((email, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="font-medium">{email.subject}</p>
                                    <p className="text-sm text-gray-600">To: {email.to}</p>
                                    <p className="text-xs text-gray-500">{new Date(email.timestamp).toLocaleString()}</p>
                                </div>
                                <Button onClick={() => viewEmail(email)} variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {selectedEmail && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Email Preview</CardTitle>
                            <Button onClick={() => setSelectedEmail(null)} variant="outline" size="sm">
                                Close
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p><strong>To:</strong> {selectedEmail.to}</p>
                                <p><strong>Subject:</strong> {selectedEmail.subject}</p>
                                <p><strong>Sent:</strong> {new Date(selectedEmail.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                                <div dangerouslySetInnerHTML={{ __html: selectedEmail.content }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
