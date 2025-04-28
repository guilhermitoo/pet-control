"use client";

import { Button } from "@/components/Button";
import { ChecklistData } from "../types";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { Checkbox } from "@/components/Checkbox";

interface ChecklistFormProps {
  agendamentoId: string;
  initialData: ChecklistData;
  petNome: string;
}

export const ChecklistForm = ({ agendamentoId, initialData, petNome }: ChecklistFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState<ChecklistData>(initialData);

  const handleCheckboxChange = (field: keyof ChecklistData, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await axios.post(`/api/agendamentos/${agendamentoId}/checklist`, formData);
      setSuccess(true);
      
      // Esperar um pouco para mostrar a mensagem de sucesso antes de redirecionar
      setTimeout(() => {
        router.push(`/dashboard/agendamentos/${agendamentoId}`);
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Erro ao salvar checklist:", error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data || "Erro ao salvar o checklist");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocorreu um erro ao salvar o checklist");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center rounded-md bg-red-50 p-4 text-red-800">
          <AlertTriangle className="mr-2 h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center rounded-md bg-green-50 p-4 text-green-800">
          <Check className="mr-2 h-5 w-5" />
          <span>Checklist salvo com sucesso!</span>
        </div>
      )}

      <div className="space-y-6">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start">
            <AlertTriangle className="mr-2 mt-0.5 h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">
                Checklist de Finalização
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Verifique os pontos abaixo e marque os que foram encontrados no pet {petNome}.
                Este checklist será salvo junto com o agendamento.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="font-medium text-gray-800">Problemas encontrados</h3>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <Checkbox
              id="temCarrapatos"
              label="Presença de carrapatos"
              checked={formData.temCarrapatos}
              onChange={(checked) => handleCheckboxChange("temCarrapatos", checked)}
            />
            
            <Checkbox
              id="temPulgas"
              label="Presença de pulgas"
              checked={formData.temPulgas}
              onChange={(checked) => handleCheckboxChange("temPulgas", checked)}
            />
            
            <Checkbox
              id="problemaPele"
              label="Problemas de pele"
              checked={formData.problemaPele}
              onChange={(checked) => handleCheckboxChange("problemaPele", checked)}
            />
            
            <Checkbox
              id="problemaDentes"
              label="Problemas dentários"
              checked={formData.problemaDentes}
              onChange={(checked) => handleCheckboxChange("problemaDentes", checked)}
            />
          </div>
          
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Outros problemas encontrados
            </label>
            <textarea
              name="outrosProblemas"
              value={formData.outrosProblemas}
              onChange={handleTextChange}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Descreva outros problemas encontrados"
            ></textarea>
          </div>
          
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Observações gerais
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleTextChange}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Observações sobre o estado do pet, tratamentos recomendados, etc."
            ></textarea>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/agendamentos/${agendamentoId}`)}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          Finalizar Atendimento
        </Button>
      </div>
    </form>
  );
};