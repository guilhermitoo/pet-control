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
  const tutorId = (await params).tutorId;

  try {
    tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
    });
  } catch (error) {
    console.error("Erro ao buscar tutor:", error);
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
    cep: tutor.cep || "",
    rua: tutor.rua || "",
    numero: tutor.numero || "",
    complemento: tutor.complemento || "",
    bairro: tutor.bairro || "",
    cidade: tutor.cidade || "",
    estado: tutor.estado || ""
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