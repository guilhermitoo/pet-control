"use client";

import { Button } from "@/components/Button";
import { ServicoData } from "../types";
import { useState } from "react";
import { Input } from "@/components/Input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { ServicoCard } from "./ServicoCard";

interface ServicosClientProps {
  initialServicos: ServicoData[];
}

export const ServicosClient = ({ initialServicos }: ServicosClientProps) => {
  const [servicos, setServicos] = useState<ServicoData[]>(initialServicos || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/servicos?search=${searchTerm}`);
      const data = await response.json();
      // Garantir que precos existe, mesmo que vazio
      const servicosComPrecos = data.map((servico: ServicoData) => ({
        ...servico,
        precos: servico.precos || []
      }));
      setServicos(servicosComPrecos);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      setServicos([]); // Em caso de erro, define como array vazio
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteServico = (id: string) => {
    setServicos((prev) => prev.filter((servico) => servico.id !== id));
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex w-full sm:max-w-md">
          <Input
            placeholder="Buscar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
            className="!m-0 rounded-r-none"
          />
          <Button
            type="submit"
            className="rounded-l-none"
            isLoading={isLoading}
          >
            <Search size={18} />
          </Button>
        </form>
        <Link href="/dashboard/servicos/novo" className="flex-shrink-0">
          <Button className="w-full sm:w-auto">
            <Plus size={18} className="mr-2" />
            Novo Serviço
          </Button>
        </Link>
      </div>

      {servicos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-lg text-gray-500">
            Nenhum serviço encontrado. Comece cadastrando o primeiro serviço!
          </p>
          <Link href="/dashboard/servicos/novo" className="mt-4 inline-block">
            <Button>
              <Plus size={18} className="mr-2" />
              Cadastrar Primeiro Serviço
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {servicos.map((servico) => (
            <ServicoCard
              key={servico.id}
              servico={{
                ...servico,
                precos: servico.precos || [] // Garantir que precos existe
              }}
              onDelete={handleDeleteServico}
            />
          ))}
        </div>
      )}
    </div>
  );
};