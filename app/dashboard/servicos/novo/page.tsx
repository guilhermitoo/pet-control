// app/dashboard/servicos/novo/page.tsx
import { getAuthSession } from "@/app/auth";
import { ServicoForm } from "../components/ServicoForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NovoServicoPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/servicos"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft size={20} />
          <span>Voltar para a lista de serviços</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Cadastrar Novo Serviço</h1>
        <p className="mt-2 text-gray-600">
          Preencha os dados do serviço e defina a tabela de preços.
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <ServicoForm />
      </div>
    </div>
  );
}

// app/dashboard/servicos/[servicoId]/page.tsx
