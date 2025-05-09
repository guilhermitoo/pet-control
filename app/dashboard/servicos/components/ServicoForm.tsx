"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ServicoFormData, Preco } from "../types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash } from "lucide-react";

interface ServicoFormProps {
  initialData?: ServicoFormData | null;
  isEditing?: boolean;
}

const defaultFormData: ServicoFormData = {
  nome: "",
  observacoes: "",
  precos: []
};

export const ServicoForm = ({ initialData, isEditing }: ServicoFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Garante que os preços sejam inicializados como array vazio se não existirem
  const [formData, setFormData] = useState<ServicoFormData>({
    ...defaultFormData,
    ...initialData,
    precos: initialData?.precos || []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addPreco = () => {
    setFormData((prev) => ({
      ...prev,
      precos: [...prev.precos, { preco: 0 }]
    }));
  };

  const removePreco = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      precos: prev.precos.filter((_, i) => i !== index)
    }));
  };

  const handlePrecoChange = (index: number, field: keyof Preco, value: string) => {
    setFormData((prev) => ({
      ...prev,
      precos: prev.precos.map((preco, i) => {
        if (i === index) {
          if (field === 'preco') {
            return { ...preco, [field]: parseFloat(value) || 0 };
          } else if (field === 'peso') {
            const peso = value ? parseInt(value) : null;
            return { ...preco, [field]: peso };
          }
          return { ...preco, [field]: value || null };
        }
        return preco;
      })
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

      if (!formData.precos.length) {
        throw new Error("Adicione pelo menos um preço");
      }

      // Validar preços
      formData.precos.forEach((preco, index) => {
        if (preco.preco <= 0) {
          throw new Error(`Preço ${index + 1}: Valor deve ser maior que zero`);
        }
      });

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
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">Tabela de Preços</h3>
            <Button
              type="button"
              onClick={addPreco}
              disabled={isLoading}
              size="sm"
            >
              <Plus size={16} className="mr-2" />
              Adicionar Preço
            </Button>
          </div>

          <div className="space-y-4">
            {formData.precos.map((preco, index) => (
              <div key={index} className="flex items-end gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex-1">
                  <Input
                    label="Raça (opcional)"
                    value={preco.raca || ""}
                    onChange={(e) => handlePrecoChange(index, "raca", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Peso em kg (opcional)"
                    type="number"
                    value={preco.peso || ""}
                    onChange={(e) => handlePrecoChange(index, "peso", e.target.value)}
                    disabled={isLoading}
                    min="0"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Preço (R$) *"
                    type="number"
                    value={preco.preco}
                    onChange={(e) => handlePrecoChange(index, "preco", e.target.value)}
                    disabled={isLoading}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removePreco(index)}
                  disabled={isLoading}
                  className="!h-10 !px-2 text-red-600 hover:bg-red-50"
                >
                  <Trash size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
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