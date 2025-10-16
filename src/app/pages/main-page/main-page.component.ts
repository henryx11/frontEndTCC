import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { AccountService } from '../../services/account.service';
import { ToastrService } from 'ngx-toastr';
import { AddReceitaModalComponent } from '../../components/add-receita-modal/add-receita-modal.component';
import { EditReceitaModalComponent } from '../../components/edit-receita-modal/edit-receita-modal.component';
import { Account } from '../../types/account.type';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, AddReceitaModalComponent, EditReceitaModalComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit {
  totalReceitas: number = 0;
  loadingReceitas: boolean = false;
  modalReceitaAberto: boolean = false;
  modalEditarReceitaAberto: boolean = false;
  contas: Account[] = [];

  constructor(
    private dashboardService: DashboardService,
    private accountService: AccountService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.carregarContas();
    this.carregarReceitas();
  }

  /**
   * Carrega as contas do usuário
   */
  carregarContas(): void {
    this.accountService.getUserAccounts().subscribe({
      next: (contas) => {
        this.contas = contas;
      },
      error: (error) => {
        console.error('Erro ao carregar contas:', error);
      }
    });
  }

  /**
   * Carrega o total de receitas do backend
   */
  carregarReceitas(): void {
    this.loadingReceitas = true;

    this.dashboardService.getTotalReceitas().subscribe({
      next: (total) => {
        this.totalReceitas = total;
        this.loadingReceitas = false;
      },
      error: (error) => {
        console.error('Erro ao carregar receitas:', error);
        this.toastr.error('Erro ao carregar receitas');
        this.loadingReceitas = false;
      }
    });
  }

  /**
   * Abre o modal de adicionar receita
   */
  abrirModalReceita(): void {
    if (this.contas.length === 0) {
      this.toastr.warning('Você precisa ter pelo menos uma conta cadastrada');
      return;
    }

    const contasAtivas = this.contas.filter(c => c.active === 'ACTIVE');
    if (contasAtivas.length === 0) {
      this.toastr.warning('Você precisa ter pelo menos uma conta ativa');
      return;
    }

    this.modalReceitaAberto = true;
  }

  /**
   * Fecha o modal de adicionar receita
   */
  fecharModalReceita(): void {
    this.modalReceitaAberto = false;
  }

  /**
   * Abre o modal de editar receita
   */
  abrirModalEditarReceita(): void {
    if (this.contas.length === 0) {
      this.toastr.warning('Você precisa ter pelo menos uma conta cadastrada');
      return;
    }

    this.modalEditarReceitaAberto = true;
  }

  /**
   * Fecha o modal de editar receita
   */
  fecharModalEditarReceita(): void {
    this.modalEditarReceitaAberto = false;
  }

  /**
   * Callback quando a receita é adicionada
   */
  onReceitaAdicionada(): void {
    this.modalReceitaAberto = false;
    this.carregarReceitas();
  }

  /**
   * Callback quando a receita é editada
   */
  onReceitaEditada(): void {
    this.modalEditarReceitaAberto = false;
    this.carregarReceitas();
  }

  /**
   * Formata valor para moeda brasileira
   */
  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
