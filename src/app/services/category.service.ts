import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category } from '../types/category.type';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiUrl = 'http://26.59.168.146:8090/category';

  constructor(private httpClient: HttpClient) {}

  /**
   * Busca todas as categorias (receitas e despesas)
   */
  getAllCategories(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(`${this.apiUrl}`);
  }

  /**
   * Busca apenas categorias de despesas (earn = false)
   */
  getExpenseCategories(): Observable<Category[]> {
    const params = new HttpParams().set('earn', '0');
    return this.httpClient.get<Category[]>(`${this.apiUrl}`, { params });
  }

  /**
   * Busca apenas categorias de receitas (earn = true)
   */
  getIncomeCategories(): Observable<Category[]> {
    const params = new HttpParams().set('earn', '1');
    return this.httpClient.get<Category[]>(`${this.apiUrl}`, { params });
  }

  /**
   * Busca apenas categorias ativas
   */
  getActiveCategories(): Observable<Category[]> {
    return this.getAllCategories().pipe(
      map(categories => categories.filter(c => c.active === 'ACTIVE'))
    );
  }

  /**
   * Busca categorias ativas de despesas
   */
  getActiveExpenseCategories(): Observable<Category[]> {
    return this.getExpenseCategories().pipe(
      map(categories => categories.filter(c => c.active === 'ACTIVE'))
    );
  }

  /**
   * Busca categorias ativas de receitas
   */
  getActiveIncomeCategories(): Observable<Category[]> {
    return this.getIncomeCategories().pipe(
      map(categories => categories.filter(c => c.active === 'ACTIVE'))
    );
  }

  /**
   * Mapeia categorias para adicionar ícones baseados na descrição
   */
  addIconsToCategories(categories: Category[]): Category[] {
    const iconMap: { [key: string]: string } = {
      'alimentação': '🍔',
      'mercado': '🛒',
      'transporte': '🚗',
      'moradia': '🏠',
      'saúde': '💊',
      'educação': '📚',
      'faculdade': '🎓',
      'lazer': '🎮',
      'jogos': '🎯',
      'compras': '🛍️',
      'contas': '💡',
      'investimentos': '📈',
      'transferências': '💰',
      'transferencia': '💰',
      'salário': '💼',
      'salario': '💼',
      'freelance': '💻',
      'vendas': '💵',
      'presentes': '🎁',
      'reembolso': '↩️',
      'outros': '📦'
    };

    return categories.map(category => ({
      ...category,
      icon: iconMap[category.description.toLowerCase()] || '📦'
    }));
  }
}
