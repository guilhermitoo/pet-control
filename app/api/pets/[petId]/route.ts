// app/api/pets/[petId]/route.ts
import { getAuthSession } from "@/app/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET para buscar um pet específico
export async function GET(
  request: Request,
  { params }: { params: { petId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const petId = params.petId;

    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: {
        tutores: {
          include: {
            tutor: true,
          },
        },
      },
    });

    if (!pet) {
      return new NextResponse("Pet não encontrado", { status: 404 });
    }

    // Formatar os dados
    const formattedPet = {
      ...pet,
      tutores: pet.tutores.map((pt) => ({
        id: pt.tutor.id,
        nome: pt.tutor.nome,
        email: pt.tutor.email,
        isPrimario: pt.isPrimario,
      })),
    };

    return NextResponse.json(formattedPet);
  } catch (error) {
    console.error("[PET_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

// PATCH para atualizar um pet
export async function PATCH(
  request: Request,
  { params }: { params: { petId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const petId = params.petId;
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

    // Verificar se o pet existe
    const existingPet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!existingPet) {
      return new NextResponse("Pet não encontrado", { status: 404 });
    }

    // Validações
    if (!nome) {
      return new NextResponse("Nome é obrigatório", { status: 400 });
    }

    if (!tutores || tutores.length === 0) {
      return new NextResponse("Pelo menos um tutor é obrigatório", { status: 400 });
    }

    // Garantir que apenas um tutor é primário
    const primaryTutors = tutores.filter((t: any) => t.isPrimario);
    if (primaryTutors.length === 0) {
      return new NextResponse("Deve haver um tutor primário", { status: 400 });
    }
    if (primaryTutors.length > 1) {
      return new NextResponse("Apenas um tutor pode ser primário", { status: 400 });
    }

    // Usar uma transação para garantir a integridade dos dados
    const updatedPet = await prisma.$transaction(async (tx) => {
      // 1. Atualizar os dados básicos do pet
      const pet = await tx.pet.update({
        where: { id: petId },
        data: {
          nome,
          foto,
          dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
          raca,
          peso: peso ? parseFloat(peso) : null,
          sexo: sexo || null,
          alergias,
          observacoes,
          usaTaxiDog: !!usaTaxiDog,
        },
      });

      // 2. Remover todos os tutores existentes
      await tx.petTutor.deleteMany({
        where: { petId },
      });

      // 3. Adicionar os novos tutores
      for (const tutor of tutores) {
        await tx.petTutor.create({
          data: {
            petId,
            tutorId: tutor.id,
            isPrimario: tutor.isPrimario,
          },
        });
      }

      return pet;
    });

    return NextResponse.json(updatedPet);
  } catch (error) {
    console.error("[PET_PATCH]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

// DELETE para remover um pet
export async function DELETE(
  request: Request,
  { params }: { params: { petId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const petId = params.petId;

    // Verificar se o pet existe
    const existingPet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!existingPet) {
      return new NextResponse("Pet não encontrado", { status: 404 });
    }

    // Remover o pet (Prisma já deve remover as relações com cascade)
    await prisma.pet.delete({
      where: { id: petId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PET_DELETE]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}