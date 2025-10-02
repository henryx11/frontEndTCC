import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-sidebar',
  imports: [FontAwesomeModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  faArrowLeft = faArrowLeft;
  userName: string | null = null;

  constructor(private router: Router) {
    const token = sessionStorage.getItem('auth-token');
    if (token) {
      try {
        const payload = jwtDecode<{ name: string }>(token);
        this.userName = payload.name;
      } catch {
        this.userName = null;
      }
    }
  }

  goToAccounts() {  // ADICIONE ESTE MÉTODO
    this.router.navigate(['/accounts-list']);
  }

  goToCreateAccount() {
    this.router.navigate(['/create-account']);
  }

  goToDashboard() {
    this.router.navigate(['/main-page']);
  }

  goToCreditCard() {
    this.router.navigate(['/credit-card']);
  }

  logout() {
    sessionStorage.removeItem('auth-token');
    this.router.navigate(['/auth/login']);
  }
}
