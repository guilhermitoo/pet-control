// app/login/LoginForm.tsx
"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Logo } from "@/components/Logo";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export const LoginForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      setError("Ocorreu um erro ao fazer login com Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciais inválidas");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setError("Ocorreu um erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <Logo />

      {/* <Button
        onClick={handleGoogleLogin}
        variant="outline"
        fullWidth
        disabled={isLoading}
        icon={<FcGoogle className="h-5 w-5" />}
        type="button"
      >
        Login com Google
      </Button> */}
{/* 
      <div className="flex w-full items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="mx-4 text-sm text-gray-500">ou</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div> */}

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="Seu email"
          required
          value={formData.email}
          onChange={handleChange}
        />

        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="Sua senha"
          required
          value={formData.password}
          onChange={handleChange}
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Entrar
        </Button>

        <div className="flex items-center justify-between text-sm">
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:text-blue-800"
          >
            Esqueceu a senha?
          </Link>
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-800"
          >
            Criar conta
          </Link> 
        </div>
      </form>
    </div>
  );
};