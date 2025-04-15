// app/dashboard/tutores/types.ts

export interface TutorFormData {
  id?: string;
  nome: string;
  email: string;
  telefone: string;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface TutorData extends TutorFormData {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;  
  createdAt: string;
  updatedAt: string;
}