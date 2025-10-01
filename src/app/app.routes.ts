import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { AuthLayoutComponent } from './components/auth-layout-component/auth-layout.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { CreateBankAccountComponent } from './pages/create-bank-account/create-bank-account.component';
import { CreditCardComponent } from './pages/credit-card/credit-card.component';
import { CreateCardComponent } from './pages/create-card/create-card.component';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'create-bank-account', component: CreateBankAccountComponent },
      { path: 'create-card', component: CreateCardComponent }
    ]
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard], // Protege todas as rotas filhas
    children: [
      { path: 'main-page', component: MainPageComponent },
      { path: 'credit-card', component: CreditCardComponent }
    ]
  },

  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
