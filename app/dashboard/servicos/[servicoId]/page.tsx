import { getAuthSession } from "@/app/auth";
import { ServicoForm } from "../components/ServicoForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import prisma from "@/lib/prisma";

interface ServicoPageProps {
  params: {
    servicoId: string;
  };
}

export default async function EditServicoPage({ params }: ServicoPageProps) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  const servico = await prisma.servico.findUnique({
    where: { id: params.servicoId },
    include: {
      precosPorPeso: true,
      precosPorRaca: true,
    },
  });

  if (!servico) {
    redirect("/dashboard/servicos");
  }

  // Formatar os dados para o formulário
  const formattedServico = {
    id: servico.id,
    nome: servico.nome,
    observacoes: servico.observacoes || "",
    tipoPrecificacao: servico.tipoPrecificacao,
    precosPorPeso: servico.precosPorPeso,
    precosPorRaca: servico.precosPorRaca,
  };

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
        <h1 className="text-3xl font-bold text-gray-800">Editar Serviço</h1>
        <p className="mt-2 text-gray-600">
          Atualize os dados do serviço {servico.nome}.
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <ServicoForm initialData={formattedServico} isEditing />
      </div>
    </div>
  );
}