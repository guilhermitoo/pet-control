// app/dashboard/pets/novo/page.tsx
import { getAuthSession } from "@/app/auth";
import { PetForm } from "../components/PetForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewPetPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/pets"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft size={20} />
          <span>Voltar para a lista de pets</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Cadastrar Novo Pet</h1>
        <p className="mt-2 text-gray-600">
          Preencha os dados do pet e adicione pelo menos um tutor responsável.
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <PetForm />
      </div>
    </div>
  );
}