// app/api/servicos/route.ts
import { getAuthSession } from "@/app/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET para listar todos os serviços
export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    
    let whereClause = {};
    
    if (search) {
      whereClause = {
        OR: [
          { nome: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const servicos = await prisma.servico.findMany({
      where: whereClause,
      orderBy: {
        nome: "asc",
      },
      include: {
        precosPorPeso: true,
        precosPorRaca: true,
      },
    });

    return NextResponse.json(servicos);
  } catch (error) {
    console.error("[SERVICOS_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

// POST para criar um novo serviço
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const body = await request.json();
    const {
      nome,
      observacoes,
      tipoPrecificacao,
      precosPorPeso,
      precosPorRaca,
    } = body;

    // Validações básicas
    if (!nome) {
      return new NextResponse("Nome é obrigatório", { status: 400 });
    }

    if (!tipoPrecificacao) {
      return new NextResponse("Tipo de precificação é obrigatório", { status: 400 });
    }

    // Validar preços conforme tipo de precificação
    if (tipoPrecificacao === "PESO" || tipoPrecificacao === "AMBOS") {
      if (!precosPorPeso?.length) {
        return new NextResponse("Adicione pelo menos uma faixa de peso", { status: 400 });
      }
    }

    if (tipoPrecificacao === "RACA" || tipoPrecificacao === "AMBOS") {
      if (!precosPorRaca?.length) {
        return new NextResponse("Adicione pelo menos uma raça", { status: 400 });
      }
    }

    // Criar o serviço com suas tabelas de preços
    const servico = await prisma.servico.create({
      data: {
        nome,
        observacoes,
        tipoPrecificacao,
        precosPorPeso: {
          create: precosPorPeso.map((p: any) => ({
            pesoInicial: p.pesoInicial,
            pesoFinal: p.pesoFinal,
            preco: p.preco,
          })),
        },
        precosPorRaca: {
          create: precosPorRaca.map((p: any) => ({
            raca: p.raca,
            preco: p.preco,
          })),
        },
      },
      include: {
        precosPorPeso: true,
        precosPorRaca: true,
      },
    });

    return NextResponse.json(servico);
  } catch (error) {
    console.error("[SERVICOS_POST]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

// app/api/servicos/[servicoId]/route.ts
export async function PATCH(
  request: Request,
  { params }: { params: { servicoId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const servicoId = params.servicoId;
    const body = await request.json();
    const {
      nome,
      observacoes,
      tipoPrecificacao,
      precosPorPeso,
      precosPorRaca,
    } = body;

    // Verificar se o serviço existe
    const existingServico = await prisma.servico.findUnique({
      where: { id: servicoId },
    });

    if (!existingServico) {
      return new NextResponse("Serviço não encontrado", { status: 404 });
    }

    // Validações básicas
    if (!nome) {
      return new NextResponse("Nome é obrigatório", { status: 400 });
    }

    // Atualizar o serviço usando uma transação
    const servico = await prisma.$transaction(async (tx) => {
      // 1. Remover todos os preços existentes
      await tx.precoPorPeso.deleteMany({
        where: { servicoId },
      });
      await tx.precoPorRaca.deleteMany({
        where: { servicoId },
      });

      // 2. Atualizar o serviço e criar novos preços
      return tx.servico.update({
        where: { id: servicoId },
        data: {
          nome,
          observacoes,
          tipoPrecificacao,
          precosPorPeso: {
            create: precosPorPeso.map((p: any) => ({
              pesoInicial: p.pesoInicial,
              pesoFinal: p.pesoFinal,
              preco: p.preco,
            })),
          },
          precosPorRaca: {
            create: precosPorRaca.map((p: any) => ({
              raca: p.raca,
              preco: p.preco,
            })),
          },
        },
        include: {
          precosPorPeso: true,
          precosPorRaca: true,
        },
      });
    });

    return NextResponse.json(servico);
  } catch (error) {
    console.error("[SERVICO_PATCH]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { servicoId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const servicoId = params.servicoId;

    // Verificar se o serviço existe
    const existingServico = await prisma.servico.findUnique({
      where: { id: servicoId },
    });

    if (!existingServico) {
      return new NextResponse("Serviço não encontrado", { status: 404 });
    }

    // Remover o serviço (Prisma já remove as relações com cascade)
    await prisma.servico.delete({
      where: { id: servicoId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SERVICO_DELETE]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}