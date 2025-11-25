// src/app/components/edit-despesa-modal/edit-despesa-modal.component.ts

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Account } from '../../types/account.type';
import { Category } from '../../types/category.type';
import { Despesa } from '../../types/despesa.type';
import { DespesaService } from '../../services/despesa.service';
import { CategoryService } from '../../services/category.service';
import { ToastrService } from 'ngx-toastr';
import { TransactionEventsService } from '../../services/transaction-events.service';

@Component({
  selector: 'app-edit-despesa-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './edit-despesa-modal.component.html',
  styleUrls: ['./edit-despesa-modal.component.scss']
})
export class EditDespesaModalComponent implements OnInit {
  @Input() contas: Account[] = [];
  @Output() fechar = new EventEmitter<void>();
  @Output() despesaEditada = new EventEmitter<void>();

  despesas: Despesa[] = [];
  despesasFiltradas: Despesa[] = [];
  despesaSelecionada: Despesa | null = null;
  editForm!: FormGroup;
  loading: boolean = false;
  loadingDespesas: boolean = false;
  loadingCategorias: boolean = false;
  categorias: Category[] = [];
  contasAtivas: Account[] = [];
  etapa: 'selecionar' | 'editar' = 'selecionar';

  // Filtros
  dataInicio: string = '';
  dataFim: string = '';
  mostrarFiltroData: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private despesaService: DespesaService,
    private categoryService: CategoryService,
    private toastr: ToastrService,
    private transactionEvents: TransactionEventsService
  ) {}

  ngOnInit(): void {
    this.filtrarContasAtivas();
    this.carregarDespesas();
    this.carregarCategorias();
    this.inicializarDatasDefault();
  }

  /**
   * Inicializa as datas padrão (últimos 30 dias)
   */
  inicializarDatasDefault(): void {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);

    this.dataFim = this.formatarDataParaInput(hoje);
    this.dataInicio = this.formatarDataParaInput(trintaDiasAtras);
  }

  /**
   * Formata data para o input type="date" (YYYY-MM-DD)
   */
  formatarDataParaInput(data: Date): string {
    const year = data.getFullYear();
    const month = String(data.getMonth() + 1).padStart(2, '0');
    const day = String(data.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Alterna exibição do filtro de data
   */
  toggleFiltroData(): void {
    this.mostrarFiltroData = !this.mostrarFiltroData;
  }

  /**
   * Aplica o filtro de data buscando do backend
   */
  aplicarFiltro(): void {
    if (!this.dataInicio || !this.dataFim) {
      this.toastr.warning('Selecione o período inicial e final');
      return;
    }

    if (this.dataInicio > this.dataFim) {
      this.toastr.error('Data inicial não pode ser maior que data final');
      return;
    }

    this.loadingDespesas = true;
    this.mostrarFiltroData = false;

    this.despesaService.buscarDespesasPorPeriodo(this.dataInicio, this.dataFim).subscribe({
      next: (despesas) => {
        this.despesasFiltradas = despesas.sort((a, b) => {
          const dateA = a.dateRegistration || '';
          const dateB = b.dateRegistration || '';
          return dateB.localeCompare(dateA);
        });
        this.loadingDespesas = false;
        this.toastr.success(`${this.despesasFiltradas.length} despesa(s) encontrada(s)`);
      },
      error: (error) => {
        console.error('Erro ao buscar despesas por período:', error);
        this.toastr.error('Erro ao buscar despesas');
        this.loadingDespesas = false;
      }
    });
  }

  /**
   * Limpa o filtro e recarrega todas as despesas
   */
  limparFiltro(): void {
    this.inicializarDatasDefault();
    this.mostrarFiltroData = false;
    this.carregarDespesas();
    this.toastr.info('Filtro removido');
  }

  /**
   * Filtra apenas contas ativas
   */
  filtrarContasAtivas(): void {
    this.contasAtivas = this.contas.filter(conta => conta.active === 'ACTIVE');
  }

  /**
   * Carrega todas as despesas do usuário
   */
  carregarDespesas(): void {
    this.loadingDespesas = true;
    this.despesaService.getAllDespesas().subscribe({
      next: (despesas) => {
        this.despesas = despesas.sort((a, b) => {
          const dateA = a.dateRegistration || '';
          const dateB = b.dateRegistration || '';
          return dateB.localeCompare(dateA);
        });
        this.despesasFiltradas = [...this.despesas];
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
   * Carrega as categorias de despesas do backend
   */
  carregarCategorias(): void {
    this.loadingCategorias = true;
    this.categoryService.getActiveExpenseCategories().subscribe({
      next: (categories) => {
        this.categorias = this.categoryService.addIconsToCategories(categories);
        this.loadingCategorias = false;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        this.toastr.error('Erro ao carregar categorias');
        this.loadingCategorias = false;
      }
    });
  }

  /**
   * Seleciona uma despesa para editar
   */
  selecionarDespesa(despesa: Despesa): void {
    this.despesaSelecionada = despesa;
    this.etapa = 'editar';
    this.inicializarFormulario();
  }

  /**
   * Volta para a lista de despesas
   */
  voltarParaLista(): void {
    this.etapa = 'selecionar';
    this.despesaSelecionada = null;
  }

  /**
   * Inicializa o formulário com os dados da despesa selecionada
   */
  inicializarFormulario(): void {
    if (!this.despesaSelecionada) return;

    this.editForm = this.formBuilder.group({
      conta: [this.despesaSelecionada.accounts.uuid, Validators.required],
      valor: [this.despesaSelecionada.value, [Validators.required, Validators.min(0.01)]],
      categoria: [this.despesaSelecionada.category.uuid, Validators.required],
      descricao: [this.despesaSelecionada.description, [Validators.required, Validators.minLength(3)]],
      data: [this.despesaService.formatDate(this.despesaSelecionada.dateRegistration), Validators.required]
    });
  }

  /**
   * Salva as alterações da despesa
   */
  salvarEdicao(): void {
    if (this.editForm.invalid || !this.despesaSelecionada) {
      this.editForm.markAllAsTouched();
      return;
    }

    const formValue = this.editForm.value;

    // Converter data de DD/MM/YYYY para YYYY-MM-DD
    const dataConvertida = this.converterDataParaBackend(formValue.data);

    const updateData = {
      value: parseFloat(formValue.valor),
      description: formValue.descricao,
      dateRegistration: dataConvertida,
      accounts: {
        uuid: formValue.conta
      },
      category: {
        uuid: formValue.categoria
      }
    };

    this.loading = true;

    this.despesaService.updateDespesa(this.despesaSelecionada.uuid, updateData).subscribe({
      next: (response) => {
        this.toastr.success('Despesa atualizada com sucesso!');
        this.transactionEvents.despesaEditada();
        this.despesaEditada.emit();
        this.fecharModal();
      },
      error: (error) => {
        console.error('Erro ao atualizar despesa:', error);
        const mensagemErro = error?.error?.message || 'Erro ao atualizar despesa. Tente novamente.';
        this.toastr.error(mensagemErro);
        this.loading = false;
      }
    });
  }

  /**
   * Exclui a despesa selecionada
   */
  excluirDespesa(): void {
    if (!this.despesaSelecionada) return;

    if (!confirm(`Tem certeza que deseja excluir a despesa "${this.despesaSelecionada.description}"?`)) {
      return;
    }

    this.loading = true;

    this.despesaService.deleteDespesa(this.despesaSelecionada.uuid).subscribe({
      next: () => {
        this.toastr.success('Despesa excluída com sucesso!');
        this.transactionEvents.despesaDeletada();
        this.despesaEditada.emit();
        this.fecharModal();
      },
      error: (error) => {
        console.error('Erro ao excluir despesa:', error);
        const mensagemErro = error?.error?.message || 'Erro ao excluir despesa. Tente novamente.';
        this.toastr.error(mensagemErro);
        this.loading = false;
      }
    });
  }

  /**
   * Formata valor para exibição
   */
  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Formata data para exibição
   */
  formatarData(data: string | null): string {
    if (!data) return 'Data não informada';

    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        const [year, month, day] = data.split('-');
        return `${day}/${month}/${year}`;
      }

      if (data.includes('T')) {
        const [datePart] = data.split('T');
        const [year, month, day] = datePart.split('-');
        return `${day}/${month}/${year}`;
      }

      const dateObj = new Date(data + 'T12:00:00');
      return dateObj.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  }

  /**
   * Converte data de DD/MM/YYYY para YYYY-MM-DD e ajusta timezone
   */
  private converterDataParaBackend(data: string): string {
    if (!data) return '';

    // Se já estiver em YYYY-MM-DD, apenas ajustar
    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      const date = new Date(data + 'T12:00:00');
      date.setDate(date.getDate() + 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Converter de DD/MM/YYYY para YYYY-MM-DD
    const [day, month, year] = data.split('/');
    const date = new Date(`${year}-${month}-${day}T12:00:00`);
    date.setDate(date.getDate() + 1);

    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    const newDay = String(date.getDate()).padStart(2, '0');

    return `${newYear}-${newMonth}-${newDay}`;
  }

  /**
   * Fecha o modal
   */
  fecharModal(): void {
    this.fechar.emit();
  }
}
