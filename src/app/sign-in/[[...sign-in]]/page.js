import { SignIn } from "@clerk/nextjs";

/**
 * Sign In Page - React Server Component
 * Uses Clerk's pre-built SignIn component
 */
export const metadata = {
  title: "Sign In - AI Chatbot",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-dark-800 border border-dark-700 shadow-2xl",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/chat"
        />
      </div>
    </div>
  );
}
