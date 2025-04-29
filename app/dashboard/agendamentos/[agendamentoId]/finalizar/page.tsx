// app/dashboard/agendamentos/[agendamentoId]/finalizar/page.tsx
import { getAuthSession } from "@/app/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { ChecklistForm } from "../../components/ChecklistForm";

interface FinalizarAgendamentoPageProps {
  params: {
    agendamentoId: string;
  };
}

export default async function FinalizarAgendamentoPage({ params }: FinalizarAgendamentoPageProps) {
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
        checklist: true,
      },
    });

    if (!agendamento) {
      redirect("/dashboard/agendamentos");
    }

    // Verificar se o agendamento está em andamento ou concluído
    if (agendamento.status !== "EM_ANDAMENTO" && agendamento.status !== "CONCLUIDO") {
      redirect(`/dashboard/agendamentos/${agendamentoId}`);
    }

    // Formatar dados do checklist
    const checklistData = agendamento.checklist
      ? {
          id: agendamento.checklist.id,
          agendamentoId: agendamento.checklist.agendamentoId,
          temCarrapatos: agendamento.checklist.temCarrapatos,
          temPulgas: agendamento.checklist.temPulgas,
          problemaPele: agendamento.checklist.problemaPele,
          problemaDentes: agendamento.checklist.problemaDentes,
          outrosProblemas: agendamento.checklist.outrosProblemas || "",
          observacoes: agendamento.checklist.observacoes || "",
        }
      : {
          agendamentoId: agendamentoId,
          temCarrapatos: false,
          temPulgas: false,
          problemaPele: false,
          problemaDentes: false,
          outrosProblemas: "",
          observacoes: "",
        };

    return (
      <div>
        <div className="mb-6">
          <Link
            href={`/dashboard/agendamentos/${agendamentoId}`}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft size={20} />
            <span>Voltar para o agendamento</span>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Finalizar Atendimento
          </h1>
          <p className="mt-2 text-gray-600">
            Preencha o checklist de finalização para o pet <strong>{agendamento.pet.nome}</strong>
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <ChecklistForm 
            agendamentoId={agendamentoId} 
            initialData={checklistData} 
            petNome={agendamento.pet.nome}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro ao buscar agendamento:", error);
    redirect("/dashboard/agendamentos");
  }
}