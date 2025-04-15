"use client";

import { Button } from "@/components/Button";
import { TutorData } from "../types";
import { useState } from "react";
import { Edit, MoreHorizontal, Trash, User } from "lucide-react";
import Link from "next/link";
import axios from "axios";

interface TutorRowProps {
  tutor: TutorData;
  onDelete: (id: string) => void;
}

export const TutorRow = ({ tutor, onDelete }: TutorRowProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir o tutor ${tutor.nome}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      // No ambiente de desenvolvimento, usamos o endpoint mock
      await axios.delete(`/api/tutores/mock/${tutor.id}`);
      onDelete(tutor.id);
    } catch (error) {
      console.error("Erro ao excluir tutor:", error);
      alert("Ocorreu um erro ao excluir o tutor. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{tutor.nome}</div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <div className="text-sm text-gray-900">{tutor.email}</div>
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <div className="text-sm text-gray-900">{tutor.telefone}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {tutor.rua ? (
            <>
              {tutor.rua}, {tutor.numero || 'S/N'}
              {tutor.complemento && <span> - {tutor.complemento}</span>}
              <br />
              {tutor.bairro && <span>{tutor.bairro}, </span>}
              {tutor.cidade && <span>{tutor.cidade}</span>}
              {tutor.estado && <span> - {tutor.estado}</span>}
              {tutor.cep && <span>, CEP: {tutor.cep}</span>}
            </>
          ) : (
            "-"
          )}
        </div>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
            disabled={isLoading}
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Link
                href={`/dashboard/tutores/${tutor.id}`}
                className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
              <button
                onClick={handleDelete}
                className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                disabled={isLoading}
              >
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};