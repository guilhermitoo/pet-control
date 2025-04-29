// app/dashboard/agendamentos/[agendamentoId]/page.tsx
import { getAuthSession } from "@/app/auth";
import { AgendamentoForm } from "../components/AgendamentoForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import prisma from "@/lib/prisma";

interface AgendamentoPageProps {
  params: {
    agendamentoId: string;
  };
}

export default async function EditarAgendamentoPage({ params }: AgendamentoPageProps) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  const agendamentoId = (await params).agendamentoId;

  try {
    // Buscar o agendamento
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: agendamentoId },
      include: {
        pet: true,
        servicos: {
          include: {
            servico: true,
          },
        },
      },
    });

    if (!agendamento) {
      redirect("/dashboard/agendamentos");
    }

    // Formatar dados para o formulário
    const formattedAgendamento = {
      id: agendamento.id,
      petId: agendamento.petId,
      data: agendamento.data.toISOString().split("T")[0],
      horaInicio: agendamento.horaInicio.toISOString().split("T")[1].substring(0, 5),
      horaFim: agendamento.horaFim 
        ? agendamento.horaFim.toISOString().split("T")[1].substring(0, 5)
        : "",
      observacoes: agendamento.observacoes || "",
      status: agendamento.status,
      statusPagamento: agendamento.statusPagamento,
      metodoPagamento: agendamento.metodoPagamento || undefined,
      valorTotal: agendamento.valorTotal,
      transporte: agendamento.transporte,
      enviarNotificacao: agendamento.enviarNotificacao,
      servicos: agendamento.servicos.map((as) => ({
        id: as.servicoId,
        preco: as.preco,
      })),
    };

    return (
      <div>
        <div className="mb-6">
          <Link
            href="/dashboard/agendamentos"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft size={20} />
            <span>Voltar para a lista de agendamentos</span>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Editar Agendamento
          </h1>
          <p className="mt-2 text-gray-600">
            Agendamento para o pet <strong>{agendamento.pet.nome}</strong>
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <AgendamentoForm initialData={formattedAgendamento} isEditing />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    redirect("/dashboard/agendamentos");
  }
}