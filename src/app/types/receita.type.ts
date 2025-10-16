export interface CreateReceitaRequest {
  value: number;
  description: string;
  registrationDate: string; // formato YYYY-MM-DD
  accounts: {
    uuid: string;
  };
  category: {
    uuid: string;
  };
}

export interface UpdateReceitaRequest {
  value: number;
  description: string;
  registrationDate: string;
  accounts: {
    uuid: string;
  };
  category: {
    uuid: string;
  };
}

export interface ReceitaResponse {
  uuid: string;
  value: number;
  description: string;
  dateRegistration: string;
  message?: string;
}

export interface Receita {
  uuid: string;
  value: number;
  description: string;
  dateRegistration: string | null;
  category: {
    uuid: string;
    description: string;
    earn: boolean;
    active: string;
  };
  accounts: {
    uuid: string;
    name: string;
    balance: number;
  };
  active: string;
}
