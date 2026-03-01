import { SignUp } from "@clerk/nextjs";

/**
 * Sign Up Page - React Server Component
 * Uses Clerk's pre-built SignUp component
 */
export const metadata = {
  title: "Sign Up - AI Chatbot",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4">
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-dark-800 border border-dark-700 shadow-2xl",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/chat"
        />
      </div>
    </div>
  );
}
