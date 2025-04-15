// app/register/RegisterForm.tsx
"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Logo } from "@/components/Logo";
import axios from "axios";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validação de senha
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    // Validação básica
    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      // Registrar usuário
      await axios.post("/api/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Login automático após registro
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        console.error("Erro ao fazer login após registro:", result.error);
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      console.error("Erro ao registrar:", error);
      setError(
        error.response?.data || "Ocorreu um erro ao criar a conta"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <Logo />
      <h1 className="text-2xl font-bold text-gray-800">Criar nova conta</h1>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <Input
          label="Nome completo"
          name="name"
          type="text"
          placeholder="Seu nome"
          required
          value={formData.name}
          onChange={handleChange}
        />

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

        <Input
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          placeholder="Confirme sua senha"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Criar conta
        </Button>

        <div className="text-center text-sm">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-800"
          >
            Faça login
          </Link>
        </div>
      </form>
    </div>
  );
};