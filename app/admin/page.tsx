import { ROUTES } from "@/config/constants";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard (Work in Progress)</h1>
      <p className="mb-4">Welcome to the restricted admin area.</p>
      <Link href={ROUTES.DASHBOARD} className="text-blue-500 hover:underline">
        Back to Dashboard
      </Link>
    </div>
  );
}
