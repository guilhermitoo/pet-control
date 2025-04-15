// app/dashboard/pets/[petId]/page.tsx
import { getAuthSession } from "@/app/auth";
import { PetForm } from "../components/PetForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import prisma from "@/lib/prisma";

interface PetPageProps {
  params: {
    petId: string;
  };
}

export default async function EditPetPage({ params }: PetPageProps) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  const pet = await prisma.pet.findUnique({
    where: { id: params.petId },
    include: {
      tutores: {
        include: {
          tutor: true,
        },
      },
    },
  });

  if (!pet) {
    redirect("/dashboard/pets");
  }

  // Formatar os dados para o formulário
  const formattedPet = {
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
    tutores: pet.tutores.map((pt) => ({
      id: pt.tutorId,
      isPrimario: pt.isPrimario,
    })),
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/pets"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft size={20} />
          <span>Voltar para a lista de pets</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Editar Pet</h1>
        <p className="mt-2 text-gray-600">
          Atualize os dados do pet {pet.nome}.
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <PetForm initialData={formattedPet} isEditing />
      </div>
    </div>
  );
}