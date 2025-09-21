import { SignIn, SignUp } from '@clerk/nextjs';

export default function AuthPage() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <SignUp
                    afterSignUpUrl="/onboarding"
                    afterSignInUrl="/onboarding"
                />
            </div>
        </div>
    );
}
