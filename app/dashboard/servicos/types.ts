// app/dashboard/servicos/types.ts

export interface Preco {
    id?: string;
    raca?: string | null;
    peso?: number | null;
    preco: number;
  }
  
  export interface ServicoFormData {
    id?: string;
    nome: string;
    observacoes?: string;
    precos: Preco[];
  }
  
  export interface ServicoData extends ServicoFormData {
    id: string;
    createdAt: string;
    updatedAt: string;
  }