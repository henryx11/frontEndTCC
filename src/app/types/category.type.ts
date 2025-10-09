export interface Category {
  uuid: string;
  description: string;
  earn: boolean;  // true = receita, false = despesa
  active: string; // 'ACTIVE' | 'INACTIVE' | 'DISABLE'
  icon?: string;  // Emoji do ícone (adicionado pelo frontend)
}

export interface CreateCategoryRequest {
  description: string;
  earn: boolean;
  icon?: string;
}

export interface UpdateCategoryRequest {
  description?: string;
  earn?: boolean;
  icon?: string;
}
