import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SignInClient from "@/components/auth/sign-in-client";

export default async function Page() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }
  return <SignInClient />;
}
