// app/dashboard/pets/types.ts

export enum Sexo {
    MACHO = "MACHO",
    FEMEA = "FEMEA"
  }
  
  export interface TutorData {
    id: string;
    nome: string;
    email: string;
    isPrimario: boolean;
  }
  
  export interface PetFormData {
    id?: string;
    nome: string;
    foto: string;
    dataNascimento: string;
    raca: string;
    peso: string;
    sexo: string;
    alergias: string;
    observacoes: string;
    usaTaxiDog: boolean;
    tutores: {
      id: string;
      isPrimario: boolean;
    }[];
  }
  
  export interface PetData extends PetFormData {
    id: string;
    createdAt: string;
    updatedAt: string;
    tutores: TutorData[];
  }