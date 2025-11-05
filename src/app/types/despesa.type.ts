// src/app/types/despesa.type.ts

export interface Despesa {
  uuid: string;
  value: number;
  description: string;
  payDate: string;
  dateRegistration?: string; // Alguns podem ter
  category: {
    uuid: string;
    description: string;
    earn: boolean;
    active: string;
  };
  accounts: {
    uuid: string;
    name?: string;
    balance?: number;
  };
  active: string | null;
}

export interface CreateDespesaRequest {
  value: number;
  description: string;
  payDate: string;
  category: {
    uuid: string;
  };
  accounts: {
    uuid: string;
  };
}

export interface UpdateDespesaRequest {
  value: number;
  description: string;
  payDate: string;
  category: {
    uuid: string;
  };
  accounts: {
    uuid: string;
  };
}

export interface DespesaResponse {
  uuid: string;
  value: number;
  description: string;
  payDate: string;
  category: {
    uuid: string;
    description: string;
  };
  accounts: {
    uuid: string;
    name: string;
  };
}

export interface DespesasTotalResponse {
  total: number;
}
