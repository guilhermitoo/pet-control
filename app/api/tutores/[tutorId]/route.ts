// app/api/tutores/[tutorId]/route.ts
import { getAuthSession } from "@/app/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET para buscar um tutor específico
export async function GET(
  request: Request,
  { params }: { params: { tutorId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const tutorId = params.tutorId;

    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!tutor) {
      return new NextResponse("Tutor não encontrado", { status: 404 });
    }

    return NextResponse.json(tutor);
  } catch (error) {
    console.error("[TUTOR_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

// PATCH para atualizar um tutor
export async function PATCH(
  request: Request,
  { params }: { params: { tutorId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const tutorId = params.tutorId;
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
    
    // Verificar se o tutor existe
    const existingTutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!existingTutor) {
      return new NextResponse("Tutor não encontrado", { status: 404 });
    }

    // Validações básicas
    if (!nome) {
      return new NextResponse("Nome é obrigatório", { status: 400 });
    }
    if (!telefone) {
      return new NextResponse("Telefone é obrigatório", { status: 400 });
    }


    // Atualizar o tutor
    const updatedTutor = await prisma.tutor.update({
      where: { id: tutorId },
      data: {
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
      },
    });

    return NextResponse.json(updatedTutor);
  } catch (error) {
    console.error("[TUTOR_PATCH]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

// DELETE para remover um tutor
export async function DELETE(
  request: Request,
  { params }: { params: { tutorId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const tutorId = params.tutorId;
    
    // Verificar se o tutor existe
    const existingTutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!existingTutor) {
      return new NextResponse("Tutor não encontrado", { status: 404 });
    }

    // Verificar se o tutor está associado a algum pet
    const petAssociations = await prisma.petTutor.findMany({
      where: { tutorId },
    });

    if (petAssociations.length > 0) {
      return new NextResponse(
        "Este tutor está associado a um ou mais pets e não pode ser excluído",
        { status: 400 }
      );
    }

    // Remover o tutor
    await prisma.tutor.delete({
      where: { id: tutorId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TUTOR_DELETE]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}