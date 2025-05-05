"use client";

import { Button } from "@/components/Button";
import { AgendamentoData, StatusAgendamento } from "../types";
import { useState, useEffect } from "react";
import { Input } from "@/components/Input";
import { 
  CalendarPlus, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Search 
} from "lucide-react";
import Link from "next/link";
import { AgendamentoCard } from "./AgendamentoCard";

interface AgendamentosClientProps {
  initialAgendamentos: AgendamentoData[];
}

export const AgendamentosClient = ({ initialAgendamentos }: AgendamentosClientProps) => {
  const [agendamentos, setAgendamentos] = useState<AgendamentoData[]>(initialAgendamentos);
  const [filteredAgendamentos, setFilteredAgendamentos] = useState<AgendamentoData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Inicializa com a data atual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [statusFiltro, setStatusFiltro] = useState<StatusAgendamento | "">("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Formatar data para exibição
  const formatDateForDisplay = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('pt-BR', options);
  };

  // Formatar data para input
  const formatDateForInput = (date: Date): string => {
    try {
      if (!date || isNaN(date.getTime())) {
        // Retornar a data atual se a data for inválida
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      // Retornar a data atual em caso de erro
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }
  };

  // Navegar para o dia anterior
  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
  };

  // Navegar para o próximo dia
  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };
  
  // Função para atualizar um agendamento na lista
  const handleUpdateAgendamento = (updatedAgendamento: AgendamentoData) => {
    // Atualizar o agendamento na lista principal
    setAgendamentos(prevAgendamentos => 
      prevAgendamentos.map(agendamento => 
        agendamento.id === updatedAgendamento.id 
          ? updatedAgendamento 
          : agendamento
      )
    );
    
    // Note: filtered agendamentos will be updated automatically in the useEffect
  };

  // Ir para hoje
  const goToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelectedDate(today);
  };

  // Manipular mudança de data no input
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    newDate.setHours(0, 0, 0, 0);
    setSelectedDate(newDate);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await buscarAgendamentos();
  };

  const buscarAgendamentos = async () => {
    setIsLoading(true);

    try {
      // Verificar se a data selecionada é válida
      if (!selectedDate || isNaN(selectedDate.getTime())) {
        console.error("Data selecionada inválida:", selectedDate);
        return;
      }

      // Construir a URL com os parâmetros de busca
      let url = `/api/agendamentos?`;

      // Adicionar a data selecionada como filtro
      const formattedDate = formatDateForInput(selectedDate);
      url += `dataInicio=${encodeURIComponent(formattedDate)}`;
      url += `&dataFim=${encodeURIComponent(formattedDate)}`;

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      if (statusFiltro) {
        url += `&status=${encodeURIComponent(statusFiltro)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.status}`);
      }
      const data = await response.json();

      setAgendamentos(data);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      // Em caso de erro, manter os agendamentos anteriores
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito para filtrar e ordenar agendamentos quando a data selecionada mudar
  useEffect(() => {
    // Filtrar agendamentos do dia selecionado
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const filteredByDate = agendamentos.filter(agendamento => {
      const agendamentoDate = new Date(agendamento.horaInicio);
      return agendamentoDate >= startOfDay && agendamentoDate <= endOfDay;
    });

    // Ordenar por hora
    const sortedByTime = [...filteredByDate].sort((a, b) => {
      return new Date(a.horaInicio).getTime() - new Date(b.horaInicio).getTime();
    });

    setFilteredAgendamentos(sortedByTime);
  }, [agendamentos, selectedDate]);

  // Efeito para buscar agendamentos ao mudar a data
  useEffect(() => {
    // Certifique-se de que a data selecionada é válida antes de buscar
    if (selectedDate) {
      buscarAgendamentos();
    }
  }, [selectedDate]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFiltro("");
    setIsFilterOpen(false);
    
    // Buscar novamente sem filtros adicionais
    buscarAgendamentos();
  };

  const handleDeleteAgendamento = (id: string) => {
    setAgendamentos((prev) => prev.filter((agendamento) => agendamento.id !== id));
  };

  return (
    <div>
      {/* Navegação de data */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={goToPreviousDay}
            className="px-3"
          >
            <ChevronLeft size={18} />
          </Button>
          
          <div className="flex flex-col items-center space-y-2">
            <h2 className="text-xl font-bold text-gray-800">
              {formatDateForDisplay(selectedDate)}
            </h2>
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={handleDateChange}
                className="w-40"
              />
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={goToToday}
                className="text-sm"
              >
                Hoje
              </Button>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={goToNextDay}
            className="px-3"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      {/* Barra de busca e filtros */}
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
          <div className="grid gap-4 md:grid-cols-1">
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

      {/* Seção de conteúdo principal */}
      {filteredAgendamentos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-lg text-gray-500">
            Nenhum agendamento encontrado para esta data. Crie um novo agendamento!
          </p>
          <Link href="/dashboard/agendamentos/novo" className="mt-4 inline-block">
            <Button>
              <CalendarPlus size={18} className="mr-2" />
              Criar Agendamento
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAgendamentos.map((agendamento) => (
            <AgendamentoCard
              key={agendamento.id}
              agendamento={agendamento}
              onDelete={handleDeleteAgendamento}
              onUpdate={handleUpdateAgendamento}
              compact={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};