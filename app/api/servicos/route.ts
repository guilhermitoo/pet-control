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
        precos: true,
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
    const { nome, observacoes, precos } = body;

    // Validações básicas
    if (!nome) {
      return new NextResponse("Nome é obrigatório", { status: 400 });
    }

    if (!precos?.length) {
      return new NextResponse("Adicione pelo menos um preço", { status: 400 });
    }

    // Criar o serviço com seus preços
    const servico = await prisma.servico.create({
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

    return NextResponse.json(servico);
  } catch (error) {
    console.error("[SERVICOS_POST]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}