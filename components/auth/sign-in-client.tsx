"use client";
import { SignIn } from "@clerk/nextjs";

export default function SignInClient() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SignIn routing="path" path="/sign-in" afterSignInUrl="/dashboard" />
    </div>
  );
}
