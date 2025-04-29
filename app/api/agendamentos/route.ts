// app/api/agendamentos/route.ts
import { getAuthSession } from "@/app/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET para listar todos os agendamentos
export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const petId = searchParams.get("petId");
    const status = searchParams.get("status");
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");
    const search = searchParams.get("search");
    
    let whereClause: any = {};
    
    // Filtrar por pet
    if (petId) {
      whereClause.petId = petId;
    }
    
    // Filtrar por status
    if (status) {
      whereClause.status = status;
    }
    
    // Filtrar por data
    if (dataInicio || dataFim) {
      whereClause.data = {};
      
      if (dataInicio) {
        try {
          const dataInicioObj = new Date(dataInicio);
          // Verificar se a data é válida
          if (!isNaN(dataInicioObj.getTime())) {
            whereClause.data.gte = dataInicioObj;
          }
        } catch (error) {
          console.error("Data início inválida:", dataInicio);
          // Não adicionar o filtro se a data for inválida
        }
      }
      
      if (dataFim) {
        try {
          // Ajustar para o final do dia
          const fimDoDia = new Date(dataFim);
          // Verificar se a data é válida
          if (!isNaN(fimDoDia.getTime())) {
            fimDoDia.setHours(23, 59, 59, 999);
            whereClause.data.lte = fimDoDia;
          }
        } catch (error) {
          console.error("Data fim inválida:", dataFim);
          // Não adicionar o filtro se a data for inválida
        }
      }
    }

    // Busca por pet ou tutor
    if (search) {
      whereClause.OR = [
        {
          pet: {
            nome: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          pet: {
            tutores: {
              some: {
                tutor: {
                  nome: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        },
      ];
    }

    const agendamentos = await prisma.agendamento.findMany({
      where: whereClause,
      orderBy: [
        { data: "asc" },
        { horaInicio: "asc" },
      ],
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

    // Formatar os dados para o front-end
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
        transporteEntrada: agendamento.transporteEntrada,
        transporteSaida: agendamento.transporteSaida,
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

    return NextResponse.json(formattedAgendamentos);
  } catch (error) {
    console.error("[AGENDAMENTOS_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

// POST para criar um novo agendamento
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

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

    // Validações básicas
    if (!petId) {
      return new NextResponse("Pet é obrigatório", { status: 400 });
    }

    if (!data || !horaInicio) {
      return new NextResponse("Data e hora são obrigatórios", { status: 400 });
    }

    if (!servicos || servicos.length === 0) {
      return new NextResponse("Pelo menos um serviço é obrigatório", { status: 400 });
    }

    // Verificar se o pet existe
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      return new NextResponse("Pet não encontrado", { status: 404 });
    }

    // Criar o agendamento
    const dataAgendamento = new Date(data);
    const horaInicioDate = new Date(`${data}T${horaInicio}`);
    const horaFimDate = horaFim ? new Date(`${data}T${horaFim}`) : null;

    const agendamento = await prisma.agendamento.create({
      data: {
        petId,
        data: dataAgendamento,
        horaInicio: horaInicioDate,
        horaFim: horaFimDate,
        observacoes,
        status: status || "AGENDADO",
        statusPagamento: statusPagamento || "PENDENTE",
        metodoPagamento,
        valorTotal,
        transporteEntrada: transporteEntrada || "DONO_TRAZ",
        transporteSaida: transporteSaida || "DONO_BUSCA",
        enviarNotificacao: enviarNotificacao || false,
        servicos: {
          create: servicos.map((s: any) => ({
            servicoId: s.id,
            preco: s.preco,
          })),
        },
      },
      include: {
        pet: true,
        servicos: {
          include: {
            servico: true,
          },
        },
      },
    });

    return NextResponse.json(agendamento);
  } catch (error) {
    console.error("[AGENDAMENTOS_POST]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}