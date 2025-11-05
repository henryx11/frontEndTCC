import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Transaction, TransactionDisplay, TransactionType } from '../types/transaction.type';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly apiUrl = 'http://26.59.168.146:8090';

  constructor(private httpClient: HttpClient) {}

  /**
   * Busca todas as transações do usuário (RECEITAS + DESPESAS + TRANSFERÊNCIAS)
   */
  getAllTransactions(): Observable<Transaction[]> {
    console.log('🌐 Fazendo requisições GET para buscar TODAS as transações');

    // Busca transferências
    const transfers$ = this.httpClient.get<any[]>(`${this.apiUrl}/transactions`);

    // Busca receitas (endpoint reciphe)
    const receipts$ = this.httpClient.get<any[]>(`${this.apiUrl}/reciphe`);

    // Busca despesas (endpoint expense)
    const expenses$ = this.httpClient.get<any[]>(`${this.apiUrl}/expense`);

    // Combina os três observables usando forkJoin
    return forkJoin({
      transfers: transfers$,
      receipts: receipts$,
      expenses: expenses$
    }).pipe(
      map(({ transfers, receipts, expenses }) => {
        console.log('📦 Transferências do backend:', transfers.length);
        console.log('📦 Receitas do backend:', receipts.length);
        console.log('📦 Despesas do backend:', expenses.length);

        // Normaliza as receitas para ter o mesmo formato que transferências
        const normalizedReceipts = receipts.map(receipt => ({
          ...receipt,
          registrationDate: receipt.dateRegistration || receipt.registrationDate,
          foraccounts: null
        }));

        // Normaliza as despesas para ter o mesmo formato que transferências
        const normalizedExpenses = expenses.map(expense => ({
          ...expense,
          registrationDate: expense.payDate || expense.dateRegistration || expense.registrationDate,
          foraccounts: null
        }));

        console.log('✅ Receitas normalizadas:', normalizedReceipts.length);
        console.log('✅ Despesas normalizadas:', normalizedExpenses.length);

        // Combina os arrays
        const allTransactions = [...transfers, ...normalizedReceipts, ...normalizedExpenses];

        console.log('📊 Total combinado de transações:', allTransactions.length);
        return allTransactions;
      })
    );
  }

  /**
   * Busca transações de uma conta específica e formata para exibição
   */
  getTransactionsByAccount(accountUuid: string): Observable<TransactionDisplay[]> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 BUSCANDO TRANSAÇÕES DA CONTA');
    console.log('📋 UUID da Conta:', accountUuid);

    return this.getAllTransactions().pipe(
      map(transactions => {
        console.log('🔎 FILTRANDO TRANSAÇÕES:');

        // Filtra transações relacionadas à conta
        const accountTransactions = transactions.filter(t => {
          const isOrigin = t.accounts?.uuid === accountUuid;
          const isDestination = t.foraccounts?.uuid === accountUuid;
          const matched = isOrigin || isDestination;

          if (matched) {
            console.log(`   ✅ Transação encontrada:`, {
              description: t.description,
              value: t.value,
              isOrigin,
              isDestination,
              category: t.category.description,
              earn: t.category.earn,
              accounts: t.accounts?.uuid,
              foraccounts: t.foraccounts?.uuid
            });
          }

          return matched;
        });

        console.log('📊 Total de transações filtradas:', accountTransactions.length);

        // Mapeia para formato de exibição
        const displayTransactions = accountTransactions.map(t =>
          this.formatTransactionForDisplay(t, accountUuid)
        );

        console.log('✅ Transações formatadas:', displayTransactions);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        return displayTransactions;
      })
    );
  }

  /**
   * Formata uma transação para exibição no extrato
   */
  private formatTransactionForDisplay(transaction: Transaction, accountUuid: string): TransactionDisplay {
    const isOrigin = transaction.accounts?.uuid === accountUuid;
    const isDestination = transaction.foraccounts?.uuid === accountUuid;
    const isTransfer = !!(transaction.accounts && transaction.foraccounts);

    console.log(`🔄 Formatando transação: ${transaction.description}`);
    console.log(`   É origem? ${isOrigin}`);
    console.log(`   É destino? ${isDestination}`);
    console.log(`   É transferência? ${isTransfer}`);
    console.log(`   Categoria earn? ${transaction.category.earn}`);
    console.log(`   📅 Data original:`, transaction.registrationDate);
    console.log(`   📋 Dados completos:`, transaction);

    let type: TransactionType;
    let displayValue: number;
    let displayDescription: string;
    let relatedAccountName: string | undefined;
    let icon: string;
    let colorClass: string;

    if (isTransfer) {
      // É uma transferência
      if (isOrigin) {
        // Saída de dinheiro (origem)
        type = TransactionType.TRANSFER_OUT;
        displayValue = -transaction.value;
        relatedAccountName = transaction.foraccounts?.name;
        displayDescription = `${transaction.description} → ${relatedAccountName}`;
        icon = '↗️';
        colorClass = 'transfer-out';
        console.log(`   ↗️ Transferência ENVIADA: -${transaction.value}`);
      } else {
        // Entrada de dinheiro (destino)
        type = TransactionType.TRANSFER_IN;
        displayValue = transaction.value;
        relatedAccountName = transaction.accounts?.name;
        displayDescription = `${transaction.description} ← ${relatedAccountName}`;
        icon = '↙️';
        colorClass = 'transfer-in';
        console.log(`   ↙️ Transferência RECEBIDA: +${transaction.value}`);
      }
    } else {
      // Transação normal (receita ou despesa)
      if (transaction.category.earn) {
        type = TransactionType.INCOME;
        displayValue = transaction.value;
        displayDescription = transaction.description;
        icon = '↑';
        colorClass = 'receita';
        console.log(`   ↑ RECEITA: +${transaction.value}`);
      } else {
        type = TransactionType.EXPENSE;
        displayValue = -transaction.value;
        displayDescription = transaction.description;
        icon = '↓';
        colorClass = 'despesa';
        console.log(`   ↓ DESPESA: -${transaction.value}`);
      }
    }

    // Garantir que registrationDate existe, senão usa data atual
    const registrationDate = transaction.registrationDate || new Date().toISOString().split('T')[0];

    console.log(`   ✅ Data final formatada: ${registrationDate}`);

    return {
      uuid: transaction.uuid,
      value: transaction.value,
      displayValue,
      description: transaction.description,
      displayDescription,
      registrationDate: registrationDate, // ✅ Garantido
      type,
      isTransfer,
      category: {
        description: transaction.category.description,
        earn: transaction.category.earn
      },
      relatedAccountName,
      icon,
      colorClass
    };
  }

  /**
   * Calcula totais de receitas para uma conta
   */
  calculateAccountIncome(transactions: TransactionDisplay[]): number {
    console.log('💰 CALCULANDO TOTAL DE RECEITAS (ENTRADAS):');

    const receitas = transactions.filter(t => {
      const isPositive = t.displayValue > 0;
      if (isPositive) {
        console.log(`   ✅ ${t.displayDescription}: +${t.displayValue}`);
      }
      return isPositive;
    });

    const total = receitas.reduce((sum, t) => sum + t.displayValue, 0);

    console.log(`   📊 Total de entradas: ${receitas.length}`);
    console.log(`   💵 Soma total: ${total}`);

    return total;
  }

  /**
   * Calcula totais de despesas para uma conta
   */
  calculateAccountExpense(transactions: TransactionDisplay[]): number {
    console.log('💸 CALCULANDO TOTAL DE DESPESAS (SAÍDAS):');

    const despesas = transactions.filter(t => {
      const isNegative = t.displayValue < 0;
      if (isNegative) {
        console.log(`   ❌ ${t.displayDescription}: ${t.displayValue}`);
      }
      return isNegative;
    });

    const total = despesas.reduce((sum, t) => sum + Math.abs(t.displayValue), 0);

    console.log(`   📊 Total de saídas: ${despesas.length}`);
    console.log(`   💵 Soma total: ${total}`);

    return total;
  }

  /**
   * Calcula saldo líquido das transações
   */
  calculateNetBalance(transactions: TransactionDisplay[]): number {
    const saldo = transactions.reduce((sum, t) => sum + t.displayValue, 0);

    console.log('📈 CALCULANDO SALDO LÍQUIDO:');
    console.log(`   Resultado: ${saldo}`);

    return saldo;
  }
}
