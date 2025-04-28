"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Checkbox } from "@/components/Checkbox";
import { AgendamentoFormData, MetodoPagamento, StatusAgendamento, StatusPagamento, TransporteEntrada, TransporteSaida } from "../types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PetInfo, ServicoInfo } from "../types";
import Image from "next/image";
import { DollarSign, MoreHorizontal, PlusCircle, Trash } from "lucide-react";

interface AgendamentoFormProps {
  initialData?: AgendamentoFormData | null;
  isEditing?: boolean;
}

export const AgendamentoForm = ({ initialData, isEditing }: AgendamentoFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pets, setPets] = useState<PetInfo[]>([]);
  const [servicos, setServicos] = useState<ServicoInfo[]>([]);
  const [selectedServicos, setSelectedServicos] = useState<ServicoInfo[]>([]);
  const [calculandoPreco, setCalculandoPreco] = useState(false);

  // Estado do formulário com valores padrão
  const [formData, setFormData] = useState<AgendamentoFormData>(
    initialData || {
      petId: "",
      data: "",
      horaInicio: "",
      horaFim: "",
      observacoes: "",
      status: StatusAgendamento.AGENDADO,
      statusPagamento: StatusPagamento.PENDENTE,
      valorTotal: 0,
      transporteEntrada: TransporteEntrada.DONO_TRAZ,
      transporteSaida: TransporteSaida.DONO_BUSCA,
      enviarNotificacao: false,
      servicos: [],
    }
  );

  // Buscar pets e serviços quando o componente carregar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [petsResponse, servicosResponse] = await Promise.all([
          axios.get('/api/pets'),
          axios.get('/api/servicos')
        ]);

        setPets(petsResponse.data);
        setServicos(servicosResponse.data);

        // Se estiver editando, buscar os serviços selecionados
        if (isEditing && initialData) {
          const servicosIds = initialData.servicos.map(s => s.id);
          const servicosFiltrados = servicosResponse.data.filter(
            (s: ServicoInfo) => servicosIds.includes(s.id)
          );
          setSelectedServicos(
            servicosFiltrados.map((s: ServicoInfo, index: number) => ({
              ...s,
              preco: initialData.servicos[index]?.preco || s.preco
            }))
          );
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setError("Ocorreu um erro ao carregar os dados necessários.");
      }
    };

    fetchData();
  }, [isEditing, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePetSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const petId = e.target.value;
    setFormData((prev) => ({ ...prev, petId }));
    
    // Se já há serviços selecionados, recalcular preços
    if (selectedServicos.length > 0) {
      await calcularPrecos(petId, selectedServicos.map(s => s.id));
    }
  };

  const handleServicoSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const servicoId = e.target.value;
    if (!servicoId) return;
    
    // Verificar se o serviço já está selecionado
    if (selectedServicos.some(s => s.id === servicoId)) {
      alert("Este serviço já está selecionado.");
      e.target.value = ""; // Resetar o select
      return;
    }
    
    const servico = servicos.find(s => s.id === servicoId);
    if (servico) {
      const novosServicos = [...selectedServicos, servico];
      setSelectedServicos(novosServicos);
      
      // Calcular preço se tiver um pet selecionado
      if (formData.petId) {
        await calcularPrecos(formData.petId, novosServicos.map(s => s.id));
      }
      
      e.target.value = ""; // Resetar o select
    }
  };

  const handleRemoverServico = async (id: string) => {
    const novosServicos = selectedServicos.filter(s => s.id !== id);
    setSelectedServicos(novosServicos);
    
    // Recalcular preços se tiver um pet selecionado
    if (formData.petId && novosServicos.length > 0) {
      await calcularPrecos(formData.petId, novosServicos.map(s => s.id));
    } else {
      // Se não houver mais serviços, zerar o valor total
      setFormData(prev => ({
        ...prev,
        valorTotal: 0,
        servicos: []
      }));
    }
  };

  const calcularPrecos = async (petId: string, servicoIds: string[]) => {
    if (!petId || servicoIds.length === 0) return;
    
    setCalculandoPreco(true);
    try {
      const response = await axios.post('/api/agendamentos/calcular-preco', {
        petId,
        servicoIds
      });
      
      const { servicos: servicosComPreco, valorTotal } = response.data;
      
      // Atualizar os serviços selecionados com os preços calculados
      setSelectedServicos(prev => 
        prev.map(s => {
          const servicoComPreco = servicosComPreco.find((sc: any) => sc.id === s.id);
          return servicoComPreco ? { ...s, preco: servicoComPreco.preco } : s;
        })
      );
      
      // Atualizar o formulário
      setFormData(prev => ({
        ...prev,
        valorTotal,
        servicos: servicosComPreco.map((s: any) => ({
          id: s.id,
          preco: s.preco
        }))
      }));
    } catch (error) {
      console.error("Erro ao calcular preços:", error);
      setError("Ocorreu um erro ao calcular os preços dos serviços.");
    } finally {
      setCalculandoPreco(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validações
      if (!formData.petId) {
        throw new Error("Selecione um pet");
      }

      if (!formData.data || !formData.horaInicio) {
        throw new Error("Data e hora de início são obrigatórios");
      }

      if (selectedServicos.length === 0) {
        throw new Error("Selecione pelo menos um serviço");
      }

      // Preparar dados para envio
      const dados = {
        ...formData,
        servicos: selectedServicos.map(s => ({
          id: s.id,
          preco: s.preco
        }))
      };

      if (isEditing && initialData?.id) {
        // Atualizar agendamento
        await axios.patch(`/api/agendamentos/${initialData.id}`, dados);
      } else {
        // Criar novo agendamento
        await axios.post('/api/agendamentos', dados);
      }

      router.push('/dashboard/agendamentos');
      router.refresh();
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data || "Erro ao salvar o agendamento");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocorreu um erro ao salvar o agendamento");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Detalhes do Agendamento */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="border-b border-gray-200 pb-2 text-xl font-semibold">
            Detalhes do Agendamento
          </h2>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Pet *
          </label>
          <select
            name="petId"
            value={formData.petId}
            onChange={handlePetSelect}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading || isEditing}
            required
          >
            <option value="">Selecione um pet</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.nome} {pet.raca ? `(${pet.raca})` : ""} {pet.peso ? `- ${pet.peso}kg` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Input
            label="Data *"
            name="data"
            type="date"
            value={formData.data}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Hora de Início *"
              name="horaInicio"
              type="time"
              value={formData.horaInicio}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <Input
              label="Hora de Fim"
              name="horaFim"
              type="time"
              value={formData.horaFim}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Entrada do Pet
          </label>
          <select
            name="transporteEntrada"
            value={formData.transporteEntrada}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value={TransporteEntrada.DONO_TRAZ}>Dono traz o pet</option>
            <option value={TransporteEntrada.TAXI_DOG}>Taxi Dog (buscar)</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Saída do Pet
          </label>
          <select
            name="transporteSaida"
            value={formData.transporteSaida}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value={TransporteSaida.DONO_BUSCA}>Dono busca o pet</option>
            <option value={TransporteSaida.TAXI_DOG}>Taxi Dog (levar)</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Observações
          </label>
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          ></textarea>
        </div>

        {/* Serviços */}
        <div className="md:col-span-2 mt-4">
          <h2 className="border-b border-gray-200 pb-2 text-xl font-semibold">
            Serviços
          </h2>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Adicionar Serviço
          </label>
          <div className="flex gap-2">
            <select
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              onChange={handleServicoSelect}
              disabled={isLoading || !formData.petId}
            >
              <option value="">Selecione um serviço</option>
              {servicos.map((servico) => (
                <option key={servico.id} value={servico.id}>
                  {servico.nome}
                </option>
              ))}
            </select>
          </div>
          {!formData.petId && (
            <p className="mt-1 text-sm text-yellow-600">
              Selecione um pet primeiro para adicionar serviços
            </p>
          )}
        </div>

        {/* Lista de serviços selecionados */}
        <div className="md:col-span-2">
          {selectedServicos.length > 0 ? (
            <div className="rounded-md border border-gray-200">
              <div className="grid grid-cols-12 gap-2 border-b border-gray-200 bg-gray-50 p-3 font-medium">
                <div className="col-span-6">Serviço</div>
                <div className="col-span-4 text-right">Preço</div>
                <div className="col-span-2"></div>
              </div>
              {selectedServicos.map((servico) => (
                <div key={servico.id} className="grid grid-cols-12 gap-2 border-b border-gray-200 p-3 last:border-0">
                  <div className="col-span-6">{servico.nome}</div>
                  <div className="col-span-4 text-right">
                    {calculandoPreco ? (
                      <span className="text-sm italic text-gray-500">Calculando...</span>
                    ) : (
                      formatarValor(servico.preco)
                    )}
                  </div>
                  <div className="col-span-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoverServico(servico.id)}
                      className="rounded p-1 text-red-500 hover:bg-red-50"
                      disabled={isLoading}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-12 gap-2 bg-gray-50 p-3 font-medium">
                <div className="col-span-6">Valor Total</div>
                <div className="col-span-6 text-right">
                  {calculandoPreco ? (
                    <span className="text-sm italic text-gray-500">Calculando...</span>
                  ) : (
                    formatarValor(formData.valorTotal)
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-gray-300 p-6 text-center">
              <p className="text-gray-500">Nenhum serviço selecionado</p>
            </div>
          )}
        </div>

        {/* Status e Pagamento */}
        {isEditing && (
          <>
            <div className="md:col-span-2 mt-4">
              <h2 className="border-b border-gray-200 pb-2 text-xl font-semibold">
                Status e Pagamento
              </h2>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status do Agendamento
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value={StatusAgendamento.AGENDADO}>Agendado</option>
                <option value={StatusAgendamento.EM_ANDAMENTO}>Em andamento</option>
                <option value={StatusAgendamento.CONCLUIDO}>Concluído</option>
                <option value={StatusAgendamento.CANCELADO}>Cancelado</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status do Pagamento
              </label>
              <select
                name="statusPagamento"
                value={formData.statusPagamento}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value={StatusPagamento.PENDENTE}>Pendente</option>
                <option value={StatusPagamento.PAGO}>Pago</option>
              </select>
            </div>

            {formData.statusPagamento === StatusPagamento.PAGO && (
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Método de Pagamento
                </label>
                <select
                  name="metodoPagamento"
                  value={formData.metodoPagamento}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={isLoading}
                  required={formData.statusPagamento === StatusPagamento.PAGO}
                >
                  <option value={MetodoPagamento.DINHEIRO}>Dinheiro</option>
                  <option value={MetodoPagamento.CARTAO_CREDITO}>Cartão de Crédito</option>
                  <option value={MetodoPagamento.CARTAO_DEBITO}>Cartão de Débito</option>
                  <option value={MetodoPagamento.PIX}>PIX</option>
                  <option value={MetodoPagamento.TRANSFERENCIA}>Transferência Bancária</option>
                </select>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/agendamentos')}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          {isEditing ? "Atualizar Agendamento" : "Criar Agendamento"}
        </Button>
      </div>
    </form>
  );
};