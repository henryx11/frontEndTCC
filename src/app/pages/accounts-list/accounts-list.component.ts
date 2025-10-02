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
      // Se clicar na mesma conta, fecha os detalhes
      this.contaSelecionada = null;
    } else {
      // Seleciona a nova conta
      this.contaSelecionada = contaId;
    }
  }

  /**
   * Retorna os dados da conta selecionada
   */
  getContaSelecionada(): Account | null {
    if (this.contaSelecionada) {
      return this.contas.find(conta => conta.id === this.contaSelecionada) || null;
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
}
