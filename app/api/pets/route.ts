// app/api/pets/route.ts
import { getAuthSession } from "@/app/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET para listar todos os pets
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
          { raca: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const pets = await prisma.pet.findMany({
      where: whereClause,
      orderBy: {
        nome: "asc",
      },
      include: {
        tutores: {
          include: {
            tutor: true,
          },
        },
      },
    });

    // Transformar os dados para o formato esperado pelo frontend
    const formattedPets = pets.map((pet) => ({
      ...pet,
      tutores: pet.tutores.map((pt) => ({
        id: pt.tutor.id,
        nome: pt.tutor.nome,
        email: pt.tutor.email,
        isPrimario: pt.isPrimario,
      })),
    }));

    return NextResponse.json(formattedPets);
  } catch (error) {
    console.error("[PETS_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

// POST para criar um novo pet
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const body = await request.json();
    const {
      nome,
      foto,
      dataNascimento,
      raca,
      peso,
      sexo,
      alergias,
      observacoes,
      usaTaxiDog,
      tutores,
    } = body;

    // Validações básicas
    if (!nome) {
      return new NextResponse("Nome é obrigatório", { status: 400 });
    }

    if (!tutores || tutores.length === 0) {
      return new NextResponse("Pelo menos um tutor é obrigatório", {
        status: 400,
      });
    }

    // Garantir que apenas um tutor é primário
    const primaryTutors = tutores.filter((t: any) => t.isPrimario);
    if (primaryTutors.length === 0) {
      return new NextResponse("Deve haver um tutor primário", { status: 400 });
    }
    if (primaryTutors.length > 1) {
      return new NextResponse("Apenas um tutor pode ser primário", {
        status: 400,
      });
    }

    // Validar se os IDs dos tutores existem
    const tutorIds = tutores.map((t: any) => t.id);
    const existingTutores = await prisma.tutor.findMany({
      where: { id: { in: tutorIds } },
    });

    if (existingTutores.length !== tutorIds.length) {
      return new NextResponse("Um ou mais tutores não existem", { status: 400 });
    }

    // Criar o pet com seus relacionamentos
    const pet = await prisma.pet.create({
      data: {
        nome,
        foto,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        raca,
        peso: peso ? parseFloat(peso) : null,
        sexo: sexo as Sexo,
        alergias,
        observacoes,
        usaTaxiDog: !!usaTaxiDog,
        tutores: {
          create: tutores.map((t: any) => ({
            tutorId: t.id,
            isPrimario: t.isPrimario,
          })),
        },
      },
    });

    return NextResponse.json(pet);
  } catch (error) {
    console.error("[PETS_POST]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}