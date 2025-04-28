// Enums
export enum StatusAgendamento {
  AGENDADO = "AGENDADO",
  EM_ANDAMENTO = "EM_ANDAMENTO",
  CONCLUIDO = "CONCLUIDO",
  CANCELADO = "CANCELADO"
}

export enum StatusPagamento {
  PENDENTE = "PENDENTE",
  PAGO = "PAGO"
}

export enum MetodoPagamento {
  DINHEIRO = "DINHEIRO",
  CARTAO_CREDITO = "CARTAO_CREDITO",
  CARTAO_DEBITO = "CARTAO_DEBITO",
  PIX = "PIX",
  TRANSFERENCIA = "TRANSFERENCIA"
}

export enum TransporteEntrada {
  DONO_TRAZ = "DONO_TRAZ",
  TAXI_DOG = "TAXI_DOG"
}

export enum TransporteSaida {
  DONO_BUSCA = "DONO_BUSCA",
  TAXI_DOG = "TAXI_DOG"
}

// Interface para Pet na listagem
export interface PetInfo {
  id: string;
  nome: string;
  foto?: string;
  raca?: string;
  peso?: number;
  tutorPrincipal?: {
    id: string;
    nome: string;
    telefone: string;
  };
}

// Interface para Serviço na listagem
export interface ServicoInfo {
  id: string;
  nome: string;
  preco: number;
}

// Interface para Checklist de finalização
export interface ChecklistData {
  id?: string;
  agendamentoId?: string;
  temCarrapatos: boolean;
  temPulgas: boolean;
  problemaPele: boolean;
  problemaDentes: boolean;
  outrosProblemas?: string;
  observacoes?: string;
}

// Interface para Agendamento no formulário
export interface AgendamentoFormData {
  id?: string;
  petId: string;
  data: string; // YYYY-MM-DD
  horaInicio: string; // HH:MM
  horaFim?: string; // HH:MM
  observacoes?: string;
  status: StatusAgendamento;
  statusPagamento: StatusPagamento;
  metodoPagamento?: MetodoPagamento;
  valorTotal: number;
  transporteEntrada: TransporteEntrada;
  transporteSaida: TransporteSaida;
  enviarNotificacao: boolean;
  servicos: {
    id: string;
    preco: number;
  }[];
  checklist?: ChecklistData;
}

// Interface para Agendamento completo
export interface AgendamentoData extends Omit<AgendamentoFormData, 'petId' | 'servicos'> {
  id: string;
  pet: PetInfo;
  servicos: ServicoInfo[];
  createdAt: string;
  updatedAt: string;
}