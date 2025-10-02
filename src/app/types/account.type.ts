export interface Account {
  uuid: string;  // Mudou de id para uuid
  userId: string;
  name: string;
  balance: number;
  bank: {
    uuid: string;
    name: string;
  };
  type: {
    uuid: string;
    description: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
