"use client";

import { Button } from "@/components/Button";
import { PetData } from "../types";
import { useState } from "react";
import { PetCard } from "./PetCard";
import Link from "next/link";
import { Input } from "@/components/Input";
import { Search } from "lucide-react";

interface PetsClientProps {
  initialPets: PetData[];
}

export const PetsClient = ({ initialPets }: PetsClientProps) => {
  const [pets, setPets] = useState<PetData[]>(initialPets);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/pets?search=${searchTerm}`);
      const data = await response.json();
      setPets(data);
    } catch (error) {
      console.error("Erro ao buscar pets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePet = (id: string) => {
    setPets((prevPets) => prevPets.filter((pet) => pet.id !== id));
  };

  return (
    <div>
      <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
        <form onSubmit={handleSearch} className="flex w-full max-w-md">
          <Input
            placeholder="Buscar pet por nome ou raça..."
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
        <Link href="/dashboard/pets/novo">
          <Button>Cadastrar Novo Pet</Button>
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <p className="text-lg text-gray-500">
            Nenhum pet encontrado. Comece cadastrando seu primeiro pet!
          </p>
          <Link href="/dashboard/pets/novo" className="mt-4 inline-block">
            <Button>Cadastrar Primeiro Pet</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} onDelete={handleDeletePet} />
          ))}
        </div>
      )}
    </div>
  );
};