"use client";

import { AgendamentoData, StatusAgendamento, StatusPagamento, TransporteEntrada, TransporteSaida } from "../types";
import Image from "next/image";
import { Calendar, Check, CheckSquare, Clock, CreditCard, DollarSign, Edit, MoreHorizontal, PawPrint, Phone, Trash, Truck, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";
import { formatDateBR } from "@/lib/dateUtils";

interface AgendamentoCardProps {
  agendamento: AgendamentoData;
  onDelete: (id: string) => void;
}

export const AgendamentoCard = ({ agendamento, onDelete }: AgendamentoCardProps) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isNotificando, setIsNotificando] = useState(false);

  const handleEdit = () => {
    router.push(`/dashboard/agendamentos/${agendamento.id}`);
    setIsMenuOpen(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/agendamentos/${agendamento.id}`);
      onDelete(agendamento.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      alert("Ocorreu um erro ao excluir o agendamento. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConcluir = async () => {
    setIsLoading(true);
    try {
      await axios.patch(`/api/agendamentos/${agendamento.id}`, {
        status: "CONCLUIDO",
      });
      router.push(`/dashboard/agendamentos/${agendamento.id}/finalizar`);
    } catch (error) {
      console.error("Erro ao concluir agendamento:", error);
      alert("Ocorreu um erro ao concluir o agendamento. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIniciar = async () => {
    setIsLoading(true);
    try {
      await axios.patch(`/api/agendamentos/${agendamento.id}`, {
        status: "EM_ANDAMENTO",
      });
      router.refresh();
    } catch (error) {
      console.error("Erro ao iniciar agendamento:", error);
      alert("Ocorreu um erro ao iniciar o agendamento. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePagar = async () => {
    setIsLoading(true);
    try {
      await axios.patch(`/api/agendamentos/${agendamento.id}`, {
        statusPagamento: "PAGO",
        metodoPagamento: "DINHEIRO", // Valor padrão, pode ser alterado na edição
      });
      router.refresh();
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      alert("Ocorreu um erro ao registrar o pagamento. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificarWhatsApp = async () => {
    if (!agendamento.pet.tutorPrincipal?.telefone) {
      alert("O tutor não possui telefone cadastrado para notificação.");
      return;
    }

    setIsNotificando(true);
    try {
      const response = await axios.post(`/api/agendamentos/${agendamento.id}/notificar`);
      window.open(response.data.whatsappUrl, '_blank');
    } catch (error) {
      console.error("Erro ao preparar notificação:", error);
      alert("Ocorreu um erro ao preparar a notificação. Por favor, tente novamente.");
    } finally {
      setIsNotificando(false);
    }
  };

  // Formatar data e hora
  const formattedDate = formatDateBR(agendamento.data.split('T')[0]);
  const formattedTimeStart = agendamento.horaInicio.split('T')[1].substring(0, 5);
  const formattedTimeEnd = agendamento.horaFim 
    ? agendamento.horaFim.split('T')[1].substring(0, 5)
    : '';

  // Status do agendamento (classe CSS e texto)
  const getStatusClass = () => {
    switch (agendamento.status) {
      case "AGENDADO":
        return "bg-blue-100 text-blue-800";
      case "EM_ANDAMENTO":
        return "bg-yellow-100 text-yellow-800";
      case "CONCLUIDO":
        return "bg-green-100 text-green-800";
      case "CANCELADO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = () => {
    switch (agendamento.status) {
      case "AGENDADO":
        return "Agendado";
      case "EM_ANDAMENTO":
        return "Em andamento";
      case "CONCLUIDO":
        return "Concluído";
      case "CANCELADO":
        return "Cancelado";
      default:
        return agendamento.status;
    }
  };

  // Status do pagamento (classe CSS e texto)
  const getPagamentoClass = () => {
    return agendamento.statusPagamento === "PAGO"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getPagamentoText = () => {
    return agendamento.statusPagamento === "PAGO" ? "Pago" : "Pendente";
  };

  // Formatar valor
  const formattedValue = agendamento.valorTotal.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  // Formatar método de transporte
  const getTransporteEntradaText = () => {
    switch (agendamento.transporteEntrada) {
      case "DONO_TRAZ":
        return "Dono traz";
      case "TAXI_DOG":
        return "Taxi Dog (buscar)";
      default:
        return agendamento.transporteEntrada;
    }
  };

  const getTransporteSaidaText = () => {
    switch (agendamento.transporteSaida) {
      case "DONO_BUSCA":
        return "Dono busca";
      case "TAXI_DOG":
        return "Taxi Dog (levar)";
      default:
        return agendamento.transporteSaida;
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Ações do agendamento */}
      <div className="absolute right-2 top-2 z-10">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-full bg-white p-1 shadow-sm hover:bg-gray-100"
          disabled={isLoading}
        >
          <MoreHorizontal size={20} className="text-gray-500" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-1 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
            <button
              onClick={handleEdit}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              disabled={isLoading}
            >
              <Edit size={16} className="mr-2" />
              Editar
            </button>
            
            {agendamento.status === "AGENDADO" && (
              <button
                onClick={handleIniciar}
                className="flex w-full items-center px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
                disabled={isLoading}
              >
                <Clock size={16} className="mr-2" />
                Iniciar Atendimento
              </button>
            )}
            
            {agendamento.status === "EM_ANDAMENTO" && (
              <button
                onClick={handleConcluir}
                className="flex w-full items-center px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50"
                disabled={isLoading}
              >
                <Check size={16} className="mr-2" />
                Concluir Atendimento
              </button>
            )}
            
            {agendamento.statusPagamento === "PENDENTE" && (
              <button
                onClick={handlePagar}
                className="flex w-full items-center px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50"
                disabled={isLoading}
              >
                <DollarSign size={16} className="mr-2" />
                Registrar Pagamento
              </button>
            )}
            
            {agendamento.status === "CONCLUIDO" && !agendamento.enviarNotificacao && agendamento.pet.tutorPrincipal?.telefone && (
              <button
                onClick={handleNotificarWhatsApp}
                className="flex w-full items-center px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
                disabled={isLoading || isNotificando}
              >
                <Phone size={16} className="mr-2" />
                Notificar Tutor
              </button>
            )}
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              disabled={isLoading}
            >
              <Trash size={16} className="mr-2" />
              Excluir
            </button>
          </div>
        )}
      </div>

      {/* Header do card com foto do pet */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-200">
        {agendamento.pet.foto ? (
          <Image
            src={agendamento.pet.foto}
            alt={agendamento.pet.nome}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PawPrint size={64} className="text-gray-400" />
          </div>
        )}
        
        {/* Status badges */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClass()}`}>
            {getStatusText()}
          </span>
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPagamentoClass()}`}>
            {getPagamentoText()}
          </span>
        </div>
      </div>

      {/* Informações do agendamento */}
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{agendamento.pet.nome}</h3>
            <p className="text-sm text-gray-500">
              {agendamento.pet.raca}
              {agendamento.pet.peso && agendamento.pet.raca && " • "}
              {agendamento.pet.peso && `${agendamento.pet.peso}kg`}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-xl font-bold text-green-600">{formattedValue}</p>
            <p className="text-xs text-gray-500">
              {agendamento.servicos.length} serviço{agendamento.servicos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="space-y-2 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-gray-400" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} className="text-gray-400" />
            <span>
              {formattedTimeStart}
              {formattedTimeEnd && ` - ${formattedTimeEnd}`}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Truck size={16} className="text-gray-400" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Entrada: {getTransporteEntradaText()}</span>
              <span className="text-xs text-gray-500">Saída: {getTransporteSaidaText()}</span>
            </div>
          </div>
          
          {agendamento.pet.tutorPrincipal && (
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-gray-400" />
              <span>{agendamento.pet.tutorPrincipal.nome}</span>
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={`/dashboard/agendamentos/${agendamento.id}`}>
            <Button
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              Ver Detalhes
            </Button>
          </Link>
          
          {agendamento.status === "AGENDADO" && (
            <Button
              onClick={handleIniciar}
              className="w-full"
              disabled={isLoading}
            >
              Iniciar
            </Button>
          )}
          
          {agendamento.status === "EM_ANDAMENTO" && (
            <Button
              onClick={handleConcluir}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              Concluir
            </Button>
          )}
          
          {agendamento.status === "CONCLUIDO" && !agendamento.enviarNotificacao && agendamento.pet.tutorPrincipal?.telefone && (
            <Button
              onClick={handleNotificarWhatsApp}
              className="w-full"
              disabled={isLoading || isNotificando}
              isLoading={isNotificando}
            >
              <Phone size={16} className="mr-1" />
              Notificar
            </Button>
          )}
          
          {agendamento.status === "CONCLUIDO" && agendamento.enviarNotificacao && (
            <Button
              variant="secondary"
              disabled={true}
              className="w-full"
            >
              <Check size={16} className="mr-1" />
              Notificado
            </Button>
          )}
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-medium">Confirmar exclusão</h3>
            <p className="mb-6">
              Tem certeza que deseja excluir o agendamento para o pet{" "}
              <strong>{agendamento.pet.nome}</strong> em{" "}
              <strong>{formattedDate}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleDelete}
                isLoading={isLoading}
                className="!bg-red-600 hover:!bg-red-700"
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};