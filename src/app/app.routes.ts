import { authGuard } from './auth/guards/auth.guard';
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { AuthLayoutComponent } from './components/auth-layout-component/auth-layout.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { CreditCardComponent } from './pages/credit-card/credit-card.component';
import { CreateCardComponent } from './pages/create-card/create-card.component';
import { CreateAccountComponent } from './pages/create-account/create-account.component';
import { AccountsListComponent } from './pages/accounts-list/accounts-list.component';
import { AccountStatementComponent } from './pages/account-statement/account-statement.component';
import { AddItemCreditcardBillComponent } from './pages/add-item-creditcard-bill/add-item-creditcard-bill.component';
import { MissionsComponent } from './pages/missions/missions.component';
import { AchivementsComponent } from './pages/achivements/achivements.component';

// ✅ NOVOS IMPORTS - Componentes de Recuperação de Senha
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },

      // ✅ NOVAS ROTAS - Recuperação de Senha
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password/:token', component: ResetPasswordComponent }
    ]
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard], // Protege todas as rotas filhas
    children: [
      { path: 'main-page', component: MainPageComponent },
      { path: 'credit-card', component: CreditCardComponent },
      { path: 'create-account', component: CreateAccountComponent },
      { path: 'accounts-list', component: AccountsListComponent },
      { path: 'account-statement/:id', component: AccountStatementComponent },
      { path: 'create-card', component: CreateCardComponent },
      { path: 'edit-card/:uuid', component: CreateCardComponent },
      { path: 'add-item-bill', component: AddItemCreditcardBillComponent },
      { path: 'missions', component: MissionsComponent },
      { path: 'achievements', component: AchivementsComponent }
    ]
  },

  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
