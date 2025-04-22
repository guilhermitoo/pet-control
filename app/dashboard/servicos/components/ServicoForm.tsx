"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { PrecoPorPeso, PrecoPorRaca, ServicoFormData, TipoPrecificacao } from "../types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash } from "lucide-react";

interface ServicoFormProps {
  initialData?: ServicoFormData;
  isEditing?: boolean;
}

export const ServicoForm = ({ initialData, isEditing }: ServicoFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<ServicoFormData>(
    initialData || {
      nome: "",
      observacoes: "",
      tipoPrecificacao: TipoPrecificacao.PESO,
      precosPorPeso: [],
      precosPorRaca: [],
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTipoPrecificacaoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TipoPrecificacao;
    setFormData((prev) => ({
      ...prev,
      tipoPrecificacao: value,
      // Limpar preços não aplicáveis
      precosPorPeso: value === TipoPrecificacao.RACA ? [] : prev.precosPorPeso,
      precosPorRaca: value === TipoPrecificacao.PESO ? [] : prev.precosPorRaca,
    }));
  };

  const addPrecoPorPeso = () => {
    setFormData((prev) => ({
      ...prev,
      precosPorPeso: [
        ...prev.precosPorPeso,
        { pesoInicial: 0, pesoFinal: 0, preco: 0 },
      ],
    }));
  };

  const addPrecoPorRaca = () => {
    setFormData((prev) => ({
      ...prev,
      precosPorRaca: [
        ...prev.precosPorRaca,
        { raca: "", preco: 0 },
      ],
    }));
  };

  const removePrecoPorPeso = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      precosPorPeso: prev.precosPorPeso.filter((_, i) => i !== index),
    }));
  };

  const removePrecoPorRaca = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      precosPorRaca: prev.precosPorRaca.filter((_, i) => i !== index),
    }));
  };

  const handlePrecoPorPesoChange = (index: number, field: keyof PrecoPorPeso, value: string) => {
    setFormData((prev) => ({
      ...prev,
      precosPorPeso: prev.precosPorPeso.map((preco, i) =>
        i === index ? { ...preco, [field]: parseFloat(value) || 0 } : preco
      ),
    }));
  };

  const handlePrecoPorRacaChange = (index: number, field: keyof PrecoPorRaca, value: string) => {
    setFormData((prev) => ({
      ...prev,
      precosPorRaca: prev.precosPorRaca.map((preco, i) =>
        i === index ? { ...preco, [field]: field === "preco" ? parseFloat(value) || 0 : value } : preco
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validações básicas
      if (!formData.nome.trim()) {
        throw new Error("Nome do serviço é obrigatório");
      }

      // Validar tabela de preços
      if (formData.tipoPrecificacao === TipoPrecificacao.PESO || formData.tipoPrecificacao === TipoPrecificacao.AMBOS) {
        if (formData.precosPorPeso.length === 0) {
          throw new Error("Adicione pelo menos uma faixa de peso");
        }
        // Validar valores
        formData.precosPorPeso.forEach((preco, index) => {
          if (preco.pesoFinal <= preco.pesoInicial) {
            throw new Error(`Faixa de peso ${index + 1}: Peso final deve ser maior que o peso inicial`);
          }
          if (preco.preco <= 0) {
            throw new Error(`Faixa de peso ${index + 1}: Preço deve ser maior que zero`);
          }
        });
      }

      if (formData.tipoPrecificacao === TipoPrecificacao.RACA || formData.tipoPrecificacao === TipoPrecificacao.AMBOS) {
        if (formData.precosPorRaca.length === 0) {
          throw new Error("Adicione pelo menos uma raça");
        }
        // Validar valores
        formData.precosPorRaca.forEach((preco, index) => {
          if (!preco.raca.trim()) {
            throw new Error(`Raça ${index + 1}: Nome da raça é obrigatório`);
          }
          if (preco.preco <= 0) {
            throw new Error(`Raça ${index + 1}: Preço deve ser maior que zero`);
          }
        });
      }

      if (isEditing && initialData?.id) {
        await axios.patch(`/api/servicos/${initialData.id}`, formData);
      } else {
        await axios.post("/api/servicos", formData);
      }

      router.push("/dashboard/servicos");
      router.refresh();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data || "Erro ao salvar o serviço");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocorreu um erro ao salvar o serviço");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <Input
          label="Nome do Serviço *"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
          disabled={isLoading}
        />

        <div>
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
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Tipo de Precificação *
          </label>
          <select
            name="tipoPrecificacao"
            value={formData.tipoPrecificacao}
            onChange={handleTipoPrecificacaoChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
            required
          >
            <option value={TipoPrecificacao.PESO}>Por Peso</option>
            <option value={TipoPrecificacao.RACA}>Por Raça</option>
            <option value={TipoPrecificacao.AMBOS}>Por Peso e Raça</option>
          </select>
        </div>

        {/* Tabela de Preços por Peso */}
        {(formData.tipoPrecificacao === TipoPrecificacao.PESO || formData.tipoPrecificacao === TipoPrecificacao.AMBOS) && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">Preços por Faixa de Peso</h3>
              <Button
                type="button"
                onClick={addPrecoPorPeso}
                disabled={isLoading}
                size="sm"
              >
                <Plus size={16} className="mr-2" />
                Adicionar Faixa
              </Button>
            </div>

            <div className="space-y-4">
              {formData.precosPorPeso.map((preco, index) => (
                <div key={index} className="flex items-end gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex-1">
                    <Input
                      label="Peso Inicial (kg)"
                      type="number"
                      value={preco.pesoInicial}
                      onChange={(e) => handlePrecoPorPesoChange(index, "pesoInicial", e.target.value)}
                      disabled={isLoading}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Peso Final (kg)"
                      type="number"
                      value={preco.pesoFinal}
                      onChange={(e) => handlePrecoPorPesoChange(index, "pesoFinal", e.target.value)}
                      disabled={isLoading}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Preço (R$)"
                      type="number"
                      value={preco.preco}
                      onChange={(e) => handlePrecoPorPesoChange(index, "preco", e.target.value)}
                      disabled={isLoading}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removePrecoPorPeso(index)}
                    disabled={isLoading}
                    className="!h-10 !px-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabela de Preços por Raça */}
        {(formData.tipoPrecificacao === TipoPrecificacao.RACA || formData.tipoPrecificacao === TipoPrecificacao.AMBOS) && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">Preços por Raça</h3>
              <Button
                type="button"
                onClick={addPrecoPorRaca}
                disabled={isLoading}
                size="sm"
              >
                <Plus size={16} className="mr-2" />
                Adicionar Raça
              </Button>
            </div>

            <div className="space-y-4">
              {formData.precosPorRaca.map((preco, index) => (
                <div key={index} className="flex items-end gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex-1">
                    <Input
                      label="Raça"
                      value={preco.raca}
                      onChange={(e) => handlePrecoPorRacaChange(index, "raca", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Preço (R$)"
                      type="number"
                      value={preco.preco}
                      onChange={(e) => handlePrecoPorRacaChange(index, "preco", e.target.value)}
                      disabled={isLoading}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removePrecoPorRaca(index)}
                    disabled={isLoading}
                    className="!h-10 !px-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/servicos")}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? "Atualizar Serviço" : "Cadastrar Serviço"}
        </Button>
      </div>
    </form>
  );
};