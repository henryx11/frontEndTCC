export interface Transaction {
  uuid: string;
  value: number;
  description: string;
  dateRegistration: string;
  category: {
    uuid: string;
    description: string;
    earn: boolean;
    active: string;
  };
  active: string | null;
}
