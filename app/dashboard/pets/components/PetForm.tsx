"use client";

import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { ImageUpload } from "@/components/ImageUpload";
import { Input } from "@/components/Input";
import { TutorSelect } from "@/components/TutorSelect";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PetFormData } from "../types";

interface PetFormProps {
  initialData?: PetFormData | null;
  isEditing?: boolean;
}

export const PetForm = ({ initialData, isEditing }: PetFormProps) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<PetFormData>(
    initialData || {
      nome: "",
      foto: "",
      dataNascimento: "",
      raca: "",
      peso: "",
      sexo: "",
      alergias: "",
      observacoes: "",
      usaTaxiDog: false,
      tutores: [],
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, usaTaxiDog: checked }));
  };

  const handleImageChange = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, foto: imageUrl }));
  };

  const handleTutoresChange = (tutores: { id: string; isPrimario: boolean }[]) => {
    setFormData((prev) => ({ ...prev, tutores }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validações básicas
      if (!formData.nome.trim()) {
        throw new Error("Nome do pet é obrigatório");
      }     

      if (isEditing && initialData) {
        // Atualizar pet existente
        const response = await axios.patch(`/api/pets/${initialData.id}`, formData);
        console.log('Pet atualizado:', response.data);
      } else {
        // Criar novo pet
        const response = await axios.post("/api/pets", formData);
        console.log('Pet criado:', response.data);
      }

      router.push("/dashboard/pets");
      router.refresh();
    } catch (error) {
      console.error("Erro ao salvar pet:", error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data || "Erro ao salvar o pet");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocorreu um erro ao salvar o pet. Por favor, tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <div className="flex justify-center">
            <ImageUpload
              value={formData.foto}
              onChange={handleImageChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Input
            label="Nome do Pet *"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Input
            label="Data de Nascimento"
            name="dataNascimento"
            type="date"
            value={formData.dataNascimento}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div>
          <Input
            label="Raça"
            name="raca"
            value={formData.raca || ""}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              label="Peso (kg)"
              name="peso"
              type="number"
              step="0.1"
              min="0"
              value={formData.peso || ""}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Sexo
            </label>
            <select
              name="sexo"
              value={formData.sexo || ""}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
              required
            >
              <option value="">Selecione</option>
              <option value="MACHO">Macho</option>
              <option value="FEMEA">Fêmea</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Alergias
          </label>
          <textarea
            name="alergias"
            value={formData.alergias || ""}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Observações
          </label>
          <textarea
            name="observacoes"
            value={formData.observacoes || ""}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        <div className="md:col-span-2">
          <Checkbox
            id="usaTaxiDog"
            label="Este pet geralmente usa Taxi Dog"
            checked={formData.usaTaxiDog}
            onChange={handleCheckboxChange}
            disabled={isLoading}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Tutores *
          </label>
          <TutorSelect
            value={formData.tutores}
            onChange={handleTutoresChange}
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Selecione pelo menos um tutor e defina o tutor principal
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/pets")}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? "Atualizar Pet" : "Cadastrar Pet"}
        </Button>
      </div>
    </form>
  );
};