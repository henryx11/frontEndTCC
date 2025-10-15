import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss']
})
export class EditProfileModalComponent implements OnInit {
  @Output() fechar = new EventEmitter<void>();
  @Output() perfilAtualizado = new EventEmitter<void>();

  profileForm!: FormGroup;
  loading: boolean = false;
  currentUserInfo: any = null;
  showPasswordFields: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUserInfo = this.userService.getUserInfo();
    this.inicializarFormulario();
  }

  /**
   * Inicializa o formulário com validações
   */
  inicializarFormulario(): void {
    this.profileForm = this.formBuilder.group({
      name: [this.currentUserInfo?.name || '', [Validators.minLength(2)]],
      phone: [this.currentUserInfo?.phone || '', [Validators.pattern(/^\d+$/)]],
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, {
      validators: this.passwordMatchValidator
    });

    // Monitora mudanças nos campos de senha
    this.profileForm.get('currentPassword')?.valueChanges.subscribe(value => {
      this.showPasswordFields = !!value;
      this.updatePasswordValidators();
    });
  }

  /**
   * Atualiza validadores de senha
   */
  updatePasswordValidators(): void {
    const currentPasswordControl = this.profileForm.get('currentPassword');
    const newPasswordControl = this.profileForm.get('newPassword');
    const confirmPasswordControl = this.profileForm.get('confirmPassword');

    if (currentPasswordControl?.value) {
      newPasswordControl?.setValidators([Validators.required, Validators.minLength(6)]);
      confirmPasswordControl?.setValidators([Validators.required]);
    } else {
      newPasswordControl?.setValidators([Validators.minLength(6)]);
      confirmPasswordControl?.clearValidators();
    }

    newPasswordControl?.updateValueAndValidity({ emitEvent: false });
    confirmPasswordControl?.updateValueAndValidity({ emitEvent: false });
  }

  /**
   * Validador customizado para verificar se as senhas coincidem
   */
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    const currentPassword = control.get('currentPassword')?.value;

    if (currentPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  /**
   * Verifica se as senhas coincidem
   */
  passwordsMatch(): boolean {
    const newPassword = this.profileForm.get('newPassword')?.value;
    const confirmPassword = this.profileForm.get('confirmPassword')?.value;
    return newPassword === confirmPassword;
  }

  /**
   * Atualiza o perfil
   */
  /**
   * Atualiza o perfil
   */
  /**
   * Atualiza o perfil
   */
  atualizarPerfil(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    // Validação adicional: se alterou senha, verificar se coincidem
    if (this.profileForm.get('currentPassword')?.value && !this.passwordsMatch()) {
      this.toastr.error('As senhas não coincidem');
      return;
    }

    const formValue = this.profileForm.value;
    const updateData: any = {};

    // Adiciona apenas os campos que foram preenchidos
    if (formValue.name && formValue.name !== this.currentUserInfo?.name) {
      updateData.name = formValue.name;
    }

    if (formValue.phone) {
      updateData.phone = formValue.phone;
    }

    // Se preencheu senha atual, valida e adiciona nova senha
    if (formValue.currentPassword) {
      if (!formValue.newPassword) {
        this.toastr.error('Informe a nova senha');
        return;
      }
      if (formValue.newPassword !== formValue.confirmPassword) {
        this.toastr.error('As senhas não coincidem');
        return;
      }
      updateData.password = formValue.newPassword;
    }

    // Verifica se há algo para atualizar
    if (Object.keys(updateData).length === 0) {
      this.toastr.warning('Nenhuma alteração foi feita');
      return;
    }

    // Adiciona o email (obrigatório no backend)
    updateData.email = this.currentUserInfo?.email;

    this.loading = true;

    this.userService.updateProfile(updateData).subscribe({
      next: (response) => {
        // ✅ SOLUÇÃO: Salva o novo nome no sessionStorage manualmente
        if (updateData.name) {
          this.userService.setUserName(updateData.name);
        }

        this.toastr.success('Perfil atualizado com sucesso!');
        this.perfilAtualizado.emit();
        this.fecharModal();
      },
      error: (error) => {
        console.error('Erro ao atualizar perfil:', error);
        const mensagemErro = error?.error?.message || 'Erro ao atualizar perfil. Tente novamente.';
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
