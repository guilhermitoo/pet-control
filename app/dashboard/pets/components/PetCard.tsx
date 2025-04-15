"use client";

import { PetData } from "../types";
import Image from "next/image";
import { Edit, MoreHorizontal, PawPrint, Trash, Truck } from "lucide-react";
import { formatDateBR } from "@/lib/dateUtils";
import { useState, useRef } from "react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useRouter } from "next/navigation";
import axios from "axios";

interface PetCardProps {
  pet: PetData;
  onDelete: (id: string) => void;
}

export const PetCard = ({ pet, onDelete }: PetCardProps) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(menuRef, () => setIsMenuOpen(false));

  const tutorPrincipal = pet.tutores.find((tutor) => tutor.isPrimario);

  const handleEdit = () => {
    router.push(`/dashboard/pets/${pet.id}`);
    setIsMenuOpen(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir o pet ${pet.nome}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await axios.delete(`/api/pets/${pet.id}`);
      onDelete(pet.id);
    } catch (error) {
      console.error("Erro ao excluir pet:", error);
      alert("Ocorreu um erro ao excluir o pet. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Menu de ações */}
      <div className="absolute right-2 top-2 z-10">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-full bg-white p-1 shadow-sm hover:bg-gray-100"
          disabled={isLoading}
        >
          <MoreHorizontal size={20} className="text-gray-500" />
        </button>

        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 mt-1 w-36 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
          >
            <button
              onClick={handleEdit}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              disabled={isLoading}
            >
              <Edit size={16} className="mr-2" />
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              disabled={isLoading}
            >
              <Trash size={16} className="mr-2" />
              Excluir
            </button>
          </div>
        )}
      </div>

      {/* Foto do pet */}
      <div className="relative h-52 w-full overflow-hidden bg-gray-200">
        {pet.foto ? (
          <Image
            src={pet.foto}
            alt={pet.nome}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PawPrint size={64} className="text-gray-400" />
          </div>
        )}
      </div>

      {/* Informações do pet */}
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold">{pet.nome}</h3>
          {pet.usaTaxiDog && (
            <div className="flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
              <Truck size={14} className="mr-1" />
              Taxi Dog
            </div>
          )}
        </div>

        <div className="mb-3 text-sm text-gray-500">
          {pet.raca && <p>{pet.raca}</p>}
          {pet.dataNascimento && (
            <p>Nascimento: {formatDateBR(pet.dataNascimento)}</p>
          )}
          {pet.sexo && (
            <p>Sexo: {pet.sexo === "MACHO" ? "Macho" : "Fêmea"}</p>
          )}
          {pet.peso && <p>Peso: {pet.peso}kg</p>}
        </div>

        {tutorPrincipal && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-500">Tutor principal:</p>
            <p className="text-sm font-medium">{tutorPrincipal.nome}</p>
          </div>
        )}
      </div>
    </div>
  );
};