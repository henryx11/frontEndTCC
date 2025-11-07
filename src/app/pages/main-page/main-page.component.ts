// src/app/pages/main-page/main-page.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { AccountService } from '../../services/account.service';
import { ToastrService } from 'ngx-toastr';
import { AddReceitaModalComponent } from '../../components/add-receita-modal/add-receita-modal.component';
import { EditReceitaModalComponent } from '../../components/edit-receita-modal/edit-receita-modal.component';
import { AddDespesaModalComponent } from '../../components/add-despesa-modal/add-despesa-modal.component';
import { EditDespesaModalComponent } from '../../components/edit-despesa-modal/edit-despesa-modal.component';
import { ChartsComponent } from '../../components/charts/charts.component'; // ← NOVO: Import do componente de gráficos
import { Account } from '../../types/account.type';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    AddReceitaModalComponent,
    EditReceitaModalComponent,
    AddDespesaModalComponent,
    EditDespesaModalComponent,
    ChartsComponent // ← NOVO: Adiciona o componente de gráficos
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit {
  totalReceitas: number = 0;
  totalDespesas: number = 0;
  saldoTotal: number = 0;
  loadingReceitas: boolean = false;
  loadingDespesas: boolean = false;
  loadingSaldo: boolean = false;
  modalReceitaAberto: boolean = false;
  modalEditarReceitaAberto: boolean = false;
  modalDespesaAberto: boolean = false;
  modalEditarDespesaAberto: boolean = false;
  contas: Account[] = [];
  Math = Math; // Para usar Math.abs() no template

  constructor(
    private dashboardService: DashboardService,
    private accountService: AccountService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.carregarContas();
    this.carregarReceitas();
    this.carregarDespesas();
    this.carregarSaldoTotal();
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
   * Carrega o total de despesas do backend
   */
  carregarDespesas(): void {
    this.loadingDespesas = true;

    this.dashboardService.getTotalDespesas().subscribe({
      next: (total) => {
        this.totalDespesas = total;
        this.loadingDespesas = false;
      },
      error: (error) => {
        console.error('Erro ao carregar despesas:', error);
        this.toastr.error('Erro ao carregar despesas');
        this.loadingDespesas = false;
      }
    });
  }

  /**
   * Carrega o saldo total de todas as contas
   */
  carregarSaldoTotal(): void {
    this.loadingSaldo = true;

    this.dashboardService.getSaldoTotal().subscribe({
      next: (total) => {
        this.saldoTotal = total;
        this.loadingSaldo = false;
      },
      error: (error) => {
        console.error('Erro ao carregar saldo total:', error);
        this.toastr.error('Erro ao carregar saldo total');
        this.loadingSaldo = false;
      }
    });
  }

  // ============ RECEITAS ============

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
    this.carregarSaldoTotal();
  }

  /**
   * Callback quando a receita é editada
   */
  onReceitaEditada(): void {
    this.modalEditarReceitaAberto = false;
    this.carregarReceitas();
    this.carregarSaldoTotal();
  }

  // ============ DESPESAS ============

  /**
   * Abre o modal de adicionar despesa
   */
  abrirModalDespesa(): void {
    if (this.contas.length === 0) {
      this.toastr.warning('Você precisa ter pelo menos uma conta cadastrada');
      return;
    }

    const contasAtivas = this.contas.filter(c => c.active === 'ACTIVE');
    if (contasAtivas.length === 0) {
      this.toastr.warning('Você precisa ter pelo menos uma conta ativa');
      return;
    }

    this.modalDespesaAberto = true;
  }

  /**
   * Fecha o modal de adicionar despesa
   */
  fecharModalDespesa(): void {
    this.modalDespesaAberto = false;
  }

  /**
   * Abre o modal de editar despesa
   */
  abrirModalEditarDespesa(): void {
    if (this.contas.length === 0) {
      this.toastr.warning('Você precisa ter pelo menos uma conta cadastrada');
      return;
    }

    this.modalEditarDespesaAberto = true;
  }

  /**
   * Fecha o modal de editar despesa
   */
  fecharModalEditarDespesa(): void {
    this.modalEditarDespesaAberto = false;
  }

  /**
   * Callback quando a despesa é adicionada
   */
  onDespesaAdicionada(): void {
    this.modalDespesaAberto = false;
    this.carregarDespesas();
    this.carregarSaldoTotal();
  }

  /**
   * Callback quando a despesa é editada
   */
  onDespesaEditada(): void {
    this.modalEditarDespesaAberto = false;
    this.carregarDespesas();
    this.carregarSaldoTotal();
  }

  // ============ UTILITÁRIOS ============

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
