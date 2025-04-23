"use client";

import { Button } from "@/components/Button";
import { ServicoData } from "../types";
import { useState } from "react";
import { Edit, Trash } from "lucide-react";
import Link from "next/link";
import axios from "axios";

interface ServicoCardProps {
  servico: ServicoData;
  onDelete: (id: string) => void;
}

export const ServicoCard = ({ servico, onDelete }: ServicoCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/servicos/${servico.id}`);
      onDelete(servico.id);
    } catch (error) {
      console.error("Erro ao excluir serviço:", error);
      alert("Ocorreu um erro ao excluir o serviço. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };

  const formatarPreco = (preco: number) => {
    return preco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{servico.nome}</h3>
        </div>

        {servico.observacoes && (
          <p className="mb-4 text-sm text-gray-600">{servico.observacoes}</p>
        )}

        {/* Tabela de preços */}
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium text-gray-700">Preços:</h4>
          <div className="space-y-1">
            {servico.precos.map((preco, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {preco.raca && `${preco.raca}`}
                  {preco.raca && preco.peso && " - "}
                  {preco.peso && `${preco.peso}kg`}
                  {!preco.raca && !preco.peso && "Preço base"}
                </span>
                <span className="font-medium text-gray-900">
                  {formatarPreco(preco.preco)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Link href={`/dashboard/servicos/${servico.id}`} className="flex-1">
            <Button
              variant="secondary"
              className="w-full"
              disabled={isLoading}
            >
              <Edit size={16} className="mr-2" />
              Editar
            </Button>
          </Link>
          
          <Button
            variant="outline"
            onClick={handleDeleteClick}
            disabled={isLoading}
            className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash size={16} className="mr-1" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Modal de confirmação */}
      {showConfirmation && (
        <>
          <div className="fixed inset-0 z-40 bg-black opacity-50"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Confirmar exclusão
              </h3>
              <p className="mb-6 text-sm text-gray-500">
                Deseja realmente excluir o serviço{" "}
                <span className="font-semibold">{servico.nome}</span>?
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancelDelete}
                  disabled={isLoading}
                  className="sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  isLoading={isLoading}
                  className="sm:w-auto !bg-red-600 hover:!bg-red-700"
                >
                  Confirmar exclusão
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};