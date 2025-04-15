// app/api/tutores/selected/route.ts
import { getAuthSession } from "@/app/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET para buscar tutores específicos por IDs
export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");
    
    if (!idsParam) {
      return new NextResponse("IDs não fornecidos", { status: 400 });
    }
    
    const ids = idsParam.split(",");
    
    const tutores = await prisma.tutor.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
      },
    });

    return NextResponse.json(tutores);
  } catch (error) {
    console.error("[TUTORES_SELECTED_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}