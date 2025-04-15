"use client";

import { resizeAndCompressImage } from "@/lib/imageUtils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { Camera, X } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const ImageUpload = ({
  value,
  onChange,
  disabled
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Atualiza o preview quando o valor muda
  useEffect(() => {
    if (value) {
      setPreview(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione uma imagem válida.");
      return;
    }

    try {
      setIsLoading(true);
      
      // Versão simplificada - use o FileReader diretamente
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageDataUrl = event.target.result as string;
          onChange(imageDataUrl);
          setPreview(imageDataUrl);
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        console.error("Erro ao ler o arquivo");
        setIsLoading(false);
        alert("Ocorreu um erro ao processar a imagem. Por favor, tente novamente.");
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error("Erro ao processar a imagem:", error);
      alert("Ocorreu um erro ao processar a imagem. Por favor, tente novamente.");
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    if (disabled) return;
    onChange("");
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        {preview ? (
          <div className="relative h-44 w-44 overflow-hidden rounded-full">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
            {!disabled && (
              <button
                onClick={handleRemove}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-700"
                type="button"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex h-44 w-44 items-center justify-center rounded-full bg-gray-100">
            <Camera size={40} className="text-gray-400" />
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isLoading}
        />
        <label htmlFor="file-upload">
          <div className={`cursor-pointer inline-flex items-center justify-center gap-2 rounded-md font-medium transition 
            ${preview ? "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50" : "bg-blue-600 text-white hover:bg-blue-700"} 
            ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 px-4 py-2`}>
            {isLoading ? (
              <>
                <span className="animate-spin inline-block h-4 w-4 border-t-2 border-white rounded-full mr-2"></span>
                Processando...
              </>
            ) : (
              preview ? "Trocar foto" : "Adicionar foto"
            )}
          </div>
        </label>

        {preview && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemove}
            disabled={disabled}
            className="ml-2"
          >
            Remover
          </Button>
        )}
      </div>
    </div>
  );
};