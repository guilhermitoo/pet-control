// app/api/agendamentos/[agendamentoId]/notificar/route.ts
import { getAuthSession } from "@/app/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    // Buscar agendamento com pet e tutor primário
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: agendamentoId },
      include: {
        pet: {
          include: {
            tutores: {
              where: { isPrimario: true },
              include: { tutor: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!agendamento) {
      return new NextResponse("Agendamento não encontrado", { status: 404 });
    }

    const tutorPrincipal = agendamento.pet.tutores[0]?.tutor;

    if (!tutorPrincipal || !tutorPrincipal.telefone) {
      return new NextResponse("Tutor principal não possui telefone cadastrado", { status: 400 });
    }

    // Formatar o número de telefone (remover caracteres não numéricos)
    const telefone = tutorPrincipal.telefone.replace(/\D/g, "");

    if (telefone.length < 10) {
      return new NextResponse("Número de telefone inválido", { status: 400 });
    }

    // Montar a URL para WhatsApp Web com mensagem
    const mensagem = encodeURIComponent(
      `Olá ${tutorPrincipal.nome}! O atendimento do pet ${agendamento.pet.nome} foi concluído. Você já pode vir buscá-lo em nossa loja. Obrigado!`
    );

    const whatsappUrl = `https://wa.me/55${telefone}?text=${mensagem}`;

    // Marcar agendamento como notificado
    await prisma.agendamento.update({
      where: { id: agendamentoId },
      data: { enviarNotificacao: true },
    });

    return NextResponse.json({ 
      success: true, 
      whatsappUrl,
      petNome: agendamento.pet.nome,
      tutorNome: tutorPrincipal.nome,
      telefone: tutorPrincipal.telefone
    });
  } catch (error) {
    console.error("[NOTIFICAR_WHATSAPP]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}