// Email utility functions for sending confirmation emails

interface EmailData {
    to: string;
    customerName: string;
    packageName: string;
    packagePrice: number;
    orderId: string;
    expectedDelivery: string;
}

/**
 * Send confirmation email after successful payment
 */
export async function sendConfirmationEmail(emailData: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
        console.log('📧 Sending confirmation email to:', emailData.to);

        // For now, we'll use a simple approach with a public email service
        // In production, you'd want to use a proper email service like Resend, SendGrid, etc.

        const emailContent = generateEmailContent(emailData);

        // Log the email content (in production, this would be sent via email service)
        console.log('📧 Email Content:', emailContent);

        // Store email data in localStorage for now (in production, this would be sent via API)
        const emailLog = {
            timestamp: new Date().toISOString(),
            to: emailData.to,
            subject: `Order Confirmation - ${emailData.packageName}`,
            content: emailContent
        };

        // Store in localStorage for debugging
        const existingEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
        existingEmails.push(emailLog);
        localStorage.setItem('sentEmails', JSON.stringify(existingEmails));

        console.log('✅ Email confirmation logged successfully');

        return { success: true };
    } catch (error) {
        console.error('❌ Failed to send confirmation email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Generate email content for confirmation
 */
function generateEmailContent(data: EmailData): string {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 1); // 24 hours from now

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Confirmation - Matchlens AI</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .package-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .highlight { color: #667eea; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .cta-button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Your profile transformation is on its way</p>
        </div>
        
        <div class="content">
            <h2>Hi ${data.customerName}!</h2>
            
            <p>Thank you for choosing Matchlens AI! We're excited to transform your profile and help you get 10x more attention.</p>
            
            <div class="package-box">
                <h3>📦 Your Order Details</h3>
                <p><strong>Package:</strong> <span class="highlight">${data.packageName}</span></p>
                <p><strong>Amount Paid:</strong> <span class="highlight">$${data.packagePrice}</span></p>
                <p><strong>Order ID:</strong> ${data.orderId}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <h3>⏰ What Happens Next?</h3>
            <ul>
                <li><strong>Immediate:</strong> Our AI team has received your order and is reviewing your photos</li>
                <li><strong>Within 2 hours:</strong> We'll start processing your profile transformation</li>
                <li><strong>Within 24 hours:</strong> Your enhanced photos and optimized bio will be ready!</li>
            </ul>
            
            <div class="package-box">
                <h3>📅 Expected Delivery</h3>
                <p><strong>Your transformed profile will be ready by:</strong></p>
                <p class="highlight">${deliveryDate.toLocaleDateString()} at ${deliveryDate.toLocaleTimeString()}</p>
                <p><em>We'll send you another email with your results and download links!</em></p>
            </div>
            
            <h3>🚀 What You'll Receive</h3>
            <ul>
                <li>Enhanced and optimized photos</li>
                <li>Professional bio optimization</li>
                <li>Style recommendations</li>
                <li>Tips for maximum impact</li>
            </ul>
            
            <p>If you have any questions, feel free to reach out to us at <a href="mailto:support@matchlensai.com">support@matchlensai.com</a></p>
            
            <p>Thanks again for trusting us with your profile transformation!</p>
            
            <p>Best regards,<br>
            The Matchlens AI Team</p>
        </div>
        
        <div class="footer">
            <p>Matchlens AI - Transform Your Profile in 24 Hours</p>
            <p>This email was sent to ${data.to}</p>
        </div>
    </div>
</body>
</html>
  `.trim();
}

/**
 * Get expected delivery time based on package
 */
export function getExpectedDelivery(packageName: string): string {
    const now = new Date();
    const delivery = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    return delivery.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
