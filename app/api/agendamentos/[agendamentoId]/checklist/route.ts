// app/api/agendamentos/[agendamentoId]/checklist/route.ts
import { getAuthSession } from "@/app/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST para criar ou atualizar o checklist
export async function POST(
  request: Request,
  { params }: { params: { agendamentoId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const agendamentoId = (await params).agendamentoId;
    const body = await request.json();
    
    const {
      temCarrapatos,
      temPulgas,
      problemaPele,
      problemaDentes,
      outrosProblemas,
      observacoes,
    } = body;

    // Verificar se o agendamento existe
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: agendamentoId },
      include: { checklist: true },
    });

    if (!agendamento) {
      return new NextResponse("Agendamento não encontrado", { status: 404 });
    }

    let checklist;

    // Se já existe um checklist, atualizar; senão, criar
    if (agendamento.checklist) {
      checklist = await prisma.checklist.update({
        where: { agendamentoId },
        data: {
          temCarrapatos: temCarrapatos ?? false,
          temPulgas: temPulgas ?? false,
          problemaPele: problemaPele ?? false,
          problemaDentes: problemaDentes ?? false,
          outrosProblemas,
          observacoes,
        },
      });
    } else {
      checklist = await prisma.checklist.create({
        data: {
          agendamentoId,
          temCarrapatos: temCarrapatos ?? false,
          temPulgas: temPulgas ?? false,
          problemaPele: problemaPele ?? false,
          problemaDentes: problemaDentes ?? false,
          outrosProblemas,
          observacoes,
        },
      });

      // Atualizar o status do agendamento para CONCLUIDO
      await prisma.agendamento.update({
        where: { id: agendamentoId },
        data: { status: "CONCLUIDO" },
      });
    }

    return NextResponse.json(checklist);
  } catch (error) {
    console.error("[CHECKLIST_POST]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

// GET para buscar o checklist
export async function GET(
  request: Request,
  { params }: { params: { agendamentoId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const agendamentoId = (await params).agendamentoId;

    const checklist = await prisma.checklist.findUnique({
      where: { agendamentoId },
    });

    if (!checklist) {
      return new NextResponse("Checklist não encontrado", { status: 404 });
    }

    return NextResponse.json(checklist);
  } catch (error) {
    console.error("[CHECKLIST_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}