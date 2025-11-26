import { Component, OnInit, OnDestroy } from '@angular/core'; // ✅ Adicione OnDestroy
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { AccountService } from '../../services/account.service';
import { AccountEventsService } from '../../services/account-events.service'; // ✅ NOVO
import { ToastrService } from 'ngx-toastr';
import { AddReceitaModalComponent } from '../../components/add-receita-modal/add-receita-modal.component';
import { EditReceitaModalComponent } from '../../components/edit-receita-modal/edit-receita-modal.component';
import { AddDespesaModalComponent } from '../../components/add-despesa-modal/add-despesa-modal.component';
import { EditDespesaModalComponent } from '../../components/edit-despesa-modal/edit-despesa-modal.component';
import { ChartsComponent } from '../../components/charts/charts.component';
import { Account } from '../../types/account.type';
import { Subscription } from 'rxjs'; // ✅ NOVO

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    AddReceitaModalComponent,
    EditReceitaModalComponent,
    AddDespesaModalComponent,
    EditDespesaModalComponent,
    ChartsComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit, OnDestroy { // ✅ Implemente OnDestroy
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
  Math = Math;

  // ✅ NOVO: Subscription para o evento de contas
  private accountSubscription?: Subscription;

  constructor(
    private dashboardService: DashboardService,
    private accountService: AccountService,
    private accountEvents: AccountEventsService, // ✅ NOVO
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.carregarContas();
    this.carregarReceitas();
    this.carregarDespesas();
    this.carregarSaldoTotal();

    // ✅ NOVO: Escuta eventos de modificação de contas
    this.accountSubscription = this.accountEvents.onAccountChanged.subscribe(() => {
      console.log('🔔 Dashboard recebeu evento de conta modificada - recarregando dados...');
      this.carregarReceitas();
      this.carregarDespesas();
      this.carregarSaldoTotal();
    });
  }

  // ✅ NOVO: Limpa a subscription ao destruir o componente
  ngOnDestroy(): void {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
  }

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

  carregarReceitas(): void {
    this.loadingReceitas = true;

    this.dashboardService.getTotalReceitasContasAtivas().subscribe({
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

  // ... resto dos métodos permanecem iguais ...
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

  fecharModalReceita(): void {
    this.modalReceitaAberto = false;
  }

  abrirModalEditarReceita(): void {
    if (this.contas.length === 0) {
      this.toastr.warning('Você precisa ter pelo menos uma conta cadastrada');
      return;
    }

    this.modalEditarReceitaAberto = true;
  }

  fecharModalEditarReceita(): void {
    this.modalEditarReceitaAberto = false;
  }

  onReceitaAdicionada(): void {
    this.modalReceitaAberto = false;
    this.carregarReceitas();
    this.carregarSaldoTotal();
  }

  onReceitaEditada(): void {
    this.modalEditarReceitaAberto = false;
    this.carregarReceitas();
    this.carregarSaldoTotal();
  }

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

  fecharModalDespesa(): void {
    this.modalDespesaAberto = false;
  }

  abrirModalEditarDespesa(): void {
    if (this.contas.length === 0) {
      this.toastr.warning('Você precisa ter pelo menos uma conta cadastrada');
      return;
    }

    this.modalEditarDespesaAberto = true;
  }

  fecharModalEditarDespesa(): void {
    this.modalEditarDespesaAberto = false;
  }

  onDespesaAdicionada(): void {
    this.modalDespesaAberto = false;
    this.carregarDespesas();
    this.carregarSaldoTotal();
  }

  onDespesaEditada(): void {
    this.modalEditarDespesaAberto = false;
    this.carregarDespesas();
    this.carregarSaldoTotal();
  }

  formatarMoeda(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
