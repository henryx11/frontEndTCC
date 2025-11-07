import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TransactionService } from './transaction.service';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  labels: string[];
  receitas: number[];
  despesas: number[];
}

export interface CategoryExpenseData {
  category: string;
  value: number;
  percentage: number;
  color: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChartsDataService {
  private readonly COLORS = [
    '#f97316', '#ea580c', '#fb923c', '#fdba74', '#fed7aa',
    '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b',
    '#ef4444', '#06b6d4'
  ];

  constructor(private transactionService: TransactionService) {}

  /**
   * Obtém dados de despesas por categoria
   */
  getDespesasPorCategoria(): Observable<CategoryExpenseData[]> {
    console.log('📊 Carregando despesas por categoria...');

    return this.transactionService.getAllTransactions().pipe(
      map(transactions => {
        console.log('📦 Total de transações recebidas:', transactions.length);
        console.log('📋 Transações completas:', transactions);

        const categoryMap = new Map<string, number>();
        let totalDespesas = 0;

        // Processa cada transação
        transactions.forEach((transaction: any) => {
          console.log('🔍 Analisando transação:', {
            description: transaction.description,
            value: transaction.value,
            category: transaction.category?.description,
            earn: transaction.category?.earn,
            foraccounts: transaction.foraccounts
          });

          // Verifica se é uma despesa (categoria com earn = false)
          const isDespesa = transaction.category && transaction.category.earn === false;
          // Não é transferência (não tem foraccounts)
          const isNotTransfer = !transaction.foraccounts;

          if (isDespesa && isNotTransfer && transaction.value > 0) {
            const categoryName = transaction.category.description || 'Sem categoria';
            const value = transaction.value;

            console.log('✅ Despesa identificada:', categoryName, value);

            categoryMap.set(
              categoryName,
              (categoryMap.get(categoryName) || 0) + value
            );
            totalDespesas += value;
          }
        });

        console.log('💰 Total de despesas:', totalDespesas);
        console.log('📂 Categorias encontradas:', Array.from(categoryMap.entries()));

        // Se não houver despesas, retorna array vazio
        if (totalDespesas === 0) {
          console.log('⚠️ Nenhuma despesa encontrada');
          return [];
        }

        // Converte para array e adiciona percentuais
        const data: CategoryExpenseData[] = Array.from(categoryMap.entries())
          .map(([category, value], index) => ({
            category,
            value,
            percentage: (value / totalDespesas) * 100,
            color: this.COLORS[index % this.COLORS.length]
          }))
          .sort((a, b) => b.value - a.value);

        console.log('✅ Dados processados:', data);
        return data;
      }),
      catchError(error => {
        console.error('❌ Erro ao carregar despesas:', error);
        return of([]); // Retorna array vazio em caso de erro
      })
    );
  }

  /**
   * Obtém evolução temporal de receitas vs despesas (últimos N meses)
   */
  getEvolucaoTemporal(meses: number = 6): Observable<TimeSeriesData> {
    console.log('📈 Carregando evolução temporal...');

    return this.transactionService.getAllTransactions().pipe(
      map(transactions => {
        const hoje = new Date();
        const labels: string[] = [];
        const receitasMap = new Map<string, number>();
        const despesasMap = new Map<string, number>();

        console.log('📅 Data atual:', hoje);
        console.log('📊 Gerando últimos', meses, 'meses');

        // Gera labels dos últimos N meses
        for (let i = meses - 1; i >= 0; i--) {
          const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
          const mesAno = data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
          labels.push(mesAno);
          receitasMap.set(mesAno, 0);
          despesasMap.set(mesAno, 0);

          console.log(`   Mês ${meses - i}: ${mesAno}`);
        }

        console.log('📋 Labels gerados:', labels);
        console.log('🔄 Processando transações...');

        // Processa transações
        transactions.forEach((transaction: any, index: number) => {
          // Pula transferências
          if (transaction.foraccounts) {
            console.log(`   ⏭️ ${index + 1}. Transferência ignorada`);
            return;
          }

          // Tenta pegar a data de várias formas
          const dateStr = transaction.registrationDate || transaction.dateRegistration;
          if (!dateStr) {
            console.log(`   ⚠️ ${index + 1}. Sem data:`, transaction.description);
            return;
          }

          const transactionDate = new Date(dateStr);
          const mesAno = transactionDate.toLocaleDateString('pt-BR', {
            month: 'short',
            year: 'numeric'
          });

          console.log(`   📅 ${index + 1}. ${transaction.description}:`, {
            data: dateStr,
            mesAno: mesAno,
            valor: transaction.value,
            categoria: transaction.category?.description,
            earn: transaction.category?.earn
          });

          if (labels.includes(mesAno) && transaction.value > 0) {
            const isReceita = transaction.category && transaction.category.earn === true;
            const value = transaction.value;

            if (isReceita) {
              const anterior = receitasMap.get(mesAno) || 0;
              receitasMap.set(mesAno, anterior + value);
              console.log(`      ✅ Receita adicionada a ${mesAno}: ${anterior} + ${value} = ${anterior + value}`);
            } else {
              const anterior = despesasMap.get(mesAno) || 0;
              despesasMap.set(mesAno, anterior + value);
              console.log(`      ✅ Despesa adicionada a ${mesAno}: ${anterior} + ${value} = ${anterior + value}`);
            }
          } else {
            console.log(`      ⚠️ Mês ${mesAno} não está nos labels ou valor inválido`);
          }
        });

        const receitas = labels.map(label => receitasMap.get(label) || 0);
        const despesas = labels.map(label => despesasMap.get(label) || 0);

        console.log('📊 RESULTADO FINAL:');
        console.log('   Labels:', labels);
        console.log('   Receitas:', receitas);
        console.log('   Despesas:', despesas);

        return {
          labels,
          receitas,
          despesas
        };
      }),
      catchError(error => {
        console.error('❌ Erro ao carregar evolução temporal:', error);
        // Retorna dados vazios em caso de erro
        return of({
          labels: [],
          receitas: [],
          despesas: []
        });
      })
    );
  }

  /**
   * Obtém top N categorias de despesas
   */
  getTopCategoriasDespesas(limit: number = 5): Observable<CategoryExpenseData[]> {
    return this.getDespesasPorCategoria().pipe(
      map(data => data.slice(0, limit))
    );
  }
}
