// app/register/page.tsx
import { getAuthSession } from "@/app/auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "./RegisterForm";

export default async function RegisterPage() {
  const session = await getAuthSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <RegisterForm />
      </div>
    </div>
  );
}