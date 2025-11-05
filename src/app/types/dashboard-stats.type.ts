export interface ReceitasTotalResponse {
  total: number;
}

export interface DespesasTotalResponse {
  total: number;
}

// ✨ Adicione esta nova interface
export interface SaldoTotalResponse {
  total: number;
}

export interface Account {
  name: string;
  balance: number;
  bank: {
    uuid: string;
  };
  type: {
    uuid: string;
  };
}
