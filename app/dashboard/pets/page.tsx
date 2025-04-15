// app/dashboard/pets/page.tsx
import { getAuthSession } from "@/app/auth";
import { PetsClient } from "./components/PetsClient";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function PetsPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  // Buscar todos os pets com seus tutores
  const pets = await prisma.pet.findMany({
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

  // Formatar os dados para o componente cliente
  const formattedPets = pets.map((pet) => ({
    id: pet.id,
    nome: pet.nome,
    foto: pet.foto || "",
    dataNascimento: pet.dataNascimento ? pet.dataNascimento.toISOString().split("T")[0] : "",
    raca: pet.raca || "",
    peso: pet.peso ? pet.peso.toString() : "",
    sexo: pet.sexo || "",
    alergias: pet.alergias || "",
    observacoes: pet.observacoes || "",
    usaTaxiDog: pet.usaTaxiDog,
    createdAt: pet.createdAt.toISOString(),
    updatedAt: pet.updatedAt.toISOString(),
    tutores: pet.tutores.map((pt) => ({
      id: pt.tutor.id,
      nome: pt.tutor.nome,
      email: pt.tutor.email,
      isPrimario: pt.isPrimario,
    })),
  }));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Pets</h1>
      </div>
      
      <PetsClient initialPets={formattedPets} />
    </div>
  );
}