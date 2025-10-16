import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Account } from '../../types/account.type';
import { Category } from '../../types/category.type';
import { ReceitaService } from '../../services/receita.service';
import { CategoryService } from '../../services/category.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-receita-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-receita-modal.component.html',
  styleUrls: ['./add-receita-modal.component.scss']
})
export class AddReceitaModalComponent implements OnInit {
  @Input() contas: Account[] = [];
  @Output() fechar = new EventEmitter<void>();
  @Output() receitaAdicionada = new EventEmitter<void>();

  receitaForm!: FormGroup;
  loading: boolean = false;
  loadingCategorias: boolean = false;
  categorias: Category[] = [];
  contasAtivas: Account[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private receitaService: ReceitaService,
    private categoryService: CategoryService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.filtrarContasAtivas();
    this.carregarCategorias();
    this.inicializarFormulario();
  }

  /**
   * Filtra apenas contas ativas
   */
  filtrarContasAtivas(): void {
    this.contasAtivas = this.contas.filter(conta => conta.active === 'ACTIVE');
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
   * Inicializa o formulário com validações
   */
  inicializarFormulario(): void {
    this.receitaForm = this.formBuilder.group({
      conta: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0.01)]],
      categoria: ['', Validators.required],
      descricao: ['', [Validators.required, Validators.minLength(3)]],
      data: [this.receitaService.getCurrentDate(), Validators.required]
    });
  }

  /**
   * Adiciona a receita
   */
  adicionarReceita(): void {
    if (this.receitaForm.invalid) {
      this.receitaForm.markAllAsTouched();
      return;
    }

    const formValue = this.receitaForm.value;

    const receitaData = {
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

    this.receitaService.createReceita(receitaData).subscribe({
      next: (response) => {
        this.toastr.success('Receita adicionada com sucesso!');
        this.receitaAdicionada.emit();
        this.fecharModal();
      },
      error: (error) => {
        console.error('Erro ao adicionar receita:', error);
        const mensagemErro = error?.error?.message || 'Erro ao adicionar receita. Tente novamente.';
        this.toastr.error(mensagemErro);
        this.loading = false;
      }
    });
  }

  /**
   * Fecha o modal
   */
  fecharModal(): void {
    this.fechar.emit();
  }
}
