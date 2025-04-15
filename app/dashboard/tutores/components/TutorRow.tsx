"use client";

import { Button } from "@/components/Button";
import { TutorData } from "../types";
import { useState } from "react";
import { Edit, MoreHorizontal, Trash, User } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

interface TutorRowProps {
  tutor: TutorData;
  onDelete: (id: string) => void;
}

export const TutorRow = ({ tutor, onDelete }: TutorRowProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const handleDeleteClick = () => {
    setShowConfirmation(true);
    setIsMenuOpen(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      // No ambiente de desenvolvimento, usamos o endpoint mock
      await axios.delete(`/api/tutores/${tutor.id}`);
      onDelete(tutor.id);
    } catch (error) {
      console.error("Erro ao excluir tutor:", error);
      alert("Ocorreu um erro ao excluir o tutor. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/tutores/${tutor.id}`);
  };

  return (
    <tr className="hover:bg-gray-50 relative">
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
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleEdit}
            disabled={isLoading}
            className="!px-3 !py-1"
          >
            <Edit className="mr-1 h-4 w-4" />
            Editar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteClick}
            disabled={isLoading}
            className="!px-3 !py-1 text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash className="mr-1 h-4 w-4" />
            Excluir
          </Button>
        </div>

        {/* Dropdown menu (opcional, mantido como alternativa) */}
        <div className="relative hidden">
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
                onClick={handleDeleteClick}
                className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                disabled={isLoading}
              >
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </button>
            </div>
          )}
        </div>

        {/* Modal de confirmação */}
        {showConfirmation && (
          <>
            {/* Backdrop/overlay com opacidade */}
            <div className="fixed inset-0 z-40 bg-black opacity-50 "></div>
            
            {/* Conteúdo do modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center text-center backdrop-filter backdrop-blur-sm">
              <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-medium text-gray-900">Confirmar exclusão</h3>
                <p className="mb-6 text-sm text-gray-500 break-words">
                  Tutor: <span className="font-semibold">{tutor.nome}</span>?<br/>
                </p>
                <div className="flex justify-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleCancelDelete}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleConfirmDelete}
                    isLoading={isLoading}
                    className="!bg-red-600 hover:!bg-red-700"
                  >
                    Confirmar exclusão
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </td>
    </tr>
  );
};