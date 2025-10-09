import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Transaction, TransactionDisplay, TransactionType } from '../types/transaction.type';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly apiUrl = 'http://26.59.168.146:8090';

  constructor(private httpClient: HttpClient) {}

  /**
   * Busca todas as transações do usuário
   */
  getAllTransactions(): Observable<Transaction[]> {
    return this.httpClient.get<Transaction[]>(`${this.apiUrl}/transactions`);
  }

  /**
   * Busca transações de uma conta específica e formata para exibição
   */
  getTransactionsByAccount(accountUuid: string): Observable<TransactionDisplay[]> {
    return this.getAllTransactions().pipe(
      map(transactions => {
        // Filtra transações relacionadas à conta
        const accountTransactions = transactions.filter(t =>
          t.accounts?.uuid === accountUuid || t.foraccounts?.uuid === accountUuid
        );

        // Mapeia para formato de exibição
        return accountTransactions.map(t => this.formatTransactionForDisplay(t, accountUuid));
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
      } else {
        // Entrada de dinheiro (destino)
        type = TransactionType.TRANSFER_IN;
        displayValue = transaction.value;
        relatedAccountName = transaction.accounts?.name;
        displayDescription = `${transaction.description} ← ${relatedAccountName}`;
        icon = '↙️';
        colorClass = 'transfer-in';
      }
    } else {
      // Transação normal (receita ou despesa)
      if (transaction.category.earn) {
        type = TransactionType.INCOME;
        displayValue = transaction.value;
        displayDescription = transaction.description;
        icon = '↑';
        colorClass = 'receita';
      } else {
        type = TransactionType.EXPENSE;
        displayValue = -transaction.value;
        displayDescription = transaction.description;
        icon = '↓';
        colorClass = 'despesa';
      }
    }

    return {
      uuid: transaction.uuid,
      value: transaction.value,
      displayValue,
      description: transaction.description,
      displayDescription,
      registrationDate: transaction.registrationDate,
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
    return transactions
      .filter(t => t.displayValue > 0)
      .reduce((sum, t) => sum + t.displayValue, 0);
  }

  /**
   * Calcula totais de despesas para uma conta
   */
  calculateAccountExpense(transactions: TransactionDisplay[]): number {
    return transactions
      .filter(t => t.displayValue < 0)
      .reduce((sum, t) => sum + Math.abs(t.displayValue), 0);
  }

  /**
   * Calcula saldo líquido das transações
   */
  calculateNetBalance(transactions: TransactionDisplay[]): number {
    return transactions.reduce((sum, t) => sum + t.displayValue, 0);
  }
}
