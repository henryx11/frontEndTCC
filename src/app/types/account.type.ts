export interface Account {
  id: string;
  userId: string;
  name: string;
  balance: number;
  bank: {
    uuid: string;
    name: string;
  };
  type: {
    uuid: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
