// app/api/tutores/route.ts
import { getAuthSession } from "@/app/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET para listar todos os tutores
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
          { email: { contains: search, mode: "insensitive" } },
          { telefone: { contains: search } },
        ],
      };
    }

    const tutores = await prisma.tutor.findMany({
      where: whereClause,
      orderBy: {
        nome: "asc",
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        cep: true,
        rua: true,
        numero: true,
        complemento: true,
        bairro: true,
        cidade: true,
        estado : true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(tutores);
  } catch (error) {
    console.error("[TUTORES_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

// POST para criar um novo tutor
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const body = await request.json();
    const { 
      nome, 
      email, 
      telefone, 
      cep, 
      rua, 
      numero, 
      complemento,
      bairro, 
      cidade, 
      estado 
    } = body;

    // Validações básicas
    if (!nome) {
      return new NextResponse("Nome é obrigatório", { status: 400 });
    }
    if (!telefone) {
      return new NextResponse("Telefone é obrigatório", { status: 400 });
    }

    let data = {
      nome,
      email,
      telefone,
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      userId: session.user.id,
    }
    
    console.log(data)

    // Criar o tutor
    const tutor = await prisma.tutor.create({
      data: data,
    });

    return NextResponse.json(tutor);
  } catch (error) {
    console.error("[TUTORES_POST]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}