import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { TransactionDisplay } from '../../types/transaction.type';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-account-statement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-statement.component.html',
  styleUrls: ['./account-statement.component.scss']
})
export class AccountStatementComponent implements OnInit {
  transactions: TransactionDisplay[] = [];
  loading: boolean = false;
  accountUuid: string | null = null;

  constructor(
    private transactionService: TransactionService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.accountUuid = this.route.snapshot.paramMap.get('id');
    this.carregarExtrato();
  }

  /**
   * Carrega o extrato da conta
   */
  carregarExtrato(): void {
    if (!this.accountUuid) {
      this.toastr.error('ID da conta não encontrado');
      return;
    }

    this.loading = true;
    this.transactionService.getTransactionsByAccount(this.accountUuid).subscribe({
      next: (transactions: TransactionDisplay[]) => {
        // Ordena por data (mais recente primeiro)
        this.transactions = transactions.sort((a, b) => {
          return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar extrato:', error);
        this.toastr.error('Erro ao carregar extrato');
        this.loading = false;
      }
    });
  }

  /**
   * Volta para a lista de contas
   */
  voltar(): void {
    this.router.navigate(['/accounts-list']);
  }

  /**
   * Calcula total de receitas (incluindo transferências recebidas)
   */
  getTotalReceitas(): number {
    return this.transactionService.calculateAccountIncome(this.transactions);
  }

  /**
   * Calcula total de despesas (incluindo transferências enviadas)
   */
  getTotalDespesas(): number {
    return this.transactionService.calculateAccountExpense(this.transactions);
  }

  /**
   * Calcula saldo líquido
   */
  getSaldo(): number {
    return this.transactionService.calculateNetBalance(this.transactions);
  }

  /**
   * Retorna a classe CSS apropriada para cada tipo de transação
   */
  getTransactionClass(transaction: TransactionDisplay): string {
    return transaction.colorClass;
  }

  /**
   * Verifica se o valor é positivo (entrada)
   */
  isPositive(value: number): boolean {
    return value > 0;
  }

  /**
   * Formata valor monetário
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(value));
  }
}
