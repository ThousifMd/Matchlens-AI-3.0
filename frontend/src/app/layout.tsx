import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { Inter } from "next/font/google";
// Temporarily disabled Clerk - add your real keys to .env.local to enable
// import { ClerkProvider } from "@clerk/nextjs";
import { PackageProvider } from "@/contexts/PackageContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});


export const metadata: Metadata = {
  title: "Matchlens AI - Transform Your Profile in 24 Hours | Get 10x More Attention",
  description: "Transform your profile in 24 hours. Get 10x more attention with AI-powered photo enhancement and bio optimization. Perfect for LinkedIn, Instagram, dating apps, and all social platforms.",
  keywords: "profile optimization, AI photo enhancement, social media success, get more attention, profile makeover, bio optimization, LinkedIn optimization, Instagram success, professional photos",
  authors: [{ name: "Matchlens AI" }],
  creator: "Matchlens AI",
  publisher: "Matchlens AI",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://matchlens.ai",
    siteName: "Matchlens AI",
    title: "Matchlens AI - Transform Your Profile in 24 Hours | Get 10x More Attention",
    description: "Transform your profile in 24 hours. Get 10x more attention with AI-powered photo enhancement and bio optimization. Perfect for LinkedIn, Instagram, dating apps, and all social platforms.",
    images: [
      {
        url: "/logos/matchboost-logo.svg",
        width: 1200,
        height: 630,
        alt: "Matchlens AI - Profile Optimization",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Matchlens AI - Transform Your Profile in 24 Hours | Get 10x More Attention",
    description: "Transform your profile in 24 hours. Get 10x more attention with AI-powered photo enhancement and bio optimization. Perfect for LinkedIn, Instagram, dating apps, and all social platforms.",
    images: ["/logos/matchboost-logo.svg"],
    creator: "@matchlensai",
  },
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
      },
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
        sizes: '32x32',
      },
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
        sizes: '16x16',
      }
    ],
    apple: [
      {
        url: '/favicon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
      }
    ],
    shortcut: '/favicon.svg',
  },
  manifest: '/manifest.json',
  other: {
    'msapplication-TileColor': '#d4ae36',
    'theme-color': '#d4ae36',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1276626097276316');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1276626097276316&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}

        {/* Microsoft Clarity Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "tee9vufnra");
            `,
          }}
        />
        {/* End Microsoft Clarity Code */}

        {/* Fix hydration issues with browser extensions */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove browser extension attributes that cause hydration mismatches
              if (typeof window !== 'undefined') {
                document.addEventListener('DOMContentLoaded', function() {
                  const body = document.body;
                  if (body) {
                    // Remove common browser extension attributes
                    body.removeAttribute('cz-shortcut-listen');
                    body.removeAttribute('data-new-gr-c-s-check-loaded');
                    body.removeAttribute('data-gr-ext-installed');
                  }
                });
              }
            `,
          }}
        />

        {/* Force avatar background to black */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                function forceAvatarBlack() {
                  // Find all avatar elements and force them to be black
                  const allElements = document.querySelectorAll('*');
                  allElements.forEach(el => {
                    // Check if this element looks like an avatar (circular with text inside)
                    const computedStyle = window.getComputedStyle(el);
                    const hasText = el.textContent && el.textContent.trim().length === 1;
                    const isCircular = computedStyle.borderRadius.includes('50%') || computedStyle.borderRadius.includes('100%');
                    const hasBackground = computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && computedStyle.backgroundColor !== 'transparent';
                    
                    if (hasText && isCircular && hasBackground) {
                      el.style.backgroundColor = '#000000';
                      el.style.background = '#000000';
                      el.style.backgroundImage = 'none';
                      el.style.setProperty('background-color', '#000000', 'important');
                      el.style.setProperty('background', '#000000', 'important');
                      el.style.setProperty('background-image', 'none', 'important');
                    }
                  });
                  
                  // Also target specific avatar classes
                  const avatars = document.querySelectorAll('[class*="avatar"], [class*="Avatar"], .cl-userButtonAvatarBox, .cl-avatarBox');
                  avatars.forEach(avatar => {
                    avatar.style.backgroundColor = '#000000';
                    avatar.style.background = '#000000';
                    avatar.style.backgroundImage = 'none';
                    avatar.style.setProperty('background-color', '#000000', 'important');
                    avatar.style.setProperty('background', '#000000', 'important');
                    avatar.style.setProperty('background-image', 'none', 'important');
                    // Target all children
                    const children = avatar.querySelectorAll('*');
                    children.forEach(child => {
                      child.style.backgroundColor = '#000000';
                      child.style.background = '#000000';
                      child.style.backgroundImage = 'none';
                      child.style.setProperty('background-color', '#000000', 'important');
                      child.style.setProperty('background', '#000000', 'important');
                      child.style.setProperty('background-image', 'none', 'important');
                    });
                  });
                  
                  // Remove the black square background behind the avatar
                  const allElementsForSquare = document.querySelectorAll('*');
                  allElementsForSquare.forEach(el => {
                    const computedStyle = window.getComputedStyle(el);
                    // Look for square elements that might be behind the avatar
                    const isSquare = !computedStyle.borderRadius.includes('50%') && !computedStyle.borderRadius.includes('100%');
                    const hasBlackBackground = computedStyle.backgroundColor === 'rgb(0, 0, 0)' || computedStyle.backgroundColor === 'rgba(0, 0, 0, 1)';
                    const hasChildWithAvatar = el.querySelector('[class*="avatar"], [class*="Avatar"]');
                    
                    if (isSquare && hasBlackBackground && hasChildWithAvatar) {
                      el.style.backgroundColor = 'transparent';
                      el.style.background = 'transparent';
                      el.style.setProperty('background-color', 'transparent', 'important');
                      el.style.setProperty('background', 'transparent', 'important');
                    }
                  });
                }

                function hideLastUsedText() {
                  // Find and hide only "Last used" text
                  const allElements = document.querySelectorAll('*');
                  allElements.forEach(el => {
                    if (el.textContent && el.textContent.trim() === 'Last used') {
                      el.style.display = 'none';
                      el.style.visibility = 'hidden';
                      el.style.opacity = '0';
                      el.style.height = '0';
                      el.style.overflow = 'hidden';
                    }
                  });
                }

                // Run immediately and on intervals
                forceAvatarBlack();
                hideLastUsedText();
                setInterval(forceAvatarBlack, 500);
                setInterval(hideLastUsedText, 500);
                
                // Run when DOM changes
                const observer = new MutationObserver(() => {
                  forceAvatarBlack();
                  hideLastUsedText();
                });
                observer.observe(document.body, { childList: true, subtree: true });
              }
            `,
          }}
        />

      </head>
      <body
        className="antialiased font-sans"
        suppressHydrationWarning={true}
      >
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <PackageProvider>
          {children}
        </PackageProvider>
      </body>
    </html>
  );
}
