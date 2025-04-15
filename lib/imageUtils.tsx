// lib/imageUtils.ts

/**
 * Redimensiona e comprime uma imagem para garantir que seja menor que 100KB
 * Retorna uma string base64 da imagem
 */
export async function resizeAndCompressImage(
    file: File,
    maxSizeKB: number = 100
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // Criar um canvas para redimensionar a imagem
          const canvas = document.createElement("canvas");
          
          // Iniciar com as dimensões originais
          let width = img.width;
          let height = img.height;
          
          // Determinar o fator de escala para manter a proporção
          // Começamos com 1 (tamanho original) e vamos reduzindo se necessário
          let scale = 1;
          
          // Se a dimensão for muito grande, redimensionar para no máximo 1000px
          const MAX_DIMENSION = 1000;
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width *= scale;
            height *= scale;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Tentar diferentes níveis de qualidade até obter um tamanho menor que maxSizeKB
          let quality = 0.9; // Começar com alta qualidade
          let dataUrl: string;
          
          const tryCompress = () => {
            dataUrl = canvas.toDataURL("image/jpeg", quality);
            
            // Calcular tamanho aproximado em KB (removendo o cabeçalho base64)
            const base64str = dataUrl.split(",")[1];
            const sizeInBytes = (base64str.length * 3) / 4; // aproximação do tamanho base64 para bytes
            const sizeInKB = sizeInBytes / 1024;
            
            if (sizeInKB > maxSizeKB && quality > 0.1) {
              // Se ainda estiver muito grande, reduzir a qualidade e tentar novamente
              quality -= 0.1;
              tryCompress();
            } else {
              resolve(dataUrl);
            }
          };
          
          tryCompress();
        };
        
        img.onerror = () => {
          reject(new Error("Erro ao carregar a imagem"));
        };
      };
      
      reader.onerror = () => {
        reject(new Error("Erro ao ler o arquivo"));
      };
    });
  }