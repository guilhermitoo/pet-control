"use client";

import { Logo } from "@/components/Logo";
import { UserMenu } from "@/components/UserMenu";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./Button";

export const Navbar = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <Logo />
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {session?.user ? (
                <div className="flex items-center gap-4">
                  {/* Menu de usuário avançado */}
                  <UserMenu user={session.user} />
                  
                  {/* Botão de logout simples - você pode escolher usar este ou o UserMenu */}
                  {/* <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    isLoading={isLoading}
                  >
                    Sair
                  </Button> */}
                </div>
              ) : (
                <Link href="/login">
                  <Button size="sm">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};