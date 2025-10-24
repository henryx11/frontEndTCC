import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Account } from '../../types/account.type';
import { Category } from '../../types/category.type';
import { Receita } from '../../types/receita.type';
import { ReceitaService } from '../../services/receita.service';
import { CategoryService } from '../../services/category.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-receita-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './edit-receita-modal.component.html',
  styleUrls: ['./edit-receita-modal.component.scss']
})
export class EditReceitaModalComponent implements OnInit {
  @Input() contas: Account[] = [];
  @Output() fechar = new EventEmitter<void>();
  @Output() receitaEditada = new EventEmitter<void>();

  receitas: Receita[] = [];
  receitasFiltradas: Receita[] = [];
  receitaSelecionada: Receita | null = null;
  editForm!: FormGroup;
  loading: boolean = false;
  loadingReceitas: boolean = false;
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
    private receitaService: ReceitaService,
    private categoryService: CategoryService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.filtrarContasAtivas();
    this.carregarReceitas();
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

    // Valida se data início é menor que data fim (comparação de strings YYYY-MM-DD)
    if (this.dataInicio > this.dataFim) {
      this.toastr.error('Data inicial não pode ser maior que data final');
      return;
    }

    this.loadingReceitas = true;
    this.mostrarFiltroData = false;

    this.receitaService.buscarReceitasPorPeriodo(this.dataInicio, this.dataFim).subscribe({
      next: (receitas) => {
        this.receitasFiltradas = receitas.sort((a, b) => {
          // Comparação direta de strings YYYY-MM-DD (mais eficiente e sem problemas de timezone)
          const dateA = a.dateRegistration || '';
          const dateB = b.dateRegistration || '';
          return dateB.localeCompare(dateA); // Ordem decrescente (mais recente primeiro)
        });
        this.loadingReceitas = false;
        this.toastr.success(`${this.receitasFiltradas.length} receita(s) encontrada(s)`);
      },
      error: (error) => {
        console.error('Erro ao buscar receitas por período:', error);
        this.toastr.error('Erro ao buscar receitas');
        this.loadingReceitas = false;
      }
    });
  }

  /**
   * Limpa o filtro e recarrega todas as receitas
   */
  limparFiltro(): void {
    this.inicializarDatasDefault();
    this.mostrarFiltroData = false;
    this.carregarReceitas();
    this.toastr.info('Filtro removido');
  }

  /**
   * Filtra apenas contas ativas
   */
  filtrarContasAtivas(): void {
    this.contasAtivas = this.contas.filter(conta => conta.active === 'ACTIVE');
  }

  /**
   * Carrega todas as receitas do usuário
   */
  carregarReceitas(): void {
    this.loadingReceitas = true;
    this.receitaService.getAllReceitas().subscribe({
      next: (receitas) => {
        this.receitas = receitas.sort((a, b) => {
          // Comparação direta de strings YYYY-MM-DD
          const dateA = a.dateRegistration || '';
          const dateB = b.dateRegistration || '';
          return dateB.localeCompare(dateA);
        });
        this.receitasFiltradas = [...this.receitas];
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
   * Carrega as categorias de receitas do backend
   */
  carregarCategorias(): void {
    this.loadingCategorias = true;
    this.categoryService.getActiveIncomeCategories().subscribe({
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
   * Seleciona uma receita para editar
   */
  selecionarReceita(receita: Receita): void {
    this.receitaSelecionada = receita;
    this.etapa = 'editar';
    this.inicializarFormulario();
  }

  /**
   * Volta para a lista de receitas
   */
  voltarParaLista(): void {
    this.etapa = 'selecionar';
    this.receitaSelecionada = null;
  }

  /**
   * Inicializa o formulário com os dados da receita selecionada
   */
  inicializarFormulario(): void {
    if (!this.receitaSelecionada) return;

    this.editForm = this.formBuilder.group({
      conta: [this.receitaSelecionada.accounts.uuid, Validators.required],
      valor: [this.receitaSelecionada.value, [Validators.required, Validators.min(0.01)]],
      categoria: [this.receitaSelecionada.category.uuid, Validators.required],
      descricao: [this.receitaSelecionada.description, [Validators.required, Validators.minLength(3)]],
      data: [this.receitaService.formatDate(this.receitaSelecionada.dateRegistration), Validators.required]
    });
  }

  /**
   * Salva as alterações da receita
   */
  salvarEdicao(): void {
    if (this.editForm.invalid || !this.receitaSelecionada) {
      this.editForm.markAllAsTouched();
      return;
    }

    const formValue = this.editForm.value;

    const updateData = {
      value: parseFloat(formValue.valor),
      description: formValue.descricao,
      dateRegistration: formValue.data,
      accounts: {
        uuid: formValue.conta
      },
      category: {
        uuid: formValue.categoria
      }
    };

    this.loading = true;

    this.receitaService.updateReceita(this.receitaSelecionada.uuid, updateData).subscribe({
      next: (response) => {
        this.toastr.success('Receita atualizada com sucesso!');
        this.receitaEditada.emit();
        this.fecharModal();
      },
      error: (error) => {
        console.error('Erro ao atualizar receita:', error);
        const mensagemErro = error?.error?.message || 'Erro ao atualizar receita. Tente novamente.';
        this.toastr.error(mensagemErro);
        this.loading = false;
      }
    });
  }

  /**
   * Exclui a receita selecionada
   */
  excluirReceita(): void {
    if (!this.receitaSelecionada) return;

    // Confirmação antes de excluir
    if (!confirm(`Tem certeza que deseja excluir a receita "${this.receitaSelecionada.description}"?`)) {
      return;
    }

    this.loading = true;

    this.receitaService.deleteReceita(this.receitaSelecionada.uuid).subscribe({
      next: () => {
        this.toastr.success('Receita excluída com sucesso!');
        this.receitaEditada.emit();
        this.fecharModal();
      },
      error: (error) => {
        console.error('Erro ao excluir receita:', error);
        const mensagemErro = error?.error?.message || 'Erro ao excluir receita. Tente novamente.';
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
   * Formata data para exibição (CORRIGIDO - sem problemas de timezone)
   */
  formatarData(data: string | null): string {
    if (!data) return 'Data não informada';

    try {
      // Se já está no formato YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        const [year, month, day] = data.split('-');
        return `${day}/${month}/${year}`;
      }

      // Se vier com hora, extrai apenas a data
      if (data.includes('T')) {
        const [datePart] = data.split('T');
        const [year, month, day] = datePart.split('-');
        return `${day}/${month}/${year}`;
      }

      // Fallback com timezone forçado
      const dateObj = new Date(data + 'T12:00:00');
      return dateObj.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  }

  /**
   * Fecha o modal
   */
  fecharModal(): void {
    this.fechar.emit();
  }
}
