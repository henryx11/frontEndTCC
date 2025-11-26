import { Component } from '@angular/core';
import { DefaultLoginLayoutComponent } from '../../components/default-login-layout/default-login-layout.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimaryInputComponent } from '../../components/primary-input/primary-imput.component';
import { Route, Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ToastrService } from 'ngx-toastr';

interface signupForm {
  name: FormControl,
  email: FormControl,
  number: FormControl,
  password: FormControl,
  passwordConfirm: FormControl
}

@Component({
  selector: 'app-signup',
  imports: [
    DefaultLoginLayoutComponent,
    ReactiveFormsModule,
    PrimaryInputComponent
  ],
  providers: [
    LoginService
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'  // ✅ CORRIGIDO: singular
})
export class SignupComponent {
  signupForm!: FormGroup<signupForm>;

  constructor(
    private router: Router,
    private toastService: ToastrService,
    private loginService: LoginService
  ){
    this.signupForm=new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      number: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwordConfirm: new FormControl('', [Validators.required, Validators.minLength(6)]),
    })
  }

  submit() {
    if (this.signupForm.invalid) {
      this.toastService.error("Preencha todos os campos corretamente.");
      return;
    }

    if (this.signupForm.value.password !== this.signupForm.value.passwordConfirm) {
      this.toastService.error("As senhas não coincidem.");
      return;
    }

    const { name, email, number, password } = this.signupForm.value;

    this.loginService.register({ name, email, number, password }).subscribe({
      next: (data: any) => this.toastService.success(data.message),
      error: (data: any) => this.toastService.error(data?.error?.message),
    });
  }

  navigate() {
    this.router.navigate(['/login']);
  }
}
