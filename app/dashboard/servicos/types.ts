// app/dashboard/servicos/types.ts

export enum TipoPrecificacao {
    PESO = "PESO",
    RACA = "RACA",
    AMBOS = "AMBOS"
  }
  
  export interface PrecoPorPeso {
    id?: string;
    pesoInicial: number;
    pesoFinal: number;
    preco: number;
  }
  
  export interface PrecoPorRaca {
    id?: string;
    raca: string;
    preco: number;
  }
  
  export interface ServicoFormData {
    id?: string;
    nome: string;
    observacoes?: string;
    tipoPrecificacao: TipoPrecificacao;
    precosPorPeso: PrecoPorPeso[];
    precosPorRaca: PrecoPorRaca[];
  }
  
  export interface ServicoData extends ServicoFormData {
    id: string;
    createdAt: string;
    updatedAt: string;
  }