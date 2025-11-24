import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInputComponent } from '../../components/primary-input/primary-imput.component';
import { Router } from '@angular/router';
import { PasswordResetService } from '../../services/password-reset.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  forgotPasswordForm!: FormGroup;
  isLoading: boolean = false;
  emailSent: boolean = false;

  constructor(
    private router: Router,
    private toastService: ToastrService,
    private passwordResetService: PasswordResetService
  ) {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }

  submit(): void {
    if (this.forgotPasswordForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.passwordResetService.forgotPassword(this.forgotPasswordForm.value.email).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        this.emailSent = true;
        this.toastService.success(data.message || 'Email enviado com sucesso!');

        // Após 5 segundos, volta para o login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 5000);
      },
      error: (data: any) => {
        this.isLoading = false;
        this.toastService.error(data?.error?.message || 'Erro ao enviar email');
      }
    });
  }

  navigate(): void {
    this.router.navigate(['/login']);
  }
}
