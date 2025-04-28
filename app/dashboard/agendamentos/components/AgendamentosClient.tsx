"use client";

import { Button } from "@/components/Button";
import { AgendamentoData, StatusAgendamento } from "../types";
import { useState } from "react";
import { Input } from "@/components/Input";
import { CalendarPlus, ChevronDown, Filter, Search } from "lucide-react";
import Link from "next/link";
import { AgendamentoCard } from "./AgendamentoCard";

interface AgendamentosClientProps {
  initialAgendamentos: AgendamentoData[];
}

export const AgendamentosClient = ({ initialAgendamentos }: AgendamentosClientProps) => {
  const [agendamentos, setAgendamentos] = useState<AgendamentoData[]>(initialAgendamentos);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusAgendamento | "">("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await buscarAgendamentos();
  };

  const buscarAgendamentos = async () => {
    setIsLoading(true);

    try {
      // Construir a URL com os parâmetros de busca
      let url = `/api/agendamentos?`;

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      if (dataInicio) {
        url += `&dataInicio=${encodeURIComponent(dataInicio)}`;
      }

      if (dataFim) {
        url += `&dataFim=${encodeURIComponent(dataFim)}`;
      }

      if (statusFiltro) {
        url += `&status=${encodeURIComponent(statusFiltro)}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setAgendamentos(data);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDataInicio("");
    setDataFim("");
    setStatusFiltro("");
    setIsFilterOpen(false);
    
    // Buscar novamente sem filtros
    buscarAgendamentos();
  };

  const handleDeleteAgendamento = (id: string) => {
    setAgendamentos((prev) => prev.filter((agendamento) => agendamento.id !== id));
  };

  const formatarStatus = (status: StatusAgendamento) => {
    switch (status) {
      case "AGENDADO":
        return "Agendado";
      case "EM_ANDAMENTO":
        return "Em andamento";
      case "CONCLUIDO":
        return "Concluído";
      case "CANCELADO":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex">
            <Input
              placeholder="Buscar por pet ou tutor..."
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
        </div>
        
        <div className="flex w-full flex-wrap gap-2 md:w-auto md:flex-nowrap">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex-grow md:flex-grow-0"
          >
            <Filter size={18} className="mr-1" />
            Filtros
            <ChevronDown size={16} className={`ml-1 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </Button>
          
          <Link href="/dashboard/agendamentos/novo" className="flex-grow md:flex-grow-0">
            <Button className="w-full">
              <CalendarPlus size={18} className="mr-2" />
              Novo Agendamento
            </Button>
          </Link>
        </div>
      </div>

      {/* Painel de filtros avançados */}
      {isFilterOpen && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Data Inicial
              </label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Data Final
              </label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value as StatusAgendamento | "")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="AGENDADO">Agendado</option>
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="CONCLUIDO">Concluído</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetFilters}
            >
              Limpar Filtros
            </Button>
            
            <Button
              type="button"
              onClick={() => buscarAgendamentos()}
              isLoading={isLoading}
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      )}

      {agendamentos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-lg text-gray-500">
            Nenhum agendamento encontrado. Crie um novo agendamento!
          </p>
          <Link href="/dashboard/agendamentos/novo" className="mt-4 inline-block">
            <Button>
              <CalendarPlus size={18} className="mr-2" />
              Criar Agendamento
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agendamentos.map((agendamento) => (
            <AgendamentoCard
              key={agendamento.id}
              agendamento={agendamento}
              onDelete={handleDeleteAgendamento}
            />
          ))}
        </div>
      )}
    </div>
  );
};