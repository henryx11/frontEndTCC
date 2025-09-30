import {RouterModule, Routes} from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import {MainPageComponent} from './pages/main-page/main-page.component';
import {AuthLayoutComponent} from './components/auth-layout-component/auth-layout.component';
import {MainLayoutComponent} from './components/main-layout/main-layout.component';
import { CreditCardComponent } from './pages/credit-card/credit-card.component'
import { CreateCardComponent } from './pages/create-card/create-card.component';
import { CreateAccountComponent } from './pages/create-account/create-account.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },
      { path: 'create-card', component: CreateCardComponent }
    ]
  },

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'main-page', component: MainPageComponent },
      { path: 'credit-card', component: CreditCardComponent },
      { path: 'create-account', component: CreateAccountComponent }
    ]
  },

  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
