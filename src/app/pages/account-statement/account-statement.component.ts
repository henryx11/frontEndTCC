import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../types/transaction.type';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-account-statement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-statement.component.html',
  styleUrls: ['./account-statement.component.scss']
})
export class AccountStatementComponent implements OnInit {
  transactions: Transaction[] = [];
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

  carregarExtrato(): void {
    this.loading = true;
    this.transactionService.getAllTransactions().subscribe({
      next: (transactions: Transaction[]) => {
        // Filtrar transações da conta se accountUuid existir
        if (this.accountUuid) {
          this.transactions = transactions.filter(t =>
            (t as any).accounts?.uuid === this.accountUuid
          );
        } else {
          this.transactions = transactions;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar extrato:', error);
        this.toastr.error('Erro ao carregar extrato');
        this.loading = false;
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/accounts-list']);
  }

  getTotalReceitas(): number {
    return this.transactions
      .filter(t => t.category.earn === true)
      .reduce((sum, t) => sum + t.value, 0);
  }

  getTotalDespesas(): number {
    return this.transactions
      .filter(t => t.category.earn === false)
      .reduce((sum, t) => sum + t.value, 0);
  }

  getSaldo(): number {
    return this.getTotalReceitas() - this.getTotalDespesas();
  }
}
