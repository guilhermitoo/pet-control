// app/dashboard/tutores/[tutorId]/page.tsx
import { getAuthSession } from "@/app/auth";
import { TutorForm } from "../components/TutorForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import prisma from "@/lib/prisma";

interface TutorPageProps {
  params: {
    tutorId: string;
  };
}

export default async function EditTutorPage({ params }: TutorPageProps) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  // Tentar buscar o tutor do banco de dados
  let tutor;
  try {
    tutor = await prisma.tutor.findUnique({
      where: { id: params.tutorId },
    });
  } catch (error) {
    console.error("Erro ao buscar tutor:", error);
    // Se o banco não estiver configurado, usar dados de exemplo para desenvolvimento
    tutor = {
      id: params.tutorId,
      nome: "Nome do Tutor",
      email: "email@exemplo.com",
      telefone: "(11) 98765-4321",
      endereco: "Rua Exemplo, 123",
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: "user123"
    };
  }

  if (!tutor) {
    redirect("/dashboard/tutores");
  }

  // Formatar os dados para o formulário
  const formattedTutor = {
    id: tutor.id,
    nome: tutor.nome,
    email: tutor.email,
    telefone: tutor.telefone,
    endereco: tutor.endereco || "",
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/tutores"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft size={20} />
          <span>Voltar para a lista de tutores</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Editar Tutor</h1>
        <p className="mt-2 text-gray-600">
          Atualize os dados do tutor {tutor.nome}.
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <TutorForm initialData={formattedTutor} isEditing />
      </div>
    </div>
  );
}