"use client";

import { Button } from "@/components/Button";
import { TutorData } from "../types";
import { useState } from "react";
import { Input } from "@/components/Input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { TutorRow } from "./TutorRow";

interface TutoresClientProps {
  initialTutores: TutorData[];
}

export const TutoresClient = ({ initialTutores }: TutoresClientProps) => {
  const [tutores, setTutores] = useState<TutorData[]>(initialTutores);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {      
      const response = await fetch(`/api/tutores?search=${searchTerm}`);
      const data = await response.json();
      setTutores(data);
    } catch (error) {
      console.error("Erro ao buscar tutores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTutor = (id: string) => {
    setTutores((prevTutores) => prevTutores.filter((tutor) => tutor.id !== id));
  };

  return (
    <div>
      {/* Barra de pesquisa e botão responsivos */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex w-full sm:max-w-md">
          <Input
            placeholder="Buscar por nome ou email..."
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
        <Link href="/dashboard/tutores/novo" className="flex-shrink-0">
          <Button className="w-full sm:w-auto">
            <Plus size={18} className="mr-2" />
            Novo Tutor
          </Button>
        </Link>
      </div>

      {tutores.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-lg text-gray-500">
            Nenhum tutor encontrado. Comece cadastrando o primeiro tutor!
          </p>
          <Link href="/dashboard/tutores/novo" className="mt-4 inline-block">
            <Button>
              <Plus size={18} className="mr-2" />
              Cadastrar Primeiro Tutor
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            {/* Versão para dispositivos desktop */}
            <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Nome
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Telefone
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {tutores.map((tutor) => (
                    <TutorRow
                      key={tutor.id}
                      tutor={tutor}
                      onDelete={handleDeleteTutor}
                      view="desktop"
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Versão para dispositivos móveis */}
            <div className="md:hidden space-y-4">
              {tutores.map((tutor) => (
                <TutorRow
                  key={tutor.id}
                  tutor={tutor}
                  onDelete={handleDeleteTutor}
                  view="mobile"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};