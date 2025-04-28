// app/api/agendamentos/[agendamentoId]/route.ts
import { getAuthSession } from "@/app/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET para buscar um agendamento específico
export async function GET(
  request: Request,
  { params }: { params: { agendamentoId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const agendamentoId = params.agendamentoId;

    const agendamento = await prisma.agendamento.findUnique({
      where: { id: agendamentoId },
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
    });

    if (!agendamento) {
      return new NextResponse("Agendamento não encontrado", { status: 404 });
    }

    // Formatar o agendamento para o front-end
    const tutorPrincipal = agendamento.pet.tutores[0]?.tutor;
    
    const formattedAgendamento = {
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

    return NextResponse.json(formattedAgendamento);
  } catch (error) {
    console.error("[AGENDAMENTO_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

// PATCH para atualizar um agendamento
export async function PATCH(
  request: Request,
  { params }: { params: { agendamentoId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const agendamentoId = params.agendamentoId;
    const body = await request.json();
    
    const {
      petId,
      data,
      horaInicio,
      horaFim,
      observacoes,
      status,
      statusPagamento,
      metodoPagamento,
      valorTotal,
      transporteEntrada,
      transporteSaida,
      enviarNotificacao,
      servicos,
    } = body;

    // Verificar se o agendamento existe
    const existingAgendamento = await prisma.agendamento.findUnique({
      where: { id: agendamentoId },
    });

    if (!existingAgendamento) {
      return new NextResponse("Agendamento não encontrado", { status: 404 });
    }

    // Validações
    if (petId) {
      const pet = await prisma.pet.findUnique({
        where: { id: petId },
      });

      if (!pet) {
        return new NextResponse("Pet não encontrado", { status: 404 });
      }
    }

    // Preparar os dados para atualização
    const dataAgendamento = data ? new Date(data) : undefined;
    const horaInicioDate = horaInicio && data ? new Date(`${data}T${horaInicio}`) : undefined;
    const horaFimDate = horaFim && data ? new Date(`${data}T${horaFim}`) : null;

    // Usar uma transação para garantir a integridade dos dados
    const updatedAgendamento = await prisma.$transaction(async (tx) => {
      // 1. Atualizar os dados básicos do agendamento
      const agendamento = await tx.agendamento.update({
        where: { id: agendamentoId },
        data: {
          petId,
          data: dataAgendamento,
          horaInicio: horaInicioDate,
          horaFim: horaFimDate,
          observacoes,
          status,
          statusPagamento,
          metodoPagamento,
          valorTotal,
          transporteEntrada,
          transporteSaida,
          enviarNotificacao,
        },
      });

      // 2. Se houver serviços, atualizar os serviços
      if (servicos && servicos.length > 0) {
        // Remover todos os serviços existentes
        await tx.agendamentoServico.deleteMany({
          where: { agendamentoId },
        });

        // Adicionar os novos serviços
        for (const servico of servicos) {
          await tx.agendamentoServico.create({
            data: {
              agendamentoId,
              servicoId: servico.id,
              preco: servico.preco,
            },
          });
        }
      }

      return agendamento;
    });

    // Buscar o agendamento atualizado com todos os relacionamentos
    const completeAgendamento = await prisma.agendamento.findUnique({
      where: { id: agendamentoId },
      include: {
        pet: true,
        servicos: {
          include: {
            servico: true,
          },
        },
        checklist: true,
      },
    });

    return NextResponse.json(completeAgendamento);
  } catch (error) {
    console.error("[AGENDAMENTO_PATCH]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

// DELETE para remover um agendamento
export async function DELETE(
  request: Request,
  { params }: { params: { agendamentoId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const agendamentoId = params.agendamentoId;

    // Verificar se o agendamento existe
    const existingAgendamento = await prisma.agendamento.findUnique({
      where: { id: agendamentoId },
    });

    if (!existingAgendamento) {
      return new NextResponse("Agendamento não encontrado", { status: 404 });
    }

    // Remover o agendamento (as relações serão removidas em cascata)
    await prisma.agendamento.delete({
      where: { id: agendamentoId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[AGENDAMENTO_DELETE]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}