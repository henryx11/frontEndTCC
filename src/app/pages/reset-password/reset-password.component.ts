import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { PrimaryInputComponent } from '../../components/primary-input/primary-imput.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordResetService } from '../../services/password-reset.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    PrimaryInputComponent
  ],
  providers: [
    PasswordResetService
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  isLoading: boolean = false;
  validatingToken: boolean = true;
  isTokenValid: boolean = false;
  resetSuccess: boolean = false;
  private token: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastrService,
    private passwordResetService: PasswordResetService
  ) {
    this.resetPasswordForm = new FormGroup({
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Obtém o token da URL (formato: /reset-password/abc-123-def)
    this.token = this.route.snapshot.params['token'];

    console.log('Token recebido:', this.token);

    if (!this.token) {
      this.validatingToken = false;
      this.isTokenValid = false;
      this.toastService.error('Token não encontrado na URL');
      return;
    }

    // Como o backend não tem endpoint de validação, vamos considerar válido
    // A validação real acontecerá ao tentar resetar a senha
    this.validatingToken = false;
    this.isTokenValid = true;
  }

  /**
   * Validador customizado para verificar se as senhas coincidem
   */
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    if (newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  submit(): void {
    if (this.resetPasswordForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;

    const newPassword = this.resetPasswordForm.value.newPassword;

    console.log('Enviando reset com token:', this.token);

    this.passwordResetService.resetPassword(this.token, newPassword).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        this.resetSuccess = true;
        this.toastService.success(data.message || 'Senha redefinida com sucesso!');

        // Redireciona para o login após 3 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (data: any) => {
        this.isLoading = false;

        // Se o token for inválido/expirado, mostra o estado de erro
        if (data?.status === 400 || data?.status === 404) {
          this.isTokenValid = false;
        }

        this.toastService.error(data?.error?.message || 'Erro ao redefinir senha');
      }
    });
  }

  navigate(): void {
    this.router.navigate(['/login']);
  }
}
