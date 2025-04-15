// app/dashboard/tutores/page.tsx
import { getAuthSession } from "@/app/auth";
import { TutoresClient } from "./components/TutoresClient";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function TutoresPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  // Buscar todos os tutores
  const tutores = await prisma.tutor.findMany({
    orderBy: {
      nome: "asc",
    },
  }).catch(() => {
    // Retorna um array vazio caso o Prisma ainda não esteja configurado
    return [];
  });

  // Formatar os dados para o componente cliente
  const formattedTutores = tutores.map((tutor) => ({
    id: tutor.id,
    nome: tutor.nome,
    email: tutor.email,
    telefone: tutor.telefone,
    cep: tutor.cep || "",
    rua: tutor.rua || "",
    numero: tutor.numero || "",
    complemento: tutor.complemento || "",
    bairro: tutor.bairro || "",
    cidade: tutor.cidade || "",
    estado: tutor.estado || "",
    createdAt: tutor.createdAt.toISOString(),
    updatedAt: tutor.updatedAt.toISOString(),
  }));
  
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Tutores</h1>
      </div>
      
      <TutoresClient initialTutores={formattedTutores} />
    </div>
  );
}