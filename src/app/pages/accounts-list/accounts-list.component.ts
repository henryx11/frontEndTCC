import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { Account } from '../../types/account.type';
import { ToastrService } from 'ngx-toastr';
import { TransferModalComponent } from '../../components/transfer-modal/transfer-modal.component';

@Component({
  selector: 'app-accounts-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TransferModalComponent],
  templateUrl: './accounts-list.component.html',
  styleUrls: ['./accounts-list.component.scss']
})
export class AccountsListComponent implements OnInit {
  contas: Account[] = [];
  contaSelecionada: string | null = null;
  loading: boolean = false;
  modalTransferenciaAberto: boolean = false;

  // Controle da edição inline
  editandoNome: boolean = false;
  nomeEditado: string = '';
  salvandoNome: boolean = false;

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
      // Cancela edição ao trocar de conta
      this.cancelarEdicao();
    }
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
    this.cancelarEdicao();
  }

  /**
   * Recarrega os dados das contas
   */
  recarregarDados(): void {
    this.carregarContas();
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
    event.stopPropagation();

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
          this.carregarContas();
          this.fecharDetalhes();
        },
        error: (error) => {
          console.error(`Erro ao ${acao} conta:`, error);
          this.toastr.error(`Erro ao ${acao} a conta. Tente novamente.`);
          this.loading = false;
        }
      });
    }
  }

  /**
   * Abre o modal de transferência
   */
  abrirModalTransferencia(): void {
    const conta = this.getContaSelecionada();

    if (!conta) {
      this.toastr.error('Nenhuma conta selecionada');
      return;
    }

    if (!this.isContaAtiva(conta)) {
      this.toastr.error('Não é possível fazer transferências de uma conta desativada');
      return;
    }

    // Verifica se existem outras contas ativas para transferir
    const contasAtivasDisponiveis = this.contas.filter(
      c => c.uuid !== conta.uuid && c.active === 'ACTIVE'
    );

    if (contasAtivasDisponiveis.length === 0) {
      this.toastr.warning('Não há outras contas ativas disponíveis para transferência');
      return;
    }

    if (conta.balance <= 0) {
      this.toastr.warning('A conta não possui saldo disponível para transferência');
      return;
    }

    this.modalTransferenciaAberto = true;
  }

  /**
   * Fecha o modal de transferência
   */
  fecharModalTransferencia(): void {
    this.modalTransferenciaAberto = false;
  }

  /**
   * Callback quando a transferência é realizada com sucesso
   */
  onTransferenciaRealizada(): void {
    this.modalTransferenciaAberto = false;
    this.carregarContas();
    this.fecharDetalhes();
  }

  // ========== MÉTODOS DE EDIÇÃO INLINE ==========

  /**
   * Inicia a edição do nome da conta
   */
  iniciarEdicaoNome(): void {
    const conta = this.getContaSelecionada();
    if (conta) {
      this.editandoNome = true;
      this.nomeEditado = conta.name;
    }
  }

  /**
   * Cancela a edição do nome
   */
  cancelarEdicao(): void {
    this.editandoNome = false;
    this.nomeEditado = '';
  }

  /**
   * Salva o novo nome da conta
   */
  salvarNome(): void {
    const conta = this.getContaSelecionada();

    if (!conta) {
      this.toastr.error('Nenhuma conta selecionada');
      return;
    }

    // Validações
    const nomeFormatado = this.nomeEditado.trim();

    if (!nomeFormatado) {
      this.toastr.error('O nome da conta não pode estar vazio');
      return;
    }

    if (nomeFormatado === conta.name) {
      this.cancelarEdicao();
      return;
    }

    // Cria uma cópia da conta com o novo nome
    const contaAtualizada: Account = {
      ...conta,
      name: nomeFormatado
    };

    this.salvandoNome = true;

    this.accountService.updateAccount(contaAtualizada).subscribe({
      next: (response) => {
        // Atualiza a conta na lista local
        const index = this.contas.findIndex(c => c.uuid === conta.uuid);
        if (index !== -1) {
          this.contas[index] = response;
        }

        this.toastr.success('Nome da conta atualizado com sucesso!');
        this.editandoNome = false;
        this.nomeEditado = '';
        this.salvandoNome = false;
      },
      error: (error) => {
        console.error('Erro ao atualizar nome da conta:', error);
        const mensagemErro = error.error?.message || 'Erro ao atualizar o nome da conta. Tente novamente.';
        this.toastr.error(mensagemErro);
        this.salvandoNome = false;
      }
    });
  }

  /**
   * Manipula teclas no campo de edição
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.salvarNome();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelarEdicao();
    }
  }
}
