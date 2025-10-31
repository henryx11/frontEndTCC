import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { EditProfileModalComponent } from '../edit-profile-modal/edit-profile-modal.component';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-sidebar',
  imports: [FontAwesomeModule, CommonModule, EditProfileModalComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  faArrowLeft = faArrowLeft;
  userName: string | null = null;
  modalEditarPerfilAberto: boolean = false;

  constructor(
    private router: Router,
    private userService: UserService
  ) {
    this.carregarDadosUsuario();
  }

  /**
   * Carrega os dados do usuário do token
   */
  carregarDadosUsuario(): void {
    const userInfo = this.userService.getUserInfo();
    this.userName = userInfo?.name || null;
  }

  goToAccounts(): void {
    this.router.navigate(['/accounts-list']);
  }

  goToCreateAccount(): void {
    this.router.navigate(['/create-account']);
  }

  goToDashboard(): void {
    this.router.navigate(['/main-page']);
  }

  goToCreditCard(): void {
    this.router.navigate(['/credit-card']);
  }

  goToMissions(): void {
    this.router.navigate(['/missions']);
  }

  goToAchivements(): void {
    this.router.navigate(['/achievements']);
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Abre o modal de editar perfil
   */
  abrirModalEditarPerfil(): void {
    this.modalEditarPerfilAberto = true;
  }

  /**
   * Fecha o modal de editar perfil
   */
  fecharModalEditarPerfil(): void {
    this.modalEditarPerfilAberto = false;
  }

  /**
   * Callback quando o perfil é atualizado
   */
  /**
   * Callback quando o perfil é atualizado
   */
  onPerfilAtualizado(): void {
    console.log('🔄 Perfil atualizado - recarregando nome...'); // DEBUG
    this.modalEditarPerfilAberto = false;

    // Pequeno delay para garantir que o sessionStorage foi atualizado
    setTimeout(() => {
      this.carregarDadosUsuario();
      console.log('👤 Novo nome:', this.userName); // DEBUG
    }, 100);
  }


}
