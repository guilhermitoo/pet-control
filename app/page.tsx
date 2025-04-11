// app/page.tsx
import { getAuthSession } from "@/app/auth";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getAuthSession();

  // Se o usuário já estiver autenticado, redirecionar para o dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8">
        <Logo />
      </div>

      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-800">
          Sistema de Controle de PetShop
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          Gerencie seu PetShop de forma eficiente e prática
        </p>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Link href="/login">
          <Button size="lg">Entrar</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline" size="lg">
            Criar conta
          </Button>
        </Link>
      </div>
    </div>
  );
}