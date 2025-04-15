"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface Tutor {
  id: string;
  nome: string;
  email: string;
}

interface TutorSelectProps {
  value: { id: string; isPrimario: boolean }[];
  onChange: (value: { id: string; isPrimario: boolean }[]) => void;
  disabled?: boolean;
}

export const TutorSelect = ({
  value,
  onChange,
  disabled
}: TutorSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTutores, setSelectedTutores] = useState<Tutor[]>([]);
  
  const ref = useRef<HTMLDivElement>(null);

  // Carregar tutores quando o componente montar
  useEffect(() => {
    fetchTutores();
  }, []);

  // Buscar tutores quando a pesquisa mudar
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        fetchTutores(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Buscar tutores selecionados quando o valor mudar
  useEffect(() => {
    if (value.length > 0) {
      fetchSelectedTutores();
    } else {
      setSelectedTutores([]);
    }
  }, [value]);

  // Fechar o dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Função para buscar tutores da API
  const fetchTutores = async (search = "") => {
    try {
      setLoading(true);
      // Usar a API mock enquanto o banco de dados não está configurado
      const response = await fetch(`/api/tutores/mock?search=${search}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar tutores');
      }
      const data = await response.json();
      setTutores(data);
    } catch (error) {
      console.error("Erro ao buscar tutores:", error);
      // Em desenvolvimento, podemos usar dados fictícios
      setTutores([
        { id: "1", nome: "João Silva", email: "joao@example.com" },
        { id: "2", nome: "Maria Santos", email: "maria@example.com" },
        { id: "3", nome: "Carlos Oliveira", email: "carlos@example.com" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar tutores selecionados
  const fetchSelectedTutores = async () => {
    try {
      // Aqui usamos os dados fictícios diretamente, já que é apenas para exibição
      const mockTutores = [
        { id: "1", nome: "João Silva", email: "joao@example.com" },
        { id: "2", nome: "Maria Santos", email: "maria@example.com" },
        { id: "3", nome: "Carlos Oliveira", email: "carlos@example.com" },
        { id: "4", nome: "Ana Costa", email: "ana@example.com" },
        { id: "5", nome: "Pedro Souza", email: "pedro@example.com" },
      ];
      
      const selected = mockTutores.filter(t => 
        value.some(v => v.id === t.id)
      );
      
      setSelectedTutores(selected);
    } catch (error) {
      console.error("Erro ao buscar tutores selecionados:", error);
      // Manter o fallback original
      const mockTutores = [
        { id: "1", nome: "João Silva", email: "joao@example.com" },
        { id: "2", nome: "Maria Santos", email: "maria@example.com" },
        { id: "3", nome: "Carlos Oliveira", email: "carlos@example.com" },
      ];
      
      const selected = mockTutores.filter(t => 
        value.some(v => v.id === t.id)
      );
      
      setSelectedTutores(selected);
    }
  };

  const toggleTutor = (tutor: Tutor) => {
    const isSelected = value.some(v => v.id === tutor.id);
    
    if (isSelected) {
      onChange(value.filter(v => v.id !== tutor.id));
    } else {
      onChange([...value, { id: tutor.id, isPrimario: value.length === 0 }]);
    }
  };

  const removeTutor = (id: string) => {
    const newValue = value.filter(v => v.id !== id);
    
    // Se removemos o tutor primário, definir o primeiro como primário
    if (value.find(v => v.id === id)?.isPrimario && newValue.length > 0) {
      newValue[0].isPrimario = true;
    }
    
    onChange(newValue);
  };

  const togglePrimary = (id: string) => {
    const newValue = value.map(v => ({
      ...v,
      isPrimario: v.id === id
    }));
    
    onChange(newValue);
  };

  return (
    <div className="relative" ref={ref}>
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span>Selecionar Tutores</span>
          <ChevronsUpDown size={16} className="opacity-50" />
        </Button>
      </div>
      
      {/* Lista de tutores selecionados */}
      {selectedTutores.length > 0 && (
        <div className="mt-2">
          <h4 className="mb-1 text-sm font-medium text-gray-700">Tutores selecionados:</h4>
          <div className="space-y-2">
            {selectedTutores.map((tutor) => {
              const isTutorPrimario = value.find(v => v.id === tutor.id)?.isPrimario;
              return (
                <div 
                  key={tutor.id} 
                  className={cn(
                    "flex items-center justify-between rounded-md border p-2",
                    isTutorPrimario ? "border-blue-300 bg-blue-50" : "border-gray-200"
                  )}
                >
                  <div className="flex items-center">
                    <div className="ml-2">
                      <p className="text-sm font-medium">{tutor.nome}</p>
                      <p className="text-xs text-gray-500">{tutor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {!isTutorPrimario && (
                      <button
                        type="button"
                        onClick={() => !disabled && togglePrimary(tutor.id)}
                        className="mr-2 text-xs text-blue-600 hover:text-blue-800"
                        disabled={disabled}
                      >
                        Definir como principal
                      </button>
                    )}
                    {isTutorPrimario && (
                      <span className="mr-2 text-xs text-blue-600">
                        Principal
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => !disabled && removeTutor(tutor.id)}
                      className="text-gray-400 hover:text-red-500"
                      disabled={disabled}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="px-2 py-1">
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Buscar tutores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {loading ? (
            <div className="px-2 py-2 text-center text-sm text-gray-500">
              Carregando...
            </div>
          ) : tutores.length === 0 ? (
            <div className="px-2 py-2 text-center text-sm text-gray-500">
              Nenhum tutor encontrado
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto">
              {tutores.map((tutor) => {
                const isSelected = value.some(v => v.id === tutor.id);
                return (
                  <div
                    key={tutor.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between px-2 py-2 hover:bg-gray-100",
                      isSelected && "bg-blue-50"
                    )}
                    onClick={() => toggleTutor(tutor)}
                  >
                    <div>
                      <p className="text-sm font-medium">{tutor.nome}</p>
                      <p className="text-xs text-gray-500">{tutor.email}</p>
                    </div>
                    {isSelected && <Check size={16} className="text-blue-600" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};