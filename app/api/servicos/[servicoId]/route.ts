// app/api/servicos/[servicoId]/route.ts
import { getAuthSession } from "@/app/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET para buscar um serviço específico
export async function GET(
  request: Request,
  { params }: { params: { servicoId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const servicoId = (await params).servicoId;

    const servico = await prisma.servico.findUnique({
      where: { id: servicoId },
      include: {
        precos: true,
      },
    });

    console.log(servico);

    if (!servico) {
      return new NextResponse("Serviço não encontrado", { status: 404 });
    }

    return NextResponse.json(servico);
  } catch (error) {
    console.error("[SERVICO_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

// PATCH para atualizar um serviço
export async function PATCH(
  request: Request,
  { params }: { params: { servicoId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const servicoId = (await params).servicoId;
    const body = await request.json();
    const { nome, observacoes, precos } = body;

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

    if (!precos?.length) {
      return new NextResponse("Adicione pelo menos um preço", { status: 400 });
    }

    // Atualizar o serviço usando uma transação
    const servico = await prisma.$transaction(async (tx) => {
      // 1. Remover todos os preços existentes
      await tx.preco.deleteMany({
        where: { servicoId },
      });

      // 2. Atualizar o serviço e criar novos preços
      return tx.servico.update({
        where: { id: servicoId },
        data: {
          nome,
          observacoes,
          precos: {
            create: precos.map((p: any) => ({
              raca: p.raca || null,
              peso: p.peso || null,
              preco: p.preco,
            })),
          },
        },
        include: {
          precos: true,
        },
      });
    });

    return NextResponse.json(servico);
  } catch (error) {
    console.error("[SERVICO_PATCH]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

// DELETE para remover um serviço
export async function DELETE(
  request: Request,
  { params }: { params: { servicoId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const servicoId = (await params).servicoId;

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