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
    console.log('🚀 COMPONENTE ACCOUNT-STATEMENT INICIADO');
    console.log('📋 UUID da conta da URL:', this.accountUuid);
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

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔄 CARREGANDO EXTRATO');
    console.log('📋 UUID da Conta:', this.accountUuid);
    console.log('🕒 Horário:', new Date().toLocaleTimeString());

    this.loading = true;
    this.transactionService.getTransactionsByAccount(this.accountUuid).subscribe({
      next: (transactions: TransactionDisplay[]) => {
        console.log('✅ RESPOSTA DO SERVICE:');
        console.log('   Total de transações:', transactions.length);

        if (transactions.length === 0) {
          console.warn('⚠️ NENHUMA TRANSAÇÃO ENCONTRADA!');
          console.warn('   Possíveis causas:');
          console.warn('   1. Backend não retornou transações desta conta');
          console.warn('   2. UUID da conta está incorreto');
          console.warn('   3. Receitas foram criadas em outra conta');
          console.warn('   4. Backend não associou a receita à conta');
        } else {
          console.log('📋 LISTA DE TRANSAÇÕES:');
          transactions.forEach((t, index) => {
            console.log(`   ${index + 1}. ${t.displayDescription}`);
            console.log(`      💵 Valor display: ${t.displayValue}`);
            console.log(`      💰 Valor original: ${t.value}`);
            console.log(`      📂 Tipo: ${t.type}`);
            console.log(`      🔄 É transferência? ${t.isTransfer}`);
            console.log(`      🏷️ Categoria: ${t.category.description} (earn: ${t.category.earn})`);
            console.log(`      📅 Data: ${t.registrationDate}`);
          });
        }

        // Ordena por data (mais recente primeiro)
        this.transactions = transactions.sort((a, b) => {
          return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
        });

        console.log('📊 CALCULANDO TOTAIS:');
        const totalReceitas = this.getTotalReceitas();
        const totalDespesas = this.getTotalDespesas();
        const saldo = this.getSaldo();

        console.log('   💰 Total Receitas (Entradas):', totalReceitas);
        console.log('   💸 Total Despesas (Saídas):', totalDespesas);
        console.log('   📈 Saldo Líquido:', saldo);

        if (totalReceitas === 0 && totalDespesas === 0) {
          console.warn('⚠️ TOTAIS ZERADOS!');
          console.warn('   Verifique se as transações estão sendo criadas corretamente');
        }

        this.loading = false;
        console.log('✅ Extrato carregado com sucesso!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      },
      error: (error) => {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ ERRO ao carregar extrato:');
        console.error('   Status HTTP:', error.status);
        console.error('   Mensagem:', error.message);
        console.error('   Detalhes:', error.error);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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
