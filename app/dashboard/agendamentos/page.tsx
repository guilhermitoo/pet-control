// app/dashboard/agendamentos/page.tsx
import { getAuthSession } from "@/app/auth";
import { AgendamentosClient } from "./components/AgendamentosClient";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function AgendamentosPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  // Buscar agendamentos recentes (últimos 30 dias)
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - 30);
  
  const agendamentos = await prisma.agendamento.findMany({
    where: {
      data: {
        gte: dataInicio,
      },
    },
    orderBy: {
      data: "desc",
    },
    include: {
      pet: {
        include: {
          tutores: {
            where: {
              isPrimario: true,
            },
            include: {
              tutor: true,
            },
            take: 1,
          },
        },
      },
      servicos: {
        include: {
          servico: true,
        },
      },
      checklist: true,
    },
    take: 30, // Limitar para evitar sobrecarga
  });

  // Formatar os dados para o componente cliente
  const formattedAgendamentos = agendamentos.map((agendamento) => {
    const tutorPrincipal = agendamento.pet.tutores[0]?.tutor;
    
    return {
      id: agendamento.id,
      pet: {
        id: agendamento.pet.id,
        nome: agendamento.pet.nome,
        foto: agendamento.pet.foto,
        raca: agendamento.pet.raca,
        peso: agendamento.pet.peso,
        tutorPrincipal: tutorPrincipal ? {
          id: tutorPrincipal.id,
          nome: tutorPrincipal.nome,
          telefone: tutorPrincipal.telefone,
        } : undefined,
      },
      data: agendamento.data.toISOString(),
      horaInicio: agendamento.horaInicio.toISOString(),
      horaFim: agendamento.horaFim?.toISOString(),
      observacoes: agendamento.observacoes,
      status: agendamento.status,
      statusPagamento: agendamento.statusPagamento,
      metodoPagamento: agendamento.metodoPagamento,
      valorTotal: agendamento.valorTotal,
      transporte: agendamento.transporte,
      enviarNotificacao: agendamento.enviarNotificacao,
      servicos: agendamento.servicos.map((as) => ({
        id: as.servico.id,
        nome: as.servico.nome,
        preco: as.preco,
      })),
      checklist: agendamento.checklist,
      createdAt: agendamento.createdAt.toISOString(),
      updatedAt: agendamento.updatedAt.toISOString(),
    };
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Agendamentos</h1>
      </div>
      
      <AgendamentosClient initialAgendamentos={formattedAgendamentos} />
    </div>
  );
}