// app/dashboard/servicos/page.tsx
import { getAuthSession } from "@/app/auth";
import { ServicosClient } from "./components/ServicosClient";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function ServicosPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  // Buscar todos os serviços
  const servicos = await prisma.servico.findMany({
    orderBy: {
      nome: "asc",
    },
    include: {
      precos: true,
    },
  });

  // Formatar os dados para o componente cliente
  const formattedServicos = servicos.map((servico) => ({
    id: servico.id,
    nome: servico.nome,
    observacoes: servico.observacoes || "",
    precos: servico.precos.map(preco => ({
      id: preco.id,
      raca: preco.raca,
      peso: preco.peso,
      preco: preco.preco
    })),
    createdAt: servico.createdAt.toISOString(),
    updatedAt: servico.updatedAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Serviços</h1>
      </div>
      
      <ServicosClient initialServicos={formattedServicos} />
    </div>
  );
}