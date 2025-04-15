"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { TutorFormData } from "../types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TutorFormProps {
  initialData?: TutorFormData | null;
  isEditing?: boolean;
}

export const TutorForm = ({ initialData, isEditing }: TutorFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [error, setError] = useState("");
  const [cepError, setCepError] = useState("");

  const [formData, setFormData] = useState<TutorFormData>(
    initialData || {
      nome: "",
      email: "",
      telefone: "",
      cep: "",
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpar erro de CEP quando ele for alterado
    if (name === "cep") {
      setCepError("");
    }
  };

  const handleCepBlur = async () => {
    const cep = formData.cep?.replace(/\D/g, '');
    
    if (cep?.length !== 8) {
      setCepError("CEP deve conter 8 números");
      return;
    }
    
    try {
      setIsFetchingCep(true);
      setCepError("");
      
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      const data = response.data;
      
      if (data.erro) {
        setCepError("CEP não encontrado");
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        rua: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
      }));
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setCepError("Erro ao buscar o CEP");
    } finally {
      setIsFetchingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validações básicas
      if (!formData.nome.trim()) {
        throw new Error("Nome do tutor é obrigatório");
      }

      if (!formData.email.trim()) {
        throw new Error("Email do tutor é obrigatório");
      }

      if (!formData.telefone.trim()) {
        throw new Error("Telefone do tutor é obrigatório");
      }

      // Usar o endpoint real quando o banco estiver configurado
      if (isEditing && initialData) {
        // Atualizar tutor existente
        const response = await axios.patch(`/api/tutores/${initialData.id}`, formData);
        console.log('Tutor atualizado:', response.data);
      } else {
        // Criar novo tutor
        const response = await axios.post("/api/tutores", formData);
        console.log('Tutor criado:', response.data);
      }

      router.push("/dashboard/tutores");
      router.refresh();
    } catch (error) {
      console.error("Erro ao salvar tutor:", error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data || "Erro ao salvar o tutor");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocorreu um erro ao salvar o tutor. Por favor, tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatCEP = (cep: string) => {
    cep = cep.replace(/\D/g, '');
    if (cep.length > 5) {
      cep = cep.replace(/^(\d{5})(\d)/, "$1-$2");
    }
    if (cep.length > 9) {
      cep = cep.slice(0, 9);
    }
    return cep;
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = formatCEP(e.target.value);
    setFormData((prev) => ({ ...prev, cep }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800">Dados Pessoais</h2>
        </div>

        <div className="md:col-span-2">
          <Input
            label="Nome completo *"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Input
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Input
            label="Telefone *"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            required
            disabled={isLoading}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="md:col-span-2 border-t pt-4 mt-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Endereço</h2>
        </div>

        <div className="relative">
          <Input
            label="CEP"
            name="cep"
            value={formData.cep}
            onChange={handleCepChange}
            onBlur={handleCepBlur}
            disabled={isLoading || isFetchingCep}
            error={cepError}
            placeholder="00000-000"
            maxLength={9}
          />
          {isFetchingCep && (
            <div className="absolute right-3 top-9">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            </div>
          )}
        </div>

        <div>
          <Input
            label="Estado"
            name="uf"
            value={formData.estado || ""}
            onChange={handleChange}
            disabled={isLoading}
            maxLength={2}
            placeholder="UF"
          />
        </div>

        <div>
          <Input
            label="Cidade"
            name="cidade"
            value={formData.cidade || ""}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div>
          <Input
            label="Bairro"
            name="bairro"
            value={formData.bairro || ""}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <Input
            label="Rua/Avenida"
            name="rua"
            value={formData.rua || ""}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div>
          <Input
            label="Número"
            name="numero"
            value={formData.numero || ""}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="S/N"
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Complemento"
            name="complemento"
            value={formData.complemento || ""}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Apto, Bloco, Sala, etc."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/tutores")}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? "Atualizar Tutor" : "Cadastrar Tutor"}
        </Button>
      </div>
    </form>
  );
};