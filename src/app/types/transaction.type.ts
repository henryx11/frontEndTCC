export interface Transaction {
  uuid: string;
  value: number;
  description: string;
  registrationDate: string;
  category: {
    uuid: string;
    description: string;
    earn: boolean;
    active: string;
  };
  accounts?: {
    uuid: string;
    name?: string;
    balance?: number;
  };
  foraccounts?: {
    uuid: string;
    name?: string;
    balance?: number;
  };
  active: string | null;
}

// Enum para facilitar identificação do tipo de transação
export enum TransactionType {
  INCOME = 'INCOME',               // Receita normal
  EXPENSE = 'EXPENSE',             // Despesa normal
  TRANSFER_OUT = 'TRANSFER_OUT',   // Transferência enviada
  TRANSFER_IN = 'TRANSFER_IN'      // Transferência recebida
}

// Interface para exibição formatada no extrato
export interface TransactionDisplay {
  uuid: string;
  value: number;
  displayValue: number;  // Valor com sinal correto
  description: string;
  displayDescription: string;  // Descrição formatada
  registrationDate: string;
  type: TransactionType;
  isTransfer: boolean;
  category: {
    description: string;
    earn: boolean;
  };
  relatedAccountName?: string;  // Nome da conta relacionada (origem/destino)
  icon: string;  // Ícone a ser exibido
  colorClass: string;  // Classe CSS para cor
}
