"use client";
import { SignUp } from "@clerk/nextjs";

export default function SignUpClient() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SignUp routing="path" path="/sign-up" afterSignUpUrl="/dashboard" />
    </div>
  );
}
