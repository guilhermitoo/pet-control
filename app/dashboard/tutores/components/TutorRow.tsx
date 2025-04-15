"use client";

import { Button } from "@/components/Button";
import { TutorData } from "../types";
import { useState } from "react";
import { Edit, MoreHorizontal, Trash, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

interface TutorRowProps {
  tutor: TutorData;
  onDelete: (id: string) => void;
  view: "desktop" | "mobile";
}

export const TutorRow = ({ tutor, onDelete, view }: TutorRowProps) => {
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

  // Componente para Desktop (visualização em tabela)
  if (view === "desktop") {
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
        </td>
        
        {/* Modal de confirmação */}
        {renderConfirmationModal()}
      </tr>
    );
  }

  // Componente para Mobile (visualização em cartões)
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center mb-3">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="h-5 w-5 text-blue-600" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-900">{tutor.nome}</h3>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2 mb-4">
        <div>
          <p className="text-xs text-gray-500">Email</p>
          <p className="text-sm text-gray-900">{tutor.email || "-"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Telefone</p>
          <p className="text-sm text-gray-900">{tutor.telefone}</p>
        </div>
      </div>
      
      <div className="flex gap-2 mt-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleEdit}
          disabled={isLoading}
          className="flex-1"
        >
          <Edit className="mr-1 h-4 w-4" />
          Editar
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteClick}
          disabled={isLoading}
          className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
        >
          <Trash className="mr-1 h-4 w-4" />
          Excluir
        </Button>
      </div>
      
      {/* Modal de confirmação */}
      {renderConfirmationModal()}
    </div>
  );

  // Função auxiliar para renderizar o modal de confirmação
  function renderConfirmationModal() {
    if (!showConfirmation) return null;
    
    return (
      <>
        {/* Overlay/backdrop */}
        <div className="fixed inset-0 z-40 bg-black opacity-50"></div>
        
        {/* Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center text-center backdrop-filter backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl mx-4">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Confirmar exclusão</h3>
            <p className="mb-6 text-sm text-gray-500 break-words">
              Deseja realmente excluir o tutor <span className="font-semibold">{tutor.nome}</span>?
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmDelete}
                isLoading={isLoading}
                className="w-full sm:w-auto !bg-red-600 hover:!bg-red-700"
              >
                Confirmar exclusão
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }
};