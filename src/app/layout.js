import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import "./globals.css";

/**
 * Root Layout - React Server Component (RSC)
 * Wraps the entire app with Clerk auth provider and global styles
 */
export const metadata = {
  title: "AI Chatbot - Powered by Groq",
  description:
    "An intelligent AI chatbot powered by Groq with voice I/O, real-time chat, and multi-turn conversation memory.",
  keywords: ["AI", "Chatbot", "Groq", "React", "Next.js"],
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/chat"
      signUpFallbackRedirectUrl="/chat"
      appearance={{
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#1e293b",
          colorText: "#e2e8f0",
          colorInputBackground: "#0f172a",
          colorInputText: "#ffffff",
        },
      }}
    >
      <html lang="en" className="dark">
        <body className="bg-dark-950 text-white antialiased" suppressHydrationWarning>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1e293b",
                color: "#e2e8f0",
                border: "1px solid #334155",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#1e293b",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#1e293b",
                },
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
