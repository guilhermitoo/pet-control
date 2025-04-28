// app/api/agendamentos/calcular-preco/route.ts
import { getAuthSession } from "@/app/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const body = await request.json();
    const { petId, servicoIds } = body;

    if (!petId || !servicoIds || !Array.isArray(servicoIds) || servicoIds.length === 0) {
      return new NextResponse("Dados inválidos. Pet e serviços são obrigatórios", { status: 400 });
    }

    // Buscar o pet
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      return new NextResponse("Pet não encontrado", { status: 404 });
    }

    // Buscar os serviços
    const servicos = await prisma.servico.findMany({
      where: {
        id: { in: servicoIds },
      },
      include: {
        precos: true,
      },
    });

    if (servicos.length !== servicoIds.length) {
      return new NextResponse("Um ou mais serviços não foram encontrados", { status: 404 });
    }

    // Calcular o preço para cada serviço
    const result = [];
    let valorTotal = 0;

    for (const servico of servicos) {
      let precoServico = 0;
      let precoEncontrado = false;

      // Se o pet tem raça e peso, procurar por correspondência exata
      if (pet.raca && pet.peso) {
        const precoRacaPeso = servico.precos.find(
          (p) => p.raca === pet.raca && p.peso === Math.round(pet.peso!)
        );

        if (precoRacaPeso) {
          precoServico = precoRacaPeso.preco;
          precoEncontrado = true;
        }
      }

      // Se não encontrou por raça e peso, procurar só por raça
      if (!precoEncontrado && pet.raca) {
        const precoRaca = servico.precos.find(
          (p) => p.raca === pet.raca && p.peso === null
        );

        if (precoRaca) {
          precoServico = precoRaca.preco;
          precoEncontrado = true;
        }
      }

      // Se não encontrou por raça, procurar só por peso
      if (!precoEncontrado && pet.peso) {
        const precoPeso = servico.precos.find(
          (p) => p.raca === null && p.peso === Math.round(pet.peso!)
        );

        if (precoPeso) {
          precoServico = precoPeso.preco;
          precoEncontrado = true;
        }
      }

      // Se ainda não encontrou, procurar pelo preço base (sem raça e sem peso)
      if (!precoEncontrado) {
        const precoBase = servico.precos.find(
          (p) => p.raca === null && p.peso === null
        );

        if (precoBase) {
          precoServico = precoBase.preco;
          precoEncontrado = true;
        }
      }

      // Se não encontrou nenhum preço correspondente, usar o primeiro preço disponível
      if (!precoEncontrado && servico.precos.length > 0) {
        precoServico = servico.precos[0].preco;
      }

      result.push({
        id: servico.id,
        nome: servico.nome,
        preco: precoServico,
      });

      valorTotal += precoServico;
    }

    return NextResponse.json({
      servicos: result,
      valorTotal,
    });
  } catch (error) {
    console.error("[CALCULAR_PRECO]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}