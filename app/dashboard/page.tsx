// app/dashboard/page.tsx
import { getAuthSession } from "@/app/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">
          Dashboard do PetShop
        </h1>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="text-lg text-gray-600">
            Bem-vindo, {session.user?.name || "Usuário"}!
          </p>
          <p className="mt-2 text-gray-500">
            Esta é a área de dashboard do seu sistema de controle de PetShop.
            Em breve, mais funcionalidades serão adicionadas aqui.
          </p>
        </div>
      </div>
    </div>
  );
}