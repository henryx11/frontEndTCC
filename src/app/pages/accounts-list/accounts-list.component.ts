import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { Account } from '../../types/account.type';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-accounts-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './accounts-list.component.html',
  styleUrls: ['./accounts-list.component.scss']
})
export class AccountsListComponent implements OnInit {
  contas: Account[] = [];
  contaSelecionada: string | null = null;
  loading: boolean = false;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.carregarContas();
  }

  /**
   * Carrega todas as contas do usuário
   */
  carregarContas(): void {
    this.loading = true;
    this.accountService.getUserAccounts().subscribe({
      next: (contas: Account[]) => {
        this.contas = contas;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar contas:', error);
        this.toastr.error('Erro ao carregar contas');
        this.loading = false;
      }
    });
  }

  /**
   * Seleciona uma conta e mostra seus detalhes
   */
  selecionarConta(contaId: string): void {
    if (this.contaSelecionada === contaId) {
      this.contaSelecionada = null;
    } else {
      this.contaSelecionada = contaId;
    }

    console.log('Nova conta selecionada:', this.contaSelecionada); // DEBUG
    console.log('Conta encontrada:', this.getContaSelecionada()); // DEBUG
  }

  /**
   * Retorna os dados da conta selecionada
   */
  getContaSelecionada(): Account | null {
    if (this.contaSelecionada) {
      return this.contas.find(conta => conta.uuid === this.contaSelecionada) || null;
    }
    return null;
  }

  /**
   * Fecha o painel de detalhes
   */
  fecharDetalhes(): void {
    this.contaSelecionada = null;
  }

  /**
   * Recarrega os dados das contas
   */
  recarregarDados(): void {
    this.carregarContas();
  }

  /**
   * Abre tela de nova transação
   */
  novaTransacao(): void {
    const conta = this.getContaSelecionada();
    if (conta) {
      this.toastr.info('Funcionalidade em desenvolvimento');
      // this.router.navigate(['/nova-transacao', conta.id]);
    }
  }

  /**
   * Verifica se a conta está ativa
   */
  isContaAtiva(conta: Account): boolean {
    return conta.active === 'ACTIVE';
  }

  /**
   * Abre tela de extrato
   */
  /**
   * Abre tela de extrato
   */
  /**
   * Abre tela de extrato
   */
  verExtrato(): void {
    const conta = this.getContaSelecionada();
    if (conta) {
      this.router.navigate(['/account-statement', conta.uuid]);
    }
  }

  /**
   * Alterna o status da conta (ativar/desativar)
   */
  toggleContaStatus(event: Event, conta: Account): void {
    event.stopPropagation(); // Evita abrir os detalhes ao clicar no botão

    const isAtiva = this.isContaAtiva(conta);
    const acao = isAtiva ? 'desativar' : 'ativar';
    const mensagem = `Tem certeza que deseja ${acao} a conta "${conta.name}"?`;

    if (confirm(mensagem)) {
      this.loading = true;

      const operacao = isAtiva
        ? this.accountService.deactivateAccount(conta.uuid)
        : this.accountService.activateAccount(conta.uuid);

      operacao.subscribe({
        next: () => {
          this.toastr.success(`Conta ${isAtiva ? 'desativada' : 'ativada'} com sucesso!`);
          this.carregarContas(); // Recarrega a lista
          this.fecharDetalhes(); // Fecha o painel de detalhes se estiver aberto
        },
        error: (error) => {
          console.error(`Erro ao ${acao} conta:`, error);
          this.toastr.error(`Erro ao ${acao} a conta. Tente novamente.`);
          this.loading = false;
        }
      });
    }
  }
}
