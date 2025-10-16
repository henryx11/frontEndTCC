import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Account } from '../../types/account.type';
import { Category } from '../../types/category.type';
import { Receita } from '../../types/receita.type';
import { ReceitaService } from '../../services/receita.service';
import { CategoryService } from '../../services/category.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-receita-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-receita-modal.component.html',
  styleUrls: ['./edit-receita-modal.component.scss']
})
export class EditReceitaModalComponent implements OnInit {
  @Input() contas: Account[] = [];
  @Output() fechar = new EventEmitter<void>();
  @Output() receitaEditada = new EventEmitter<void>();

  receitas: Receita[] = [];
  receitaSelecionada: Receita | null = null;
  editForm!: FormGroup;
  loading: boolean = false;
  loadingReceitas: boolean = false;
  loadingCategorias: boolean = false;
  categorias: Category[] = [];
  contasAtivas: Account[] = [];
  etapa: 'selecionar' | 'editar' = 'selecionar';

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
          const dateA = new Date(a.dateRegistration || '').getTime();
          const dateB = new Date(b.dateRegistration || '').getTime();
          return dateB - dateA; // Mais recente primeiro
        });
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
      registrationDate: formValue.data,
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
      const dateObj = new Date(data);
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
