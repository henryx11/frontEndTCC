export interface TransferRequest {
  value: number;
  description: string;
  registrationDate: string; // formato YYYY-MM-DD
  accounts: {
    uuid: string; // conta de origem
  };
  foraccounts: {
    uuid: string; // conta de destino
  };
  category: {
    uuid: string; // categoria da transação
  };
}

export interface TransferResponse {
  uuid: string;
  value: number;
  description: string;
  dateRegistration: string;
  message?: string;
}
